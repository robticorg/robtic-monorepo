import { TRANSCRIPT_PUBLIC_ID_PATTERN, type TicketTranscriptDocument } from '@robo/shared';
import { showcaseTranscript } from './showcase';

// Where a transcript comes from: the bot's MongoDB (`transcripts`, saved when a ticket closes) when MONGODB_URI is set,
// plus the built-in sample `tr_showcase` (and the dashboard's mock list `tr_mock…`) so the page can be tried locally.

let connecting: Promise<boolean> | null = null;

async function db(): Promise<boolean> {
    const uri = process.env.MONGODB_URI?.trim();
    if (!uri) return false;
    connecting ??= import('@robo/db').then(async (m) => { await m.connectDatabase(uri); return true; }).catch(() => { connecting = null; return false; });
    return connecting;
}

export async function findTranscript(id: string): Promise<TicketTranscriptDocument | null> {
    if (id === 'tr_showcase' || /^tr_mock\d+$/.test(id)) return showcaseTranscript(id);
    if (!TRANSCRIPT_PUBLIC_ID_PATTERN.test(id) || !(await db())) return null;
    const { TranscriptRepository } = await import('@robo/db');
    const row = await new TranscriptRepository().byPublicId(id);
    return (row?.document as TicketTranscriptDocument | undefined) ?? null;
}
