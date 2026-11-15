import type { TicketTranscriptDocument } from '@robo/shared';
import { CalendarCheck, CalendarPlus, Check, Copy, FileText, Hash, History, Image, LayoutPanelTop, MessageSquare, Paperclip, Pencil, Tag, Trash2, UserCheck, Users, X } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { displayName, formatDateTime, ticketBadgeRoles, userOf, viewerTimeZone } from '../lib/format';
import { useLocale } from '../lib/i18n';
import { LOGO_DATA_URI } from '../lib/logo';
import { useStaticRender } from '../lib/render-mode';
import { Avatar, SafeImage } from './Media';
import { RoleBadge } from './MessageItem';

// The ticket's details (everything but the messages): who opened and claimed it, the form answers, what changed. The
// same look as Credora's details panel, with a ticket's facts instead of a trade's.

function Fact({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="fact">
      <span className="fact-icon" aria-hidden>
        {icon}
      </span>
      <div>
        <div className="fact-label">{label}</div>
        <div className="fact-value">{children}</div>
      </div>
    </div>
  );
}

/** Everything about the ticket except the messages. Shared by the popup and the HTML export. */
export function DetailsContent({ doc }: { doc: TicketTranscriptDocument }) {
  const { tr, locale } = useLocale();
  const isStatic = useStaticRender();
  const [copied, setCopied] = useState(false);
  const s = doc.stats;
  const t = doc.ticket;
  const { ownerId, claimerIds } = ticketBadgeRoles(doc);
  const renames = doc.channelEvents.filter((e) => e.type === 'renamed');
  const topics = doc.channelEvents.filter((e) => e.type === 'topic_changed');
  const name = (id: string | null) => displayName(userOf(doc, id), tr('web.transcript.unknownUser'));

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(doc.transcriptId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="details-content">
      <section className="details-server">
        <SafeImage className="guild-icon" src={doc.guild.iconUrl} alt="" fallback={LOGO_DATA_URI} />
        <div>
          <div className="fact-label">{tr('web.transcript.server')}</div>
          <div className="details-server-name">{doc.guild.name ?? doc.guild.id}</div>
        </div>
        <span className="status status-closed">{tr('web.transcript.closed')}</span>
      </section>

      <section className="facts">
        <Fact icon={<Hash size={16} />} label={tr('web.transcript.ticket')}>
          <span dir="ltr">#{t.number}</span>
        </Fact>
        <Fact icon={<Tag size={16} />} label={tr('web.transcript.type')}>
          {t.optionLabel}
        </Fact>
        <Fact icon={<LayoutPanelTop size={16} />} label={tr('web.transcript.panel')}>
          {t.panelName}
        </Fact>
        <Fact icon={<UserCheck size={16} />} label={tr('web.transcript.claimedBy')}>
          {t.claimerId ? name(t.claimerId) : tr('web.transcript.notClaimed')}
        </Fact>
        <Fact icon={<CalendarPlus size={16} />} label={tr('web.transcript.opened')}>
          {formatDateTime(t.openedAt, locale)}
        </Fact>
        <Fact icon={<CalendarCheck size={16} />} label={tr('web.transcript.closed')}>
          {formatDateTime(t.closedAt, locale)}
        </Fact>
      </section>

      {t.answers.length > 0 && (
        <section>
          <h3>{tr('web.transcript.answers')}</h3>
          <dl className="details-grid">
            {t.answers.map((a, i) => (
              <div key={i} className="details-grid-row">
                <dt dir="auto">{a.question}</dt>
                <dd dir="auto">{a.answer || '—'}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section>
        <h3>{tr('web.transcript.detailsPanel.overview')}</h3>
        <ul className="details-counters">
          <li><MessageSquare size={16} aria-hidden /> {tr('web.transcript.messages', { count: s.messageCount })}</li>
          <li><History size={16} aria-hidden /> {tr('web.transcript.detailsPanel.renames', { count: s.renameCount })}</li>
          <li><FileText size={16} aria-hidden /> {tr('web.transcript.detailsPanel.topicChanges', { count: topics.length })}</li>
          <li><Pencil size={16} aria-hidden /> {tr('web.transcript.detailsPanel.edits', { count: s.editedCount })}</li>
          <li><Trash2 size={16} aria-hidden /> {tr('web.transcript.detailsPanel.deletions', { count: s.deletedCount })}</li>
          <li><Paperclip size={16} aria-hidden /> {tr('web.transcript.detailsPanel.attachments', { count: s.attachmentCount })}</li>
          <li><Image size={16} aria-hidden /> {tr('web.transcript.detailsPanel.images', { count: s.imageCount })}</li>
          <li><Users size={16} aria-hidden /> {tr('web.transcript.detailsPanel.participantsCount', { count: s.participantCount })}</li>
        </ul>
      </section>

      <section>
        <h3>{tr('web.transcript.participants')}</h3>
        <ul className="details-participants">
          {t.participants.map((p) => (
            <li key={`${p.userId}-${p.role}`} className={p.removedAt ? 'is-removed' : ''}>
              <Avatar url={userOf(doc, p.userId)?.avatarUrl} userId={p.userId} />
              <span className="participant-name">{name(p.userId)}</span>
              <RoleBadge badge={p.userId === ownerId ? 'owner' : claimerIds.has(p.userId) ? 'claimer' : null} />
              <span className="muted small">{tr(`web.transcript.roles.${p.role}`)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>{tr('web.transcript.detailsPanel.renameHistory')}</h3>
        {doc.channelEvents.length === 0 ? (
          <p className="muted">{tr('web.transcript.detailsPanel.renames', { count: 0 })}</p>
        ) : (
          <ol className="details-list">
            {[...renames, ...topics]
              .sort((a, b) => a.at.localeCompare(b.at))
              .map((e, i) => (
                <li key={`${e.at}-${i}`}>
                  <time>{formatDateTime(e.at, locale)}</time>{' '}
                  <span dir="auto">
                    {e.type === 'renamed'
                      ? tr('web.transcript.detailsPanel.renamedFromTo', { from: `#${e.from ?? '?'}`, to: `#${e.to ?? '?'}` })
                      : tr('web.transcript.detailsPanel.topicFromTo', { from: e.from ?? tr('web.transcript.detailsPanel.none'), to: e.to ?? tr('web.transcript.detailsPanel.none') })}
                  </span>
                </li>
              ))}
          </ol>
        )}
      </section>

      <section>
        <dl className="details-grid">
          <dt>{tr('web.transcript.detailsPanel.closeReason')}</dt>
          <dd dir="auto">{t.closeReason || '—'}</dd>
          <dt>{tr('web.transcript.detailsPanel.closedBy')}</dt>
          <dd>{t.closedBy ? name(t.closedBy) : '—'}</dd>
          <dt>{tr('web.transcript.transcriptId')}</dt>
          <dd className="transcript-id">
            <code dir="ltr">{doc.transcriptId}</code>
            {!isStatic && (
              <button type="button" className="icon-button small" onClick={copyId} title={tr('web.transcript.copy')} aria-label={tr('web.transcript.copy')}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            )}
          </dd>
        </dl>
        <p className="muted small">{tr('web.transcript.generatedAt', { date: formatDateTime(doc.generatedAt, locale) })}</p>
        <p className="muted small">{tr('web.transcript.timezoneNote', { tz: viewerTimeZone() })}</p>
      </section>
    </div>
  );
}

/** The details popup: a native <dialog> (focus trap, Escape); a click on the backdrop closes it. */
export function DetailsDialog({ doc, open, onClose }: { doc: TicketTranscriptDocument; open: boolean; onClose(): void }) {
  const { tr } = useLocale();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal?.();
    if (!open && dialog.open) dialog.close?.();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="details-dialog"
      onClose={onClose}
      aria-labelledby="details-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="details-panel">
        <header className="details-header">
          <h2 id="details-title">{tr('web.transcript.detailsPanel.title')}</h2>
          <button type="button" className="icon-button" onClick={onClose} title={tr('web.transcript.closeDetails')} aria-label={tr('web.transcript.closeDetails')}>
            <X size={20} />
          </button>
        </header>
        <DetailsContent doc={doc} />
      </div>
    </dialog>
  );
}
