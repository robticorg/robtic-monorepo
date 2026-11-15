import path from "path";
import client from "@/lib/Client";
import { handleError } from "@/handlers/error.handler";
import { Loader } from "@/utils/loader";

// Every *.event.ts under src: `name` is the Discord event, `run` its listener, `once` for one-time events. A listener
// that throws is logged, never crashes the bot.

const loader = new Loader(path.join(import.meta.dir, ".."));

export async function loadEvents() {
    await loader.scan(async (filePath) => {
        if (!filePath.endsWith(".event.ts") && !filePath.endsWith(".event.js")) return;
        const event = (await import(path.resolve(filePath))).default;
        if (!event?.name || !event?.run) throw new Error(`Event at ${filePath} is missing name or run.`);
        const execute = (...args: unknown[]) => Promise.resolve(event.run(...args)).catch((err: unknown) => handleError(err, filePath));
        if (event.once) client.once(event.name, execute);
        else client.on(event.name, execute);
    }, "EVENT");
}
