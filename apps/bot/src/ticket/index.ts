import type { Guild, GuildMember, TextChannel } from "discord.js";
import { Logger } from "@robo/logger";
import { SettingsRepository, TicketRepository } from "@robo/db";
import { resolvePlaces, t, type TicketAction, type TicketPlaces, resolveLifecycle, durationText, withoutEmojiTags, withStaffRoles } from "@robo/shared";
import { canUse, isOneOf, isStaff, ticketOverwrites } from "@/Permissions";
import { TicketAuditService } from "./TicketAuditService";
import { channelSlug, TicketDiscordAdapter } from "./TicketDiscordAdapter";
import { answersPayload, closedPayload, comePayload, noticeText, sleepPayloads, ticketVars, varsOf, welcomePayload } from "./TicketEmbed";
import { renderMessage, type Payload, type Vars } from "@/lib/messagePayload";
import { TicketStateMachine } from "./TicketState";
import { archiveTicket } from "./transcript/archive";
import { sendClaimPoints } from "./staffPoints";
import type { TicketContext } from "./types";
import { overLimit } from "./utils";

// Everything a ticket can go through, independent of how it was asked for (a panel button, a control, a command). Each
// returns the one line to answer with, in the server's language. Channels and categories cascade: the ticket option's
// own choice, else its panel's, else the server's.

const repo = new TicketRepository();
const settingsRepo = new SettingsRepository();
const audit = new TicketAuditService();
const discord = new TicketDiscordAdapter();
const state = new TicketStateMachine();

export type Result = { ok: boolean; text: string; files?: { attachment: Buffer; name: string }[]; /** A designed message to post instead of `text`. */ payload?: Payload };
const ok = (text: string): Result => ({ ok: true, text });
const no = (text: string): Result => ({ ok: false, text });
const mention = (id: string) => `<@${id}>`;

/** After a control: the option's designed message when it has one (embed or components), else the one-line notice. */
function noticeOk(ctx: TicketContext, action: TicketAction, vars: Vars, who: { staff: string; member?: string; name?: string }, builtIn?: Parameters<typeof noticeText>[4]): Result {
    const item = ctx.option?.controls.items[action];
    if (item?.noticeStyle === "design" && !builtIn) {
        return { ok: true, text: "", payload: renderMessage(item.noticeDesign, { ...vars, staff: who.staff, member: who.member ?? "", name: who.name ?? "" }, [], { users: [], roles: [] }) };
    }
    return ok(noticeText(ctx, action, vars, who, builtIn));
}

/** The checks every control shares: may this member do this, and does the ticket's state allow it? */
export function check(member: GuildMember, ctx: TicketContext, action: TicketAction): Result | null {
    const locale = ctx.settings.general.language;
    if (!canUse(member, ctx, action)) return no(t(locale, "deny"));
    const s = state.allows(ctx.ticket, action);
    if (s === "closed") return no(t(locale, "closed.already"));
    if (s === "open") return no(t(locale, "open.already"));
    return null;
}

/** Where this ticket's things go (its option, else its panel, else the server). */
export function placesOf(ctx: TicketContext): TicketPlaces {
    const g = ctx.settings.general;
    return ctx.panel && ctx.option ? resolvePlaces(g, ctx.panel, ctx.option) : { categoryId: g.categoryId, closedCategoryId: g.closedCategoryId, logChannelId: g.logChannelId, transcriptChannelId: g.transcriptChannelId };
}

const peopleOf = (ctx: TicketContext, closed = ctx.ticket.status === "closed") => ({
    ownerId: ctx.ticket.ownerId,
    claimerId: ctx.ticket.claimerId ?? null,
    addedIds: ctx.ticket.addedIds,
    closed,
});

async function refreshPermissions(channel: TextChannel, ctx: TicketContext, closed?: boolean) {
    if (ctx.option) await discord.setOverwrites(channel, ticketOverwrites(channel.guild, ctx.option, peopleOf(ctx, closed)));
}

