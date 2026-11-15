import { Download, Info, Languages } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { TicketTranscriptDocument } from '@robo/shared';
import { Copyright, DetailsDialog, ExportDialog, ImageViewerProvider, LOGO_DATA_URI, SafeImage, TranscriptMessages, useDefaultLocale, useLocale } from '@robo/transcript';

// /transcript/:id, as Credora's: one bar (server icon, channel name, topic; export, language and details on the right),
// then only the messages. Everything else is in the Details popup.

type Result = { status: 'ok'; doc: TicketTranscriptDocument } | { status: 'not_found' } | { status: 'error' };

async function load(id: string): Promise<Result> {
    if (!id) return { status: 'not_found' };
    try {
        const res = await fetch(`/api/transcripts/${encodeURIComponent(id)}`, { headers: { accept: 'application/json' } });
        if (res.status === 404) return { status: 'not_found' };
        if (!res.ok) return { status: 'error' };
        return { status: 'ok', doc: (await res.json()) as TicketTranscriptDocument };
    } catch {
        return { status: 'error' };
    }
}

export function TranscriptPage({ id }: { id: string }) {
    const { tr, locale, toggle } = useLocale();
    const [result, setResult] = useState<Result | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(() => globalThis.location?.hash === '#details');
    const [exportOpen, setExportOpen] = useState(false);

    useEffect(() => {
        let alive = true;
        void load(id).then((r) => alive && setResult(r));
        return () => { alive = false; };
    }, [id]);

    const doc = result?.status === 'ok' ? result.doc : null;
    useDefaultLocale(doc?.locale);

    // Messages always read left to right (Arabic text keeps its own direction inside each line).
    useEffect(() => {
        const html = document.documentElement;
        const previous = html.dir;
        html.dir = 'ltr';
        return () => { html.dir = previous; };
    }, [locale]);

    useEffect(() => {
        if (doc) document.title = tr('web.meta.transcriptTitle', { channel: `#${doc.ticket.channelName}` });
    }, [doc, tr]);

    if (!result) return <div className="state">{tr('web.transcript.loading')}</div>;
    if (result.status === 'not_found') return <div className="state state-error">{tr('web.transcript.notFound')}</div>;
    if (!doc) return <div className="state state-error">{tr('web.transcript.error')}</div>;

    return (
        <ImageViewerProvider>
            <div className="transcript-shell" dir="ltr">
                <header className="transcript-bar">
                    <div className="transcript-bar-title" title={doc.guild.name ?? undefined}>
                        <SafeImage className="bar-guild-icon" src={doc.guild.iconUrl} alt={doc.guild.name ?? ''} fallback={LOGO_DATA_URI} />
                        <h1>#{doc.ticket.channelName}</h1>
                        {doc.ticket.channelTopic && (
                            <>
                                <span className="bar-divider" aria-hidden />
                                <span className="bar-topic" title={doc.ticket.channelTopic}>{doc.ticket.channelTopic}</span>
                            </>
                        )}
                    </div>
                    <div className="transcript-bar-actions">
                        <button type="button" className="icon-button" onClick={toggle} title={tr('web.nav.language')} aria-label={tr('web.nav.language')}>
                            <Languages size={20} />
                        </button>
                        <button type="button" className="icon-button" onClick={() => setExportOpen(true)} title={tr('web.transcript.export.title')} aria-label={tr('web.transcript.export.title')} aria-haspopup="dialog">
                            <Download size={20} />
                        </button>
                        <button type="button" className="icon-button" onClick={() => setDetailsOpen(true)} title={tr('web.transcript.details')} aria-label={tr('web.transcript.details')} aria-haspopup="dialog">
                            <Info size={20} />
                        </button>
                    </div>
                </header>

                <main className="transcript-main">
                    <TranscriptMessages doc={doc} />
                </main>

                <DetailsDialog doc={doc} open={detailsOpen} onClose={() => setDetailsOpen(false)} />
                <ExportDialog doc={doc} open={exportOpen} onClose={() => setExportOpen(false)} />
                <Copyright fixed />
            </div>
        </ImageViewerProvider>
    );
}
