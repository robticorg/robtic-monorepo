import { Client, GatewayIntentBits, Partials } from "discord.js";

// Message Content and the reaction intents are needed for transcripts (every message, edit, delete and reaction in a
// ticket); Guild Members for permission checks. Partials let edits and deletes of uncached messages still arrive.
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User],
});

export default client;