/** Last !come per ticket channel, for the wait between two calls. */
const lastCome = new Map<string, number>();

export class TicketServices {
    /** Opens a ticket of a panel's option for this member (after its questions, when it has some). */
    async open(guild: Guild, member: GuildMember, panelId: string, optionId: string, answers: { question: string; answer: string }[] = []): Promise<Result> {
        const s = await settingsRepo.get(guild.id);
        const locale = s.general.language;
        const panel = s.panels.find((p) => p.id === panelId);
        const found = panel?.options.find((o) => o.id === optionId);
        if (!panel || !found) return no(t(locale, "open.gone"));
        // Support and manager roles: the option's, else the panel's, else the server's (or none).
        const option = withStaffRoles(s.general, panel, found);
        if (!option.enabled) return no(t(locale, "open.disabled"));
        const places = resolvePlaces(s.general, panel, option);
        if (places.blacklistRoleIds.some((id) => member.roles.cache.has(id))) return no(t(locale, "open.blacklisted"));
        const open = await overLimit(guild.id, member.id, option);
        if (open) return no(t(locale, "open.limit", { count: open.length, channels: open.map((id) => `<#${id}>`).join(" ") }));

        const number = await settingsRepo.nextNumber(guild.id);
        const vars = ticketVars(guild, member, option, number);
        const pattern = option.channelName || "ticket-{number}";
        // Server emoji tags (<a:name:id>) would land in the name as long text: names keep only words.
        const name = channelSlug(withoutEmojiTags(pattern.replace(/\{(\w+)\}/g, (m, k: string) => (k === "user" || k === "username" ? member.user.username : vars[k] ?? m))));
        const overwrites = ticketOverwrites(guild, option, { ownerId: member.id, claimerId: null, addedIds: [] });
        const channel = await discord.createChannel(guild, name, places.categoryId, overwrites, `${withoutEmojiTags(option.label)} · ${member.user.username}`);
        if (!channel) return no(t(locale, "open.failed"));
        vars.channel = `<#${channel.id}>`;

        await repo.create({ guildId: guild.id, channelId: channel.id, channelName: channel.name, number, panelId, panelName: panel.name, optionId, optionLabel: option.label, ownerId: member.id, answers });
        await channel.send(welcomePayload(option, vars, member.id) as never).catch((e) => Logger.error(`[Ticket] welcome in ${channel.id}`, e));
        if (answers.length) await channel.send(answersPayload(locale, member.id, answers) as never).catch(() => null);
        await audit.log(guild, places.logChannelId, "log.opened", { user: mention(member.id), channel: `<#${channel.id}>`, option: option.label });
        Logger.success(`Ticket #${number} opened in ${guild.id} by ${member.id}`);
        return ok(t(locale, "open.created", { channel: `<#${channel.id}>` }));
    }

    /** Closes: the closed permissions, the closed category, the closed message, the log and the transcript. */
    async close(channel: TextChannel, member: GuildMember, ctx: TicketContext, reason: string | null): Promise<Result> {
        const locale = ctx.settings.general.language;
        const places = placesOf(ctx);
        const updated = await repo.update(channel.id, { status: "closed", closedAt: new Date(), closedBy: member.id, closeReason: reason });
        await refreshPermissions(channel, { ...ctx, ticket: updated ?? ctx.ticket }, true);
        await discord.move(channel, places.closedCategoryId);
        if (ctx.option) await channel.send(closedPayload(locale, ctx.option, await varsOf(channel.guild, ctx), member.id, reason) as never).catch((e) => Logger.warn(`[Ticket] closed message: ${e}`));
        await audit.log(channel.guild, places.logChannelId, "log.closed", { user: mention(member.id), name: channel.name });
        await archiveTicket(channel.guild, channel.id, { post: true }).catch((e) => Logger.error(`[Ticket] transcript of ${channel.id}`, e));
        // Auto-delete: remember when, and say so in the ticket (the sweep deletes it, even after a restart).
        const life = resolveLifecycle(ctx.settings.general, ctx.option);
        if (life.autoDeleteSeconds > 0) {
            await repo.update(channel.id, { deleteAt: new Date(Date.now() + life.autoDeleteSeconds * 1000) });
            await channel.send({ content: t(locale, "autodelete", { time: durationText(life.autoDeleteSeconds, locale) }), allowedMentions: { parse: [] } }).catch(() => null);
        }
        return ok(reason ? t(locale, "closed.reason", { user: mention(member.id), reason }) : t(locale, "closed.notice", { user: mention(member.id) }));
    }

