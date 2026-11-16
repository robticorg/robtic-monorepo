import { Collection } from "discord.js";
import env from "@robo/config";
import { connectDatabase } from "@robo/db";
import { initLogger, Logger } from "@robo/logger";
import type { CommandType } from "@/types";
import client from "@/lib/Client";
import { loadEvents } from "@/handlers/events.handler";
import { startWatchdog } from "@/lib/watchdog";
import { loadCommands, registerCommands } from "@/handlers/commands.handler";

// Robtic Ticket: ticket panels designed on the dashboard (robtic.org/discord/public/<server>/ticket), private ticket
// channels with their own permissions and controls, full transcripts. Order: database, events, commands, log in.

initLogger({ level: env.isDev ? "debug" : "info", json: false });

client.commands = new Collection<string, CommandType>();

startWatchdog(client);
await connectDatabase(env.mongoUri);
await loadEvents();
await loadCommands();
await registerCommands();
await client.login(env.token);

const stop = async () => {
    Logger.info("Shutting down");
    await client.destroy();
    process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
