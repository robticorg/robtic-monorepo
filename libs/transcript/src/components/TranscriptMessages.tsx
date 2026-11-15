import type { TicketTranscriptDocument, TranscriptMessageView } from '@robo/shared';
import { useMemo } from 'react';
import { isContinuation, ticketBadgeRoles } from '../lib/format';
import { useLocale } from '../lib/i18n';
import { type AuthorBadge, MessageItem } from './MessageItem';

/** The message list: owner and claimer get badges; `onBotClick` makes the bot's name clickable. */
export function TranscriptMessages({
  doc,
  isTicketBot,
  onBotClick,
}: {
  doc: TicketTranscriptDocument;
  isTicketBot?: (authorId: string | null) => boolean;
  onBotClick?: () => void;
}) {
  const { tr } = useLocale();
  const byId = useMemo(() => new Map<string, TranscriptMessageView>(doc.messages.map((m) => [m.messageId, m])), [doc]);
  const { ownerId, claimerIds } = useMemo(() => ticketBadgeRoles(doc), [doc]);
  const badgeFor = (authorId: string | null): AuthorBadge =>
    authorId === ownerId ? 'owner' : authorId && claimerIds.has(authorId) ? 'claimer' : null;

  return (
    <section className="messages" aria-label={tr('web.transcript.messages', { count: doc.stats.messageCount })}>
      {doc.messages.length === 0 && <div className="state">{tr('web.transcript.empty')}</div>}
      {doc.messages.map((m, i) => (
        <MessageItem
          key={m.messageId}
          message={m}
          doc={doc}
          byId={byId}
          badge={badgeFor(m.authorId)}
          continuation={isContinuation(doc.messages[i - 1], m)}
          onAuthorClick={onBotClick && isTicketBot?.(m.authorId) ? onBotClick : undefined}
        />
      ))}
    </section>
  );
}
