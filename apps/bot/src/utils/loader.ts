import { readdirSync, statSync } from "fs";
import path from "path";

import { BotError, handleError } from "@/handlers/error.handler";

import { Logger } from "@robo/logger";

type ErrorType = "EVENT" | "COMMAND" | "DATABASE";

export class Loader {
    constructor(private basePath: string) {}

    async scan(
        callback: (file: string, name: string) => Promise<void>,
        errorType: ErrorType
    ) {
        await this.walk(this.basePath, callback, errorType);
    }

    private async walk(
        currentPath: string,
        callback: (file: string, name: string) => Promise<void>,
        errorType: ErrorType
    ) {
        const files = readdirSync(currentPath);

        for (const file of files) {
            const filePath = path.join(currentPath, file);
            const stat = statSync(filePath);

            if (stat.isDirectory()) {
                await this.walk(filePath, callback, errorType);
                continue;
            }

            const isSupportedFile =
                file.endsWith(".event.ts") ||
                file.endsWith(".event.js") ||
                file.endsWith(".command.ts") ||
                file.endsWith(".command.js");

            if (!isSupportedFile) continue;

            const name = file
                .replace(".event.ts", "")
                .replace(".event.js", "")
                .replace(".command.ts", "")
                .replace(".command.js", "");

            try {
                await callback(filePath, name);
            } catch (error) {
                handleError(
                    new BotError(
                        `Failed to load file`,
                        errorType
                    ),
                    filePath
                );

                Logger.error(String(error));
            }
        }
    }
}