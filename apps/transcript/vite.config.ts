import { defineConfig, type Plugin } from 'vite';
import { BASE } from './base';
import { findTranscript } from './src/source';

/**
 * The transcript page. `bun run dev` serves it on http://localhost:5180<BASE>/<id> (see base.ts) with the API built in: it reads
 * the bot's MongoDB when MONGODB_URI is set, and always knows the sample transcript `tr_showcase`.
 * Production: `bun run build`, then `bun server.ts` serves the build and the same API.
 */
const api = (): Plugin => ({
    name: 'transcript-api',
    configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
            const url = req.originalUrl ?? req.url ?? '';
            const m = url.startsWith(`${BASE}/api/`) ? /^([A-Za-z0-9_]+)$/.exec(url.slice(BASE.length + 5)) : null;
            if (!m) return next();
            const doc = await findTranscript(m[1]!).catch(() => null);
            res.statusCode = doc ? 200 : 404;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify(doc ?? { error: 'not_found' }));
        });
    },
});

export default defineConfig({
    // JSX through Vite's own esbuild (the babel-based React plugin breaks under Bun's installer).
    base: `${BASE}/`,
    esbuild: { jsx: 'automatic' },
    plugins: [api()],
    server: { port: Number(process.env.TRANSCRIPT_PORT ?? 5180), strictPort: true },
    build: { outDir: 'dist', emptyOutDir: true },
});
