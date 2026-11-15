// Where the transcript page lives: <BASE>/<id>, its data at <BASE>/api/<id>. Locally /transcript; in production
// /discord/transcripts (robtic.org/discord/transcripts/<id>), set with TRANSCRIPT_BASE_PATH at build time and at start.
export const BASE = '/' + (process.env.TRANSCRIPT_BASE_PATH ?? '/transcript').replace(/^\/+|\/+$/g, '');
