import type { TicketTranscriptDocument, TranscriptUser } from '@robo/shared';

/** Discord embed color integer → CSS hex (default blurple when unset). */
export const colorToHex = (color: number | null | undefined): string =>
  typeof color === 'number' && color > 0 ? `#${color.toString(16).padStart(6, '0')}` : '#4e5058';

export function formatBytes(bytes: number, locale: string): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return new Intl.NumberFormat(locale, { style: 'unit', unit: units[unit], unitDisplay: 'short', maximumFractionDigits: 1 }).format(value);
}

/** Localized date/time. Arabic uses Latin digits to keep ids/times readable next to Discord data. */
export function formatDateTime(iso: string | null | undefined, locale: string, withTime = true): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const tag = locale === 'ar' ? 'ar-u-nu-latn' : 'en-GB';
  return new Intl.DateTimeFormat(tag, withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }).format(date);
}

/** Discord `<t:unix:style>` rendering. */
export function formatDiscordTimestamp(unix: number, style: string, locale: string): string {
  const iso = new Date(unix * 1000).toISOString();
  if (style === 'R') {
    const diff = Math.round((unix * 1000 - Date.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar-u-nu-latn' : 'en', { numeric: 'auto' });
    const abs = Math.abs(diff);
    if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (abs < 86_400) return rtf.format(Math.round(diff / 3600), 'hour');
    return rtf.format(Math.round(diff / 86_400), 'day');
  }
  return formatDateTime(iso, locale, style !== 'd' && style !== 'D');
}

export const customEmojiUrl = (id: string, animated: boolean): string =>
  `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}?size=48`;

/** Default Discord avatar when none was captured. */
export const defaultAvatar = (userId: string | null): string => {
  let index = 0;
  try {
    index = userId ? Number((BigInt(userId) >> 22n) % 6n) : 0;
  } catch {
    index = 0;
  }
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
};

export function userOf(doc: TicketTranscriptDocument, id: string | null | undefined): TranscriptUser | null {
  return id ? (doc.users[id] ?? null) : null;
}

export const displayName = (user: TranscriptUser | null, fallback: string): string => user?.displayName || user?.username || fallback;

/** Groups consecutive messages by the same author within 7 minutes (Discord-style). */
export function isContinuation(
  previous: { authorId: string | null; createdAt: string | null; referenceMessageId: string | null } | undefined,
  current: { authorId: string | null; createdAt: string | null; referenceMessageId: string | null },
): boolean {
  if (!previous?.authorId || previous.authorId !== current.authorId || current.referenceMessageId) return false;
  if (!previous.createdAt || !current.createdAt) return false;
  return new Date(current.createdAt).getTime() - new Date(previous.createdAt).getTime() < 7 * 60_000;
}

/** Short time (HH:mm) for grouped messages. */
export function formatTime(iso: string | null | undefined, locale: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { timeStyle: 'short' }).format(date);
}

/** Who gets a badge in the transcript: the ticket owner and whoever claimed it. Everyone else: none. */
export function ticketBadgeRoles(doc: TicketTranscriptDocument): { ownerId: string; claimerIds: Set<string> } {
  const claimerIds = new Set(doc.ticket.participants.filter((p) => p.role === 'claimer').map((p) => p.userId));
  if (doc.ticket.claimerId) claimerIds.add(doc.ticket.claimerId);
  return { ownerId: doc.ticket.ownerId, claimerIds };
}

/** Full date + time including the viewer's timezone, for tooltips. Uses the browser's own timezone. */
export function formatFullDateTime(iso: string | null | undefined, locale: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { dateStyle: 'full', timeStyle: 'long' }).format(date);
}

/** IANA timezone of the viewer (e.g. "Africa/Cairo"). */
export const viewerTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

/** "2026" in 2026, "2026 – 2027" afterwards. */
export const copyrightYears = (start: number, now = new Date()): string =>
  now.getFullYear() > start ? `${start} – ${now.getFullYear()}` : `${start}`;
