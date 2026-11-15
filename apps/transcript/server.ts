// Settings from the admin console (the bot's database) before the transcript source reads MONGODB_URI.
import '@robo/config/remote';
import { join } from 'node:path';
import { BASE } from './base';
import { findTranscript } from './src/source';

// Production: the built page (dist/, from `bun run build` with the same TRANSCRIPT_BASE_PATH) and the transcript API,
// on one port. The proxy sends robtic.org<BASE>/ here unchanged; the bot links to TRANSCRIPT_BASE_URL/<id>.

const PORT = Number(process.env.TRANSCRIPT_PORT ?? 5180);
const DIST = join(import.meta.dir, 'dist');
const ID = /^[A-Za-z0-9_]+$/;
const SAMPLE = /^(tr_showcase|tr_mock\d+)$/;
const page = () => new Response(Bun.file(join(DIST, 'index.html')), { headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex' } });

Bun.serve({
    port: PORT,
    async fetch(req) {
        const { pathname } = new URL(req.url);
        if (pathname === '/health') return Response.json({ ok: true });
        if (!pathname.startsWith(`${BASE}/`)) return new Response('Not found', { status: 404 });
        const rest = pathname.slice(BASE.length + 1);
        // Only the built-in samples are served here. Real transcripts come from the dashboard's API, which checks who is
        // asking (GET /discord/api/ticket/transcript/:id): serving them here too would skip that check.
        if (rest.startsWith('api/')) {
            const id = rest.slice(4);
            const doc = SAMPLE.test(id) ? await findTranscript(id).catch(() => null) : null;
            return Response.json(doc ?? { error: 'not_found' }, { status: doc ? 200 : 404, headers: { 'cache-control': 'private, max-age=60', 'x-robots-tag': 'noindex' } });
        }
        if (rest.startsWith('assets/') && !rest.includes('..')) {
            const file = Bun.file(join(DIST, rest));
            if (await file.exists()) return new Response(file, { headers: { 'cache-control': 'public, max-age=31536000, immutable' } });
        }
        if (ID.test(rest.replace(/\/$/, ''))) return page();
        return new Response('Not found', { status: 404 });
    },
});

console.log(`[transcript] http://localhost:${PORT}${BASE}/tr_showcase`);
