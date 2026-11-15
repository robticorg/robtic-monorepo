import { Download, Globe, Info, Languages, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { TicketTranscriptDocument } from '@robo/shared';
import { Copyright, DetailsDialog, ExportDialog, ImageViewerProvider, LOGO_DATA_URI, SafeImage, TranscriptMessages, useDefaultLocale, useLocale } from '@robo/transcript';

// /transcript/:id, as Credora's: one bar (server icon, channel name, topic; export, language and details on the right),
// then only the messages. Everything else is in the Details popup.

type Access = { public: boolean; canShare: boolean };
type Result =
    | { status: 'ok'; doc: TicketTranscriptDocument; access: Access }
    | { status: 'not_found' }
    | { status: 'sign_in'; loginUrl: string | null }
    | { status: 'forbidden' }
    | { status: 'error' };

/** The dashboard's API decides who may open a transcript (robtic-discord: GET /discord/api/ticket/transcript/:id). */
const ACCESS_API = '/discord/api/ticket/transcript/';
const BASE = (import.meta.env?.BASE_URL ?? '/') as string;

async function load(id: string): Promise<Result> {
    if (!id) return { status: 'not_found' };
    try {
        const res = await fetch(`${ACCESS_API}${encodeURIComponent(id)}`, {
            credentials: 'same-origin',
            headers: { accept: 'application/json', 'x-robtic-return': location.href },
        });
        if (res.status === 404) return { status: 'not_found' };
        if (res.status === 401) return { status: 'sign_in', loginUrl: ((await res.json().catch(() => null)) as { loginUrl?: string } | null)?.loginUrl ?? null };
        if (res.status === 403) return { status: 'forbidden' };
        if (!res.ok) return { status: 'error' };
        const view = (await res.json()) as { doc: TicketTranscriptDocument | null } & Access;
        let doc = view.doc;
        // Local mock mode: the dashboard has no documents, this app's own sample stands in.
        if (!doc) {
            const local = await fetch(`${BASE}api/${encodeURIComponent(id)}`, { headers: { accept: 'application/json' } });
            if (!local.ok) return { status: 'not_found' };
            doc = (await local.json()) as TicketTranscriptDocument;
        }
        return { status: 'ok', doc, access: { public: view.public, canShare: view.canShare } };
    } catch {
        return { status: 'error' };
    }
}

/** Server administrators: anyone with the link may open it, or only administrators (and the owner, when allowed). */
function ShareButton({ id, access, onChange, ar }: { id: string; access: Access; onChange: (a: Access) => void; ar: boolean }) {
    const [busy, setBusy] = useState(false);
    const flip = async () => {
        setBusy(true);
        try {
            const res = await fetch(`${ACCESS_API}${encodeURIComponent(id)}/public`, {
                method: 'PUT',
                credentials: 'same-origin',
                headers: { accept: 'application/json', 'content-type': 'application/json' },
                body: JSON.stringify({ public: !access.public }),
            });
            if (res.ok) onChange({ ...access, public: !access.public });
        } finally {
            setBusy(false);
        }
    };
    const label = access.public ? (ar ? 'عام: لكل من لديه الرابط' : 'Public: anyone with the link') : (ar ? 'خاص: للمسؤولين فقط' : 'Private: administrators only');
    const hint = access.public ? (ar ? 'اضغط لجعله خاصًا' : 'Click to make it private') : (ar ? 'اضغط لمشاركته مع كل من لديه الرابط' : 'Click to share it with anyone who has the link');
    return (
        <button type="button" className={`share-button${access.public ? ' on' : ''}`} disabled={busy} onClick={() => void flip()} aria-pressed={access.public} title={hint}>
            {access.public ? <Globe size={16} /> : <Lock size={16} />}<span>{label}</span>
        </button>
    );
}

function Gate({ title, text, action }: { title: string; text: string; action?: { href: string; label: string } }) {
    return (
        <div className="state state-gate">
            <img className="gate-logo" src={LOGO_DATA_URI} alt="" />
            <h1>{title}</h1>
            <p>{text}</p>
            {action ? <a className="gate-button" href={action.href}>{action.label}</a> : null}
        </div>
    );
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
    const ar = locale === 'ar';
    if (result.status === 'not_found') return <div className="state state-error">{tr('web.transcript.notFound')}</div>;
    if (result.status === 'sign_in') {
        return (
            <Gate title={ar ? 'سجّل الدخول لعرض هذا السجل' : 'Sign in to open this transcript'}
                text={ar ? 'هذا السجل خاص: يفتحه مسؤولو السيرفر، وصاحب التذكرة إذا سمح السيرفر بذلك. سجّل الدخول بحساب Robtic المرتبط بـ Discord.' : 'This transcript is private: the server\u2019s administrators can open it, and the ticket\u2019s owner when the server allows it. Sign in with your Robtic account (Discord linked).'}
                action={result.loginUrl ? { href: result.loginUrl, label: ar ? 'تسجيل الدخول' : 'Sign in' } : undefined} />
        );
    }
    if (result.status === 'forbidden') {
        return <Gate title={ar ? 'لا يمكنك فتح هذا السجل' : 'You can\u2019t open this transcript'}
            text={ar ? 'يفتحه مسؤولو السيرفر فقط، وصاحب التذكرة إذا سمح السيرفر بذلك. اطلب من أحد المسؤولين مشاركته.' : 'Only the server\u2019s administrators can open it, and the ticket\u2019s owner when the server allows it. Ask an administrator to share it.'} />;
    }
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
                        {result.status === 'ok' && result.access.canShare ? (
                            <ShareButton id={id} access={result.access} ar={ar} onChange={(access) => setResult({ ...result, access })} />
                        ) : null}
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
