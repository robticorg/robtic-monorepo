import client from "lib/Client";
import "dotenv/config";
import { initLogger, Logger } from "@robo/logger";

import env from "@robo/config";

import { Collection } from "discord.js";
import type { CommandType } from "@/types";

client.commands = new Collection<string, CommandType>();

import "@/handlers/events.handler";
import { LoadCommands, registeCommands } from "./handlers/commands.handler";

await LoadCommands();
await registeCommands();

initLogger({
    level: "debug",
    json: false,
});

await client.login(env.token.value).then(() => {
    Logger.debug("✅ Bot was started");
})