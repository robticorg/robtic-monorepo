import type { AttachmentSnapshot, TicketTranscriptDocument, TranscriptMessageView } from '@robo/shared';
import type { SupportedLocale } from './i18n';
import { t } from './i18n';
import { displayName, formatDateTime, userOf } from './format';

export const EXPORT_SCOPES = ['all', 'messages', 'images'] as const;
export type ExportScope = (typeof EXPORT_SCOPES)[number];
export const EXPORT_FORMATS = ['html', 'txt', 'md', 'json'] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export const EXPORT_MIME: Record<ExportFormat, string> = {
  html: 'text/html;charset=utf-8',
  txt: 'text/plain;charset=utf-8',
  md: 'text/markdown;charset=utf-8',
  json: 'application/json;charset=utf-8',
};

const isImage = (a: AttachmentSnapshot) => a.isImage || !!a.contentType?.toLowerCase().startsWith('image/');
const isVideo = (a: AttachmentSnapshot) => !!a.contentType?.toLowerCase().startsWith('video/');
const isAudio = (a: AttachmentSnapshot) => a.isVoiceMessage || !!a.contentType?.toLowerCase().startsWith('audio/');

/** Embed images become plain image attachments in the "images" export. */
const embedImages = (m: TranscriptMessageView): AttachmentSnapshot[] =>
  m.embeds.flatMap((e, i) =>
    [e.imageUrl, e.thumbnailUrl]
      .filter((url): url is string => !!url)
      .map((url, j) => ({
        id: `embed-${m.messageId}-${i}-${j}`,
        url,
        proxyUrl: null,
        filename: url.split('?')[0]?.split('/').at(-1) || 'image',
        contentType: 'image/*',
        size: 0,
        width: null,
        height: null,
        durationSeconds: null,
        spoiler: false,
        description: null,
        isImage: true,
        checksum: null,
      })),
  );

/**
 * Narrows the document to what the viewer asked for:
 * - `messages`: text only (no attachments, stickers or embed images);
 * - `images`: only images and videos (attachments and embed images), no text.
 * Voice messages are never part of a download (only playable on the page).
 */
export function scopeDocument(doc: TicketTranscriptDocument, scope: ExportScope): TicketTranscriptDocument {
  if (scope === 'all') return doc;
  const messages =
    scope === 'messages'
      ? doc.messages
          .map((m) => ({
            ...m,
            attachments: [],
            stickers: [],
            embeds: m.embeds.map((e) => ({ ...e, imageUrl: null, thumbnailUrl: null, hasImage: false, hasThumbnail: false })),
          }))
          .filter((m) => !!m.content?.trim() || m.embeds.length > 0 || (m.components?.length ?? 0) > 0)
      : doc.messages
          .map((m) => ({
            ...m,
            content: null,
            incompleteFields: [],
            editHistory: [],
            embeds: [],
            components: [],
            stickers: [],
            reactions: [],
            referenceMessageId: null,
            attachments: [...m.attachments.filter((a) => (isImage(a) || isVideo(a)) && !isAudio(a)), ...embedImages(m)],
          }))
          .filter((m) => m.attachments.length > 0);
  return { ...doc, messages };
}

const MENTION = /<@!?(\d{17,20})>/g;

function plainContent(doc: TicketTranscriptDocument, m: TranscriptMessageView, unknown: string): string {
  return (m.content ?? '').replace(MENTION, (_, id: string) => `@${displayName(userOf(doc, id), unknown)}`);
}

function header(doc: TicketTranscriptDocument, locale: SupportedLocale): string[] {
  const tk = doc.ticket;
  return [
    `${doc.guild.name ?? doc.guild.id} · #${tk.channelName}${tk.channelTopic ? ` | ${tk.channelTopic}` : ''}`,
    `${t(locale, 'web.transcript.ticket')}: #${tk.number} · ${t(locale, 'web.transcript.type')}: ${tk.optionLabel}`,
    `${t(locale, 'web.transcript.opened')}: ${formatDateTime(tk.openedAt, locale)}${
      tk.closedAt ? ` · ${t(locale, 'web.transcript.closed')}: ${formatDateTime(tk.closedAt, locale)}` : ''
    }`,
    `Transcript: ${doc.transcriptId}`,
  ];
}

/** One message as text lines (shared by TXT and Markdown). */
function messageLines(doc: TicketTranscriptDocument, m: TranscriptMessageView, locale: SupportedLocale, md: boolean): string[] {
  const unknown = t(locale, 'web.transcript.unknownUser');
  const name = displayName(userOf(doc, m.authorId), unknown);
  const when = formatDateTime(m.createdAt, locale);
  const lines = [md ? `**${name}** · ${when}` : `[${when}] ${name}:`];
  const content = plainContent(doc, m, unknown);
  if (content) {
    const tags = [m.deleted && t(locale, 'web.transcript.deletedTag'), m.revision > 0 && t(locale, 'web.transcript.edited')].filter(
      Boolean,
    );
    lines.push(`${md ? '' : '  '}${content}${tags.length ? ` ${tags.join(' ')}` : ''}`);
  }
  for (const e of m.embeds) {
    const parts = [e.title, e.description, ...(e.fields ?? []).map((f) => `${f.name}: ${f.value}`)].filter(Boolean);
    if (parts.length) lines.push(...parts.map((p) => (md ? `> ${p}` : `  | ${p}`)));
    for (const url of [e.imageUrl, e.thumbnailUrl]) if (url) lines.push(md ? `![](${url})` : `  ${url}`);
  }
  for (const a of m.attachments) {
    if (isAudio(a)) lines.push(md ? `_${t(locale, 'web.transcript.voiceMessage')}_` : `  [${t(locale, 'web.transcript.voiceMessage')}]`);
    else if (isImage(a)) lines.push(md ? `![${a.filename}](${a.url})` : `  ${a.url}`);
    else lines.push(md ? `[${a.filename}](${a.url})` : `  ${a.filename}: ${a.url}`);
  }
  for (const s of m.stickers)
    lines.push(
      md ? `_${t(locale, 'web.transcript.sticker', { name: s.name })}_` : `  [${t(locale, 'web.transcript.sticker', { name: s.name })}]`,
    );
  return lines;
}

/** Strips voice-message URLs: they are playable on the page but never downloadable. */
export const withoutVoice = (doc: TicketTranscriptDocument): TicketTranscriptDocument => ({
  ...doc,
  messages: doc.messages.map((m) => ({
    ...m,
    attachments: m.attachments.map((a) => (isAudio(a) ? { ...a, url: '', proxyUrl: null, waveform: null } : a)),
  })),
});

export function buildTextExport(doc: TicketTranscriptDocument, locale: SupportedLocale, format: 'txt' | 'md' | 'json'): string {
  if (format === 'json') return JSON.stringify(withoutVoice(doc), null, 2);
  const md = format === 'md';
  const head = header(doc, locale);
  const out = md ? [`# ${head[0]}`, '', ...head.slice(1).map((l) => `- ${l}`), '', '---', ''] : [...head, '='.repeat(48), ''];
  for (const m of doc.messages) out.push(...messageLines(doc, m, locale, md), '');
  return `${out.join('\n').trimEnd()}\n`;
}

export const exportFilename = (doc: TicketTranscriptDocument, format: ExportFormat = 'html', scope: ExportScope = 'all'): string =>
  `transcript-${doc.ticket.channelName.replace(/[^a-z0-9-_]+/gi, '-').slice(0, 60)}-${doc.ticket.number}${
    scope === 'all' ? '' : `-${scope}`
  }.${format}`;