    /** Reopens: the open permissions again, and back to the ticket category if it was moved when closing. */
    async reopen(channel: TextChannel, member: GuildMember, ctx: TicketContext): Promise<Result> {
        const places = placesOf(ctx);
        const updated = await repo.update(channel.id, { status: "open", closedAt: null, closedBy: null, closeReason: null, deleteAt: null });
        await refreshPermissions(channel, { ...ctx, ticket: updated ?? ctx.ticket }, false);
        if (places.closedCategoryId && channel.parentId === places.closedCategoryId) await discord.move(channel, places.categoryId);
        await audit.log(channel.guild, places.logChannelId, "log.reopened", { user: mention(member.id), channel: `<#${channel.id}>` });
        return noticeOk(ctx, "reopen", await varsOf(channel.guild, ctx), { staff: mention(member.id) });
    }

    /** Deletes the channel after the option's wait; an open ticket's transcript is saved first. */
    async delete(channel: TextChannel, member: GuildMember, ctx: TicketContext): Promise<Result> {
        const locale = ctx.settings.general.language;
        const seconds = ctx.option?.controls.items.delete.delay ?? 5;
        const life = resolveLifecycle(ctx.settings.general, ctx.option);
        if (ctx.ticket.status === "open") {
            await repo.update(channel.id, { status: "closed", closedAt: new Date(), closedBy: member.id, closeReason: "deleted" });
            if (life.transcriptOnDelete) await archiveTicket(channel.guild, channel.id, { post: true }).catch(() => null);
        } else if (life.transcriptOnDelete) {
            // Closed already: save it again so it has what was said after closing (same link, no second post).
            await archiveTicket(channel.guild, channel.id, { post: false }).catch(() => null);
        }
        // A backup for the timer below: if the bot restarts during the wait, the auto-delete sweep removes it instead.
        await repo.update(channel.id, { deleteAt: new Date(Date.now() + seconds * 1000 + 60_000) });
        await audit.log(channel.guild, placesOf(ctx).logChannelId, "log.deleted", { user: mention(member.id), name: channel.name });
        setTimeout(() => void discord.deleteChannel(channel), seconds * 1000);
        const custom = ctx.option?.controls.items.delete.notice.trim();
        if (custom) return noticeOk(ctx, "delete", await varsOf(channel.guild, ctx), { staff: mention(member.id) });
        return ok(seconds > 0 ? t(locale, "deleting", { seconds }) : t(locale, "deleting.now"));
    }

    /** Claims the ticket; the claimer pressing again unclaims it. */
    async claim(channel: TextChannel, member: GuildMember, ctx: TicketContext): Promise<Result> {
        const locale = ctx.settings.general.language;
        const current = ctx.ticket.claimerId;
        if (current && current !== member.id) return no(t(locale, "claimed.other", { user: mention(current) }));
        const claimerId = current === member.id ? null : member.id;
        const updated = await repo.update(channel.id, { claimerId });
        if (claimerId) await repo.addParticipant(channel.id, member.id, "claimer");
        await refreshPermissions(channel, { ...ctx, ticket: updated ?? ctx.ticket });
        if (claimerId) await audit.log(channel.guild, placesOf(ctx).logChannelId, "log.claimed", { user: mention(member.id), channel: `<#${channel.id}>` });
        // Robtic Staff link: points for the claim (in the background; the claim never waits for it).
        if (claimerId) void sendClaimPoints(ctx.settings, channel.guild.id, member.id, { channelId: channel.id, number: ctx.ticket.number });
        return noticeOk(ctx, "claim", await varsOf(channel.guild, ctx), { staff: mention(member.id) }, claimerId ? undefined : "unclaimed");
    }

