import path from "path";
import { REST, Routes } from "discord.js";
import env from "@robo/config";
import { Logger } from "@robo/logger";
import client from "@/lib/Client";
import { Loader } from "@/utils/loader";

// Slash commands: every *.command.ts under src, registered on the development server (instant) when DISCORD_GUILD_ID
// is set, globally otherwise.

const loader = new Loader(path.join(import.meta.dir, ".."));

export async function loadCommands() {
    await loader.scan(async (filePath) => {
        if (!filePath.endsWith(".command.ts") && !filePath.endsWith(".command.js")) return;
        const command = (await import(path.resolve(filePath))).default;
        if (!command?.data || !command?.run) throw new Error(`The command at ${filePath} is missing data or run.`);
        client.commands.set(command.data.name, command);
    }, "COMMAND");
}

export async function registerCommands() {
    const rest = new REST({ version: "10" }).setToken(env.token);
    try {
        const route = env.devGuildId ? Routes.applicationGuildCommands(env.clientId, env.devGuildId) : Routes.applicationCommands(env.clientId);
        const data = (await rest.put(route, { body: client.commands.map((cmd) => cmd.data.toJSON()) })) as unknown[];
        Logger.info(`Registered ${data.length} slash command(s) ${env.devGuildId ? `on ${env.devGuildId}` : "globally"}.`);
    } catch (error) {
        Logger.error("Registering slash commands failed", error);
    }
}
