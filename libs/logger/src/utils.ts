import fs from "fs-extra";
import path from "path";
import dayjs from "dayjs";

export function ensureDir(dir: string) {
    try {
        fs.ensureDirSync(dir);
    } catch (err) {
        // swallow; caller will try again
    }
}

export function timestamp(local = true) {
    const now = dayjs();
    return now.format("YYYY-MM-DD HH:mm:ss");
}

export function dailyFile(name: string) {
    return `${name}-${dayjs().format("YYYY-MM-DD")}.log`;
}

/** Appends a line to a log file. A log file that can't be written (no folder, no permission) never stops the bot. */
export async function appendFileSafe(filePath: string, data: string) {
    try {
        await fs.appendFile(filePath, data + "\n");
    } catch (err: any) {
        if (err?.code !== "ENOENT") return;
        try {
            await fs.ensureDir(path.dirname(filePath));
            await fs.appendFile(filePath, data + "\n");
        } catch {
            // the console line was already printed
        }
    }
}
