import path from "path";

import client from "@/lib/Client";

import env from "@robo/config";
import { Logger } from "@robo/logger";

import { REST, Routes } from "discord.js";

import { Loader } from "@/utils/loader";

const loader = new Loader("src");

export async function loadCommands() {
    await loader.scan(async (filePath) => {
        const isCommandFile =
            filePath.endsWith(".command.ts") ||
            filePath.endsWith(".command.js");

        if (!isCommandFile) return;

        const command = (await import(path.resolve(filePath))).default;

        if (!command?.data || !command?.run) {
            throw new Error(
                `The command at ${filePath} is missing required properties.`
            );
        }

        client.commands.set(command.data.name, command);
    }, "COMMAND");
}

export async function registerCommands() {
    const rest = new REST({ version: "10" }).setToken(
        env.token.value!
    );

    try {
        Logger.debug(
            `Started refreshing ${client.commands.size} application (/) commands.`
        );

        const route =
            process.env.NODE_ENV === "dev"
                ? Routes.applicationGuildCommands(
                      env.clientId.value!,
                      env.guildId.value!
                  )
                : Routes.applicationCommands(
                      env.clientId.value!
                  );

        const data = (await rest.put(route, {
            body: client.commands.map((cmd) =>
                cmd.data.toJSON()
            ),
        })) as [];

        Logger.debug(
            `Successfully reloaded ${data.length} application (/) commands.`
        );
    } catch (error) {
        Logger.error(String(error));
    }
}
