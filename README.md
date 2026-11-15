# Robtic Ticket

A Discord ticket bot whose panels are designed on the Robtic dashboard (robtic-discord, **Robtic Ticket**). Unlimited
panels and kinds of ticket, each opening a private channel with its own permissions, its own message and controls
(Close, Claim, Rename, Add, Remove, Transfer, Transcript, Reopen, Delete), in English or Arabic, and a full transcript of
every ticket: edits with what was said before, deleted messages and who deleted them, images, files, voice messages,
stickers, emoji and reactions.

```
apps/
  bot/          the Discord bot (Bun + discord.js)
    src/commands/       /close /claim /rename /add /remove /transfer /transcript /reopen /delete
    src/events/         slash commands, typed commands (!close, !اغلاق…), transcript capture, renames, deletes
    src/ticket/         the ticket service, its actions, panel posting, transcripts (capture → document → file)
    src/Permissions/    who may do what (per option), channel permission overwrites, the control rows
    src/lib/            rendering a dashboard design to a Discord message, replies, the invocation layer
    tests/              unit tests and a MongoDB integration test
  transcript/   the transcript page: /transcript/<id> (Vite + React, Credora's viewer)
libs/
  shared/       the settings contract (a copy of robtic-discord libs/shared/src/ticket.ts), transcript shapes, both languages
  database/     MongoDB (mongoose 8): models and repositories
  transcript/   the transcript components, also used by the bot to make the HTML file
  config/       environment
  logger/       logging
```

## Run it

```bash
bun install
cp .env.example .env          # token, client id, MongoDB
bun run dev:bot               # the bot
bun run dev:transcript        # the transcript page on http://localhost:5180/transcript/tr_showcase (a built-in sample)
bun test apps/bot/tests       # unit tests + the database test (needs a local MongoDB, skipped otherwise)
bun run typecheck
```

Design panels on the dashboard: robtic-discord `bun run dev`, then `http://localhost:5173/discord/public/<server>/ticket`
(mock data). In real mode the dashboard reads and writes this bot's database (set its `MONGODB_URI` in the admin
console under Discord → Bot settings → Robtic Ticket).

## How it fits together

| What | Where |
|---|---|
| A server's settings (panels, options, permissions, controls, language, logs) | `ticketsettings`, one document per server, written by the dashboard |
| "Post this panel" | the dashboard writes `panelposts`; the bot picks it up within `PANEL_POLL_SECONDS`, posts or edits the panel and writes back `posted` |
| Tickets | `tickets` (owner, claimer, added members, form answers, renames) |
| Transcripts while a ticket lives | `transcriptmessages` (latest state of each message) and `transcriptedits` |
| Saved transcripts | `transcripts` (an unguessable `tr_…` id and the whole document), shown by apps/transcript and attached as HTML |

Buttons and menus carry ids starting with `tk:` (src/ticket/types.ts). Who may use a control is set per option on the
dashboard; server administrators always may. Close can be restyled but never hidden.

## Production

- Bot: `bun apps/bot/src/bot.ts` with the variables above (`DISCORD_GUILD_ID` empty registers commands globally).
- Transcript page: `bun run build:transcript`, then `bun apps/transcript/server.ts` (port `TRANSCRIPT_PORT`, 5180), behind the proxy at `TRANSCRIPT_BASE_URL`.
- Invite permissions: Manage Channels, Manage Roles, View Channels, Send Messages, Manage Messages, Embed Links, Attach Files,
  Read Message History, Use External Emoji, Add Reactions, View Audit Log (who deleted a message), Use Application Commands.