    async rename(channel: TextChannel, member: GuildMember, ctx: TicketContext, name: string): Promise<Result> {
        const slug = channelSlug(name);
        if (!(await discord.rename(channel, slug))) return no(t(ctx.settings.general.language, "rename.slow"));
        return noticeOk(ctx, "rename", await varsOf(channel.guild, ctx), { staff: mention(member.id), name: slug });
    }

    async add(channel: TextChannel, member: GuildMember, ctx: TicketContext, target: GuildMember): Promise<Result> {
        const added = [...new Set([...ctx.ticket.addedIds, target.id])];
        const updated = await repo.update(channel.id, { addedIds: added });
        await repo.addParticipant(channel.id, target.id, "added");
        await refreshPermissions(channel, { ...ctx, ticket: updated ?? ctx.ticket });
        return noticeOk(ctx, "add", await varsOf(channel.guild, ctx), { staff: mention(member.id), member: mention(target.id) });
    }

    async remove(channel: TextChannel, member: GuildMember, ctx: TicketContext, target: GuildMember): Promise<Result> {
        const locale = ctx.settings.general.language;
        if (target.id === ctx.ticket.ownerId) return no(t(locale, "member.owner"));
        if (!ctx.ticket.addedIds.includes(target.id) && ctx.ticket.claimerId !== target.id) return no(t(locale, "member.notIn", { user: mention(target.id) }));
        const updated = await repo.update(channel.id, {
            addedIds: ctx.ticket.addedIds.filter((id) => id !== target.id),
            ...(ctx.ticket.claimerId === target.id ? { claimerId: null } : {}),
        });
        await channel.permissionOverwrites.delete(target.id).catch(() => null);
        await refreshPermissions(channel, { ...ctx, ticket: updated ?? ctx.ticket });
        return noticeOk(ctx, "remove", await varsOf(channel.guild, ctx), { staff: mention(member.id), member: mention(target.id) });
    }

    /** Hands the ticket to another staff member of this option (they become the claimer). */
    async transfer(channel: TextChannel, member: GuildMember, ctx: TicketContext, target: GuildMember): Promise<Result> {
        const locale = ctx.settings.general.language;
        if (target.user.bot || !isStaff(target, ctx)) return no(t(locale, "transfer.notStaff", { user: mention(target.id) }));
        const updated = await repo.update(channel.id, { claimerId: target.id });
        await repo.addParticipant(channel.id, target.id, "claimer");
        await refreshPermissions(channel, { ...ctx, ticket: updated ?? ctx.ticket });
        return noticeOk(ctx, "transfer", await varsOf(channel.guild, ctx), { staff: mention(member.id), member: mention(target.id) });
    }

    /** Saves the transcript now and answers with its link (or file). The owner (not staff) gets the copy they were sent. */
    async transcript(channel: TextChannel, ctx: TicketContext, member?: GuildMember): Promise<Result> {
        const forOwner = !!member && member.id === ctx.ticket.ownerId && !isStaff(member, ctx);
        const r = await archiveTicket(channel.guild, channel.id, { post: false, forOwner });
        const locale = ctx.settings.general.language;
        if (!r) return no(t(locale, "error"));
        return { ok: true, text: r.url ? t(locale, "transcript.ready", { channel: channel.name, link: r.url }) : t(locale, "transcript.file", { channel: channel.name }), files: [r.file] };
    }

