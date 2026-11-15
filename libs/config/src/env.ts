// The bot's settings, from the environment (Bun loads .env by itself). Only the token and the database are required;
// everything a server decides lives in its settings document, edited on the dashboard.

const str = (key: string, fallback = ''): string => process.env[key]?.trim() || fallback;

function required(key: string): string {
    const value = str(key);
    if (!value) throw new Error(`Missing required environment variable: ${key}`);
    return value;
}

/** The bot's application id inside its token (the first part is the bot user's id, base64). */
function idFromToken(token: string): string {
    const id = Buffer.from(token.split('.')[0] ?? '', 'base64').toString('utf8');
    if (!/^\d{15,22}$/.test(id)) throw new Error('Missing required environment variable: DISCORD_CLIENT_ID');
    return id;
}

const token = required('DISCORD_TOKEN');

export const env = {
    token,
    /** DISCORD_CLIENT_ID, or the id inside the token when it isn't set. */
    clientId: str('DISCORD_CLIENT_ID') || idFromToken(token),
    /** Development: slash commands are registered on this server only (instant). Unset: globally. */
    devGuildId: str('DISCORD_GUILD_ID') || null,
    mongoUri: str('MONGODB_URI', str('MONGO_URI', 'mongodb://127.0.0.1:27017/robtic-ticket')),
    /** Where the transcript page is served; links in Discord point here. Unset: the HTML file only. */
    transcriptBaseUrl: str('TRANSCRIPT_BASE_URL').replace(/\/+$/, '') || null,
    /** Seconds between checks for "post this panel" requests from the dashboard. */
    panelPollSeconds: Number(str('PANEL_POLL_SECONDS', '5')),
    isDev: str('NODE_ENV') === 'dev' || str('NODE_ENV') === 'development',
} as const;

export default env;
