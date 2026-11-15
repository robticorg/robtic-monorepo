import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { TicketTranscriptDocument } from '@robo/shared';
import { buildTranscriptHtml } from './lib/export-html';

// The transcript as one standalone HTML file (no scripts, works offline but for remote images): what the bot attaches
// in the transcript channel and the owner's DM. Same components and stylesheet as the transcript page.

let css: string | null = null;
const styles = () => (css ??= readFileSync(join(import.meta.dir, 'styles.css'), 'utf8'));

export function transcriptHtml(doc: TicketTranscriptDocument): Promise<string> {
    return buildTranscriptHtml(doc, doc.locale, styles(), { details: true });
}

export { exportFilename } from './lib/export-formats';
