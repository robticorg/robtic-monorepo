import { join } from 'node:path';
import { findTranscript } from './src/source';

// Production: the built page (dist/, from `bun run build`) and the transcript API, on one port. Put it behind the proxy
// at the address TRANSCRIPT_BASE_URL points to (the bot links there).

const PORT = Number(process.env.TRANSCRIPT_PORT ?? 5180);
const DIST = join(import.meta.dir, 'dist');
const page = () => new Response(Bun.file(join(DIST, 'index.html')), { headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex' } });

Bun.serve({
    port: PORT,
    async fetch(req) {
        const { pathname } = new URL(req.url);
        const api = /^\/api\/transcripts\/([A-Za-z0-9_]+)$/.exec(pathname);
        if (api) {
            const doc = await findTranscript(api[1]!).catch(() => null);
            return Response.json(doc ?? { error: 'not_found' }, { status: doc ? 200 : 404, headers: { 'cache-control': 'private, max-age=60' } });
        }
        if (pathname.startsWith('/assets/')) {
            const file = Bun.file(join(DIST, pathname));
            if (await file.exists()) return new Response(file, { headers: { 'cache-control': 'public, max-age=31536000, immutable' } });
        }
        if (pathname.startsWith('/transcript/')) return page();
        return new Response('Not found', { status: 404 });
    },
});

console.log(`[transcript] http://localhost:${PORT}/transcript/tr_showcase`);