    /** !come: a direct message calling the owner (or `target`) back to the ticket, at most once per the server's wait. */
    async come(channel: TextChannel, member: GuildMember, ctx: TicketContext, target: GuildMember | null): Promise<Result> {
        const locale = ctx.settings.general.language;
        const come = ctx.settings.come;
        if (!come.enabled || !ctx.settings.commands.come.enabled) return no(t(locale, "come.off"));
        if (!isOneOf(member, ctx, come)) return no(t(locale, "deny"));
        if (ctx.ticket.status === "closed") return no(t(locale, "closed.already"));
        const waitMs = come.cooldown * 60_000;
        const last = lastCome.get(channel.id) ?? 0;
        if (waitMs && Date.now() - last < waitMs) return no(t(locale, "come.wait", { minutes: Math.ceil((waitMs - (Date.now() - last)) / 60_000) }));

        const who = target ?? (await channel.guild.members.fetch(ctx.ticket.ownerId).catch(() => null));
        if (!who) return no(t(locale, "member.notIn", { user: mention(ctx.ticket.ownerId) }));
        const vars: Record<string, string> = { ...(await varsOf(channel.guild, ctx)), staff: mention(member.id), user: mention(who.id), username: who.displayName };
        const url = `https://discord.com/channels/${channel.guild.id}/${channel.id}`;
        const sent = await who.send(comePayload(come, vars, url) as never).then(() => true).catch(() => false);
        if (!sent) return no(t(locale, "come.dmClosed", { user: mention(who.id) }));
        lastCome.set(channel.id, Date.now());
        const custom = come.notice.trim();
        return ok(custom ? custom.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m) : t(locale, "come.sent", { user: mention(who.id) }));
    }
}

export const ticketService = new TicketServices();

/**
 * Sleep: remind the owner now (in the ticket and by direct message) and set when the ticket closes for no answer.
 * `manual` is /sleep (its own permission; works with the automatic sleep off). Only while the last message isn't the
 * owner's.
 */
export async function remindOwner(channel: TextChannel, ctx: TicketContext, by: GuildMember | null, manual: boolean): Promise<Result> {
    const locale = ctx.settings.general.language;
    const z = ctx.settings.sleep;
    if (manual && by) {
        if (!ctx.settings.commands.sleep.enabled) return no(t(locale, "cmd.off"));
        if (!isOneOf(by, ctx, z)) return no(t(locale, "deny"));
        if (ctx.ticket.status === "closed") return no(t(locale, "closed.already"));
        if (!ctx.ticket.ownerQuietSince) return no(t(locale, "sleep.ownerLast"));
    }
    const left = (z.closeMinutes - z.reminderMinutes) * 60;
    const time = durationText(left, locale);
    const vars: Vars = { ...(await varsOf(channel.guild, ctx)), staff: by ? mention(by.id) : "", time };
    const url = `https://discord.com/channels/${channel.guild.id}/${channel.id}`;
    const { inTicket, dm } = sleepPayloads(z, vars, url, ctx.ticket.ownerId);
    await channel.send(inTicket as never).catch((e) => Logger.warn(`[sleep] ticket message: ${e}`));
    const owner = await channel.guild.members.fetch(ctx.ticket.ownerId).catch(() => null);
    await owner?.send(dm as never).catch(() => null);
    await repo.update(channel.id, { sleepRemindedAt: new Date(), sleepCloseAt: new Date(Date.now() + left * 1000), ...(ctx.ticket.ownerQuietSince ? {} : { ownerQuietSince: new Date() }) });
    return ok(manual ? t(locale, "sleep.started", { user: mention(ctx.ticket.ownerId), time }) : "");
}

/** Sleep's end: the ticket closes for no answer (the bot closes it). */
export async function closeForNoAnswer(channel: TextChannel, ctx: TicketContext): Promise<void> {
    const me = channel.guild.members.me;
    if (!me) return;
    await repo.update(channel.id, { sleepCloseAt: null, ownerQuietSince: null, sleepRemindedAt: null });
    await ticketService.close(channel, me, ctx, t(ctx.settings.general.language, "sleep.closed"));
}
export { TicketRepository, TicketStateMachine, TicketAuditService, TicketDiscordAdapter };
