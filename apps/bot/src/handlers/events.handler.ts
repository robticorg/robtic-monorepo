import path from "path";

import client from "@/lib/Client";
import { Loader } from "@/utils/loader";

const loader = new Loader("src");

await loader.scan(async (filePath) => {
    const isEventFile =
        filePath.endsWith(".event.ts") ||
        filePath.endsWith(".event.js");

    if (!isEventFile) return;

    const event = (await import(path.resolve(filePath))).default;

    if (!event?.name || !event?.run) {
        throw new Error(`Event at ${filePath} is missing required properties.`);
    }

    const execute = (...args: unknown[]) => event.run(...args);

    if (event.once) {
        client.once(event.name, execute);
    } else {
        client.on(event.name, execute);
    }
}, "EVENT");
