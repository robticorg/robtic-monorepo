import type { TicketTranscriptDocument } from '@robo/shared';
import type { SupportedLocale } from './i18n';
import { t } from './i18n';
import { Copyright } from '../components/Copyright';
import { DetailsContent } from '../components/DetailsDialog';
import { SafeImage } from '../components/Media';
import { TranscriptMessages } from '../components/TranscriptMessages';
import { formatDateTime } from './format';
import { LocaleProvider } from './i18n';
import { LOGO_DATA_URI } from './logo';
import { StaticRenderContext } from './render-mode';

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

/** CSS never needs a raw "<": the CSS escape `\3c ` makes `</style>` breakouts impossible. */
export const escapeCss = (css: string): string => css.replaceAll('<', String.raw`\3c `);

/** CSS text of the page's own stylesheets (same-origin, so cssRules are readable). */
export function collectPageCss(sheets: Iterable<CSSStyleSheet> = Array.from(document.styleSheets)): string {
  const parts: string[] = [];
  for (const sheet of sheets) {
    try {
      parts.push(Array.from(sheet.cssRules, (r) => r.cssText).join('\n'));
    } catch {
      // cross-origin sheet: skip
    }
  }
  return parts.join('\n');
}

function ExportView({ doc, locale, details }: { doc: TicketTranscriptDocument; locale: SupportedLocale; details: boolean }) {
  return (
    <div className="transcript-shell is-export" dir="ltr">
      <header className="transcript-bar">
        <div className="transcript-bar-title">
          <SafeImage className="bar-guild-icon" src={doc.guild.iconUrl} alt="" fallback={LOGO_DATA_URI} />
          <h1 dir="ltr">#{doc.ticket.channelName}</h1>
        </div>
      </header>
      <main className="transcript-main">
        {details && (
          <section className="export-details">
            <DetailsContent doc={doc} />
          </section>
        )}
        <TranscriptMessages doc={doc} />
        <p className="muted small export-note">
          {t(locale, 'web.transcript.exportedAt', { date: formatDateTime(new Date().toISOString(), locale) })}
        </p>
      </main>
      <Copyright />
    </div>
  );
}

/** Builds a standalone HTML document of the transcript (no scripts; works offline except remote images). */
export async function buildTranscriptHtml(
  doc: TicketTranscriptDocument,
  locale: SupportedLocale,
  css: string,
  { details = true }: { details?: boolean } = {},
): Promise<string> {
  const { renderToStaticMarkup } = await import('react-dom/server');
  const body = renderToStaticMarkup(
    <LocaleProvider locale={locale}>
      <StaticRenderContext.Provider value={true}>
        <ExportView doc={doc} locale={locale} details={details} />
      </StaticRenderContext.Provider>
    </LocaleProvider>,
  );
  const title = escapeHtml(t(locale, 'web.meta.transcriptTitle', { channel: `#${doc.ticket.channelName}` }));
  return `<!doctype html>
<html lang="${locale}" dir="ltr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<meta name="referrer" content="no-referrer" />
<meta name="generator" content="Robtic Ticket ${escapeHtml(doc.format)}" />
<title>${title}</title>
<link rel="icon" href="${LOGO_DATA_URI}" />
<style>${escapeCss(css)}</style>
</head>
<body>${body}</body>
</html>`;
}

export function downloadFile(filename: string, content: string, type = 'text/html;charset=utf-8'): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export { exportFilename } from './export-formats';
