import type { TicketTranscriptDocument, TranscriptMessageView } from '@robo/shared';
import type { Translator } from '../lib/i18n';
import { BadgeCheck, Crown } from 'lucide-react';
import { useState } from 'react';
import { displayName, formatDateTime, formatFullDateTime, formatTime, userOf } from '../lib/format';
import { useLocale } from '../lib/i18n';
import { useStaticRender } from '../lib/render-mode';
import { ComponentsView } from './ComponentsView';
import { AttachmentView, Avatar, EmbedView, StickerView } from './Media';
import { Reactions } from './Reactions';
import { RichText } from './RichText';

export type AuthorBadge = 'owner' | 'claimer' | null;

/** Hover text for a deleted message: who deleted it. */
export function deletedByText(message: TranscriptMessageView, doc: TicketTranscriptDocument, tr: Translator): string {
  const by = message.deletedBy;
  const user = by?.userId ? displayName(userOf(doc, by.userId), by.userId) : null;
  if (!by || !user || by.kind === 'unknown') return tr('web.transcript.deletedByUnknown');
  if (by.kind === 'self') return tr('web.transcript.deletedBySelf', { user });
  if (by.kind === 'bot') return tr('web.transcript.deletedByBot', { user });
  return tr('web.transcript.deletedByModerator', { user });
}

/** Owner (ticket opener) and claimer badges; every other user has none. */
export function RoleBadge({ badge }: { badge: AuthorBadge }) {
  const { tr } = useLocale();
  if (badge === 'owner') {
    return (
      <span className="role-badge role-owner" title={tr('web.transcript.ownerBadgeTitle')}>
        <Crown size={12} aria-hidden />
        {tr('web.transcript.ownerBadge')}
      </span>
    );
  }
  if (badge === 'claimer') {
    return (
      <span className="role-badge role-claimer" title={tr('web.transcript.claimerBadgeTitle')}>
        <BadgeCheck size={12} aria-hidden />
        {tr('web.transcript.claimerBadge')}
      </span>
    );
  }
  return null;
}

export function MessageItem({
  message,
  doc,
  continuation,
  byId,
  badge = null,
  onAuthorClick,
}: {
  message: TranscriptMessageView;
  doc: TicketTranscriptDocument;
  continuation: boolean;
  byId: Map<string, TranscriptMessageView>;
  badge?: AuthorBadge;
  /** Makes the author avatar/name clickable (the bot's own messages). */
  onAuthorClick?: () => void;
}) {
  const { tr, locale } = useLocale();
  const isStatic = useStaticRender();
  const [toggledHistory, setShowHistory] = useState(false);
  const showHistory = isStatic || toggledHistory;
  const author = userOf(doc, message.authorId);
  const name = displayName(author, tr('web.transcript.unknownUser'));
  const reference = message.referenceMessageId ? byId.get(message.referenceMessageId) : undefined;
  const referenceAuthor = reference ? userOf(doc, reference.authorId) : null;
  const contentMissing = message.content === null && message.incompleteFields.includes('content');
  const deletedTitle = message.deleted ? deletedByText(message, doc, tr) : '';
  const deletedTag = message.deleted ? (
    <span className="deleted-tag" dir="auto" title={deletedTitle}>
      {tr('web.transcript.deletedTag')}
    </span>
  ) : null;

  return (
    <article
      className={`message${continuation ? ' is-continuation' : ''}${message.deleted ? ' is-deleted' : ''}`}
      id={`m-${message.messageId}`}
    >
      {message.referenceMessageId && (
        <a className="message-reply" href={`#m-${message.referenceMessageId}`}>
          ↪{' '}
          {reference
            ? `${displayName(referenceAuthor, tr('web.transcript.unknownUser'))}: ${(reference.content ?? '').slice(0, 80)}`
            : tr('web.transcript.reply')}
        </a>
      )}
      <div className="message-row">
        <div className="message-gutter">
          {continuation ? (
            <time className="message-hover-time" dir="auto" title={formatFullDateTime(message.createdAt, locale)}>
              {formatTime(message.createdAt, locale)}
            </time>
          ) : onAuthorClick ? (
            <button type="button" className="author-button" onClick={onAuthorClick} aria-label={name}>
              <Avatar url={author?.avatarUrl} userId={message.authorId} />
            </button>
          ) : (
            <Avatar url={author?.avatarUrl} userId={message.authorId} />
          )}
        </div>
        <div className="message-main">
          {!continuation && (
            <header className="message-header">
              {onAuthorClick ? (
                <button type="button" className="message-author author-button" onClick={onAuthorClick}>
                  {name}
                </button>
              ) : (
                <span className="message-author">{name}</span>
              )}
              <RoleBadge badge={badge} />
              {(author?.bot || message.isBot) && <span className="tag">{tr('web.transcript.bot')}</span>}
              {message.isSystem && <span className="tag tag-system">{tr('web.transcript.system')}</span>}
              <time
                className="message-time"
                dir="auto"
                dateTime={message.createdAt ?? undefined}
                title={formatFullDateTime(message.createdAt, locale)}
              >
                {formatDateTime(message.createdAt, locale)}
              </time>
            </header>
          )}
          {message.content ? (
            <div
              className={`message-content${message.deleted ? ' is-deleted-text' : ''}`}
              title={message.deleted ? deletedTitle : undefined}
            >
              <RichText text={message.content} doc={doc} />
              {deletedTag}
              {message.revision > 0 &&
                (isStatic ? (
                  <span className="edited-marker">{tr('web.transcript.edited')}</span>
                ) : (
                  <button type="button" className="edited-marker" onClick={() => setShowHistory((v) => !v)} aria-expanded={showHistory}>
                    {tr('web.transcript.edited')}
                  </button>
                ))}
            </div>
          ) : (
            contentMissing &&
            message.embeds.length === 0 &&
            message.attachments.length === 0 &&
            !message.components?.length && (
              <div className="message-content is-muted">
                {tr('web.transcript.unavailableContent')} {deletedTag}
              </div>
            )
          )}
          {showHistory && message.editHistory.length > 0 && (
            <div className="edit-history" dir="auto">
              <div className="edit-history-title">{tr('web.transcript.editHistory')}</div>
              {message.editHistory.map((e, i) => (
                <div key={`${e.at}-${i}`} className="edit-entry">
                  <time>{formatDateTime(e.at, locale)}</time>
                  <div>
                    <span className="edit-label">{tr('web.transcript.before')}:</span> {e.before ?? '—'}
                  </div>
                  <div>
                    <span className="edit-label">{tr('web.transcript.after')}:</span> {e.after ?? '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
          {message.attachments.length > 0 && (
            <div className="attachments">
              {message.attachments.map((a) => (
                <AttachmentView key={a.id} attachment={a} />
              ))}
            </div>
          )}
          {message.embeds.map((e, i) => (
            <EmbedView key={`${message.messageId}-e${i}`} embed={e} doc={doc} />
          ))}
          {message.components && message.components.length > 0 && <ComponentsView components={message.components} doc={doc} />}
          {message.stickers.map((s) => (
            <StickerView key={s.id} sticker={s} />
          ))}
          <Reactions message={message} doc={doc} />
        </div>
      </div>
    </article>
  );
}
