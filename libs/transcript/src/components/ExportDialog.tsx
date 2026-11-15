import type { TicketTranscriptDocument } from '@robo/shared';
import { Braces, Download, FileCode, FileText, Hash, Images, Layers, LoaderCircle, MessageSquare, X } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import type { ExportFormat, ExportScope } from '../lib/export-formats';
import { useLocale } from '../lib/i18n';

const SCOPE_ICONS: Record<ExportScope, ReactNode> = {
  all: <Layers size={18} />,
  messages: <MessageSquare size={18} />,
  images: <Images size={18} />,
};
const FORMAT_ICONS: Record<ExportFormat, ReactNode> = {
  html: <FileCode size={18} />,
  txt: <FileText size={18} />,
  md: <Hash size={18} />,
  json: <Braces size={18} />,
};

function Choice<T extends string>({
  options,
  value,
  onChange,
  label,
  icons,
  name,
}: {
  options: readonly T[];
  value: T;
  onChange(v: T): void;
  label(v: T): string;
  icons: Record<T, ReactNode>;
  name: string;
}) {
  return (
    <div className="export-choices" role="radiogroup">
      {options.map((o) => (
        <label key={o} className={`export-choice${o === value ? ' is-active' : ''}`}>
          <input type="radio" name={name} value={o} checked={o === value} onChange={() => onChange(o)} />
          <span aria-hidden>{icons[o]}</span>
          <span>{label(o)}</span>
        </label>
      ))}
    </div>
  );
}

/** Export popup: pick what to export (all / messages / images) and the file type (HTML / TXT / Markdown / JSON). */
export function ExportDialog({ doc, open, onClose }: { doc: TicketTranscriptDocument; open: boolean; onClose(): void }) {
  const { tr, locale } = useLocale();
  const ref = useRef<HTMLDialogElement>(null);
  const [scope, setScope] = useState<ExportScope>('all');
  const [format, setFormat] = useState<ExportFormat>('html');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal?.();
    if (!open && dialog.open) dialog.close?.();
  }, [open]);

  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { EXPORT_MIME, buildTextExport, exportFilename, scopeDocument } = await import('../lib/export-formats');
      const scoped = scopeDocument(doc, scope);
      let content: string;
      if (format === 'html') {
        const { buildTranscriptHtml, collectPageCss } = await import('../lib/export-html');
        content = await buildTranscriptHtml(scoped, locale, collectPageCss(), { details: scope !== 'images' });
      } else {
        content = buildTextExport(scoped, locale, format);
      }
      const { downloadFile } = await import('../lib/export-html');
      downloadFile(exportFilename(doc, format, scope), content, EXPORT_MIME[format]);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape is handled natively by <dialog>; the click detects the backdrop.
    <dialog
      ref={ref}
      className="details-dialog export-dialog"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={tr('web.transcript.export.title')}
    >
      <div className="details-panel">
        <header className="details-header">
          <h2>{tr('web.transcript.export.title')}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label={tr('web.transcript.closeDetails')}>
            <X size={20} />
          </button>
        </header>
        <div className="export-body">
          <h3>{tr('web.transcript.export.content')}</h3>
          <Choice
            name="export-scope"
            options={['all', 'messages', 'images'] as const}
            value={scope}
            onChange={setScope}
            label={(o) => tr(`web.transcript.export.scopes.${o}`)}
            icons={SCOPE_ICONS}
          />
          <h3>{tr('web.transcript.export.format')}</h3>
          <Choice
            name="export-format"
            options={['html', 'txt', 'md', 'json'] as const}
            value={format}
            onChange={setFormat}
            label={(o) => tr(`web.transcript.export.formats.${o}`)}
            icons={FORMAT_ICONS}
          />
          <p className="muted small">{tr('web.transcript.export.voiceNote')}</p>
          <button type="button" className="btn btn-primary export-download" onClick={download} disabled={busy}>
            {busy ? <LoaderCircle size={18} className="spin" /> : <Download size={18} />}
            {tr('web.transcript.export.download')}
          </button>
        </div>
      </div>
    </dialog>
  );
}
