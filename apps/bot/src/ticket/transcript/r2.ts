import { S3Client } from "bun";
import { Logger } from "@robo/logger";
import type { TicketTranscriptDocument } from "@robo/shared";

// Transcript pictures in Cloudflare R2 (bucket robtic-images, served at images.robtic.org). Discord's attachment
// links expire, so when a transcript is saved its pictures are copied to R2 and the transcript points there. Each is
// named by its Discord attachment id, so saving the transcript again (Delete, the Transcript control) reuses the copy
// even after Discord's link has expired.
//
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL. Without them: Discord's links, as before.

const env = (k: string) => process.env[k]?.trim() ?? "";
const ready = () => Boolean(env("R2_ACCOUNT_ID") && env("R2_ACCESS_KEY_ID") && env("R2_SECRET_ACCESS_KEY") && env("R2_BUCKET") && env("R2_PUBLIC_URL"));
const MAX_BYTES = 25 * 1024 * 1024;
const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };

let client: S3Client | null = null;
const s3 = () => (client ??= new S3Client({
    accessKeyId: env("R2_ACCESS_KEY_ID"),
    secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    bucket: env("R2_BUCKET"),
    endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    region: "auto",
}));
const publicBase = () => env("R2_PUBLIC_URL").replace(/\/+$/, "");

/** Copies the transcript's pictures to R2 and points the document at them. Never throws; a failure keeps Discord's link. */
export async function keepPictures(doc: TicketTranscriptDocument, guildId: string): Promise<number> {
    if (!ready()) return 0;
    let kept = 0;
    for (const m of doc.messages) {
        for (const a of m.attachments) {
            if (!a.isImage || a.url.startsWith(publicBase())) continue;
            const type = (a.contentType ?? "").split(";")[0]!.trim();
            const ext = EXT[type] ?? (/\.(png|jpe?g|webp|gif|avif)$/i.exec(a.filename)?.[1]?.toLowerCase().replace("jpeg", "jpg"));
            if (!ext || a.size > MAX_BYTES) continue;
            const key = `tickets/${guildId}/${doc.transcriptId}/${a.id}.${ext}`;
            try {
                const file = s3().file(key);
                if (!(await file.exists())) {
                    const res = await fetch(a.url, { signal: AbortSignal.timeout(15_000) });
                    if (!res.ok) continue;
                    await file.write(new Uint8Array(await res.arrayBuffer()), { type: type || `image/${ext}` });
                }
                a.url = `${publicBase()}/${key}`;
                a.proxyUrl = a.url;
                kept++;
            } catch (err) {
                Logger.warn(`[transcript] couldn't keep picture ${a.id} in R2: ${(err as Error).message}`);
            }
        }
    }
    return kept;
}
