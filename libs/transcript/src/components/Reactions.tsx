import type { ReactionEmoji, TicketTranscriptDocument, TranscriptMessageView } from '@robo/shared';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { customEmojiUrl, displayName, userOf } from '../lib/format';
import { useLocale } from '../lib/i18n';
import { useStaticRender } from '../lib/render-mode';
import { Avatar } from './Media';

function EmojiGlyph({ emoji }: { emoji: ReactionEmoji }) {
  return emoji.id ? (
    <img className="reaction-emoji" src={customEmojiUrl(emoji.id, emoji.animated)} alt={`:${emoji.name}:`} loading="lazy" />
  ) : (
    <span className="reaction-emoji">{emoji.name}</span>
  );
}

const emojiLabel = (emoji: ReactionEmoji) => (emoji.id ? `:${emoji.name}:` : emoji.name);
const emojiKey = (emoji: ReactionEmoji) => emoji.id ?? emoji.name;

/**
 * Reaction chips under a message. Hover shows who reacted; click opens a
 * popup with every reaction and the full list of users (avatars + names).
 */
export function Reactions({ message, doc }: { message: TranscriptMessageView; doc: TicketTranscriptDocument }) {
  const { tr } = useLocale();
  const isStatic = useStaticRender();
  const reactions = message.reactions ?? [];
  const [selected, setSelected] = useState<number | null>(null);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (selected !== null && !dialog.open) dialog.showModal?.();
    if (selected === null && dialog.open) dialog.close?.();
  }, [selected]);

  if (reactions.length === 0) return null;
  const name = (id: string) => displayName(userOf(doc, id), tr('web.transcript.unknownUser'));
  const hoverText = (r: (typeof reactions)[number]) => {
    const names = r.userIds.slice(0, 10).map(name);
    const more = r.userIds.length - names.length;
    const users = more > 0 ? `${names.join(', ')} ${tr('web.transcript.andMore', { count: more })}` : names.join(', ');
    return tr('web.transcript.reactedWith', { users, emoji: emojiLabel(r.emoji) });
  };
  const current = selected !== null ? reactions[selected] : undefined;

  return (
    <>
      <div className="reactions">
        {reactions.map((r, i) =>
          isStatic ? (
            <span key={emojiKey(r.emoji)} className="reaction" title={hoverText(r)}>
              <EmojiGlyph emoji={r.emoji} /> <span className="reaction-count">{r.userIds.length}</span>
            </span>
          ) : (
            <button key={emojiKey(r.emoji)} type="button" className="reaction" title={hoverText(r)} onClick={() => setSelected(i)}>
              <EmojiGlyph emoji={r.emoji} /> <span className="reaction-count">{r.userIds.length}</span>
            </button>
          ),
        )}
      </div>
      {!isStatic && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: Escape is handled natively by <dialog>; the click detects the backdrop.
        <dialog
          ref={ref}
          className="details-dialog reactions-dialog"
          onClose={() => setSelected(null)}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
          aria-label={tr('web.transcript.reactions')}
        >
          <div className="details-panel">
            <header className="details-header">
              <h2>{tr('web.transcript.reactions')}</h2>
              <button
                type="button"
                className="icon-button"
                onClick={() => setSelected(null)}
                aria-label={tr('web.transcript.closeDetails')}
              >
                <X size={20} />
              </button>
            </header>
            <div className="reactions-tabs" role="tablist">
              {reactions.map((r, i) => (
                <button
                  key={emojiKey(r.emoji)}
                  type="button"
                  role="tab"
                  aria-selected={i === selected}
                  className={`reaction${i === selected ? ' is-active' : ''}`}
                  onClick={() => setSelected(i)}
                >
                  <EmojiGlyph emoji={r.emoji} /> <span className="reaction-count">{r.userIds.length}</span>
                </button>
              ))}
            </div>
            <ul className="details-participants reactions-users">
              {current?.userIds.map((id) => (
                <li key={id}>
                  <Avatar url={userOf(doc, id)?.avatarUrl} userId={id} />
                  <span className="participant-name">{name(id)}</span>
                </li>
              ))}
            </ul>
          </div>
        </dialog>
      )}
    </>
  );
}
