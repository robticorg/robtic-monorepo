# Robtic Ticket: one image, two processes (robtic-bots stack):
#   the bot             bun apps/bot/src/bot.ts           (default)
#   the transcript page bun apps/transcript/server.ts     (robtic.org/discord/transcripts/<id>)
# Settings come from the admin console (ROBTIC_CONFIG_MONGO_URI + ROBTIC_CONFIG_KEY + ROBTIC_BOT=ticket); see
# libs/config/src/remote-config.ts. Nothing secret is baked in.

FROM oven/bun:1.3.14 AS build
WORKDIR /app
COPY . .
# Only the bot and the transcript page (not the old api/ and dashboard/ apps). No git here, so no postinstall.
RUN bun install --frozen-lockfile --ignore-scripts --filter '@robo/bot' --filter '@robo/transcript-web'
ARG TRANSCRIPT_BASE_PATH=/discord/transcripts
RUN cd apps/transcript && TRANSCRIPT_BASE_PATH=$TRANSCRIPT_BASE_PATH bunx --bun vite build --config vite.config.ts

FROM oven/bun:1.3.14
WORKDIR /app
ARG TRANSCRIPT_BASE_PATH=/discord/transcripts
ENV NODE_ENV=production \
    ROBTIC_BOT=ticket \
    TRANSCRIPT_BASE_PATH=$TRANSCRIPT_BASE_PATH \
    TRANSCRIPT_PORT=5180
COPY --from=build --chown=bun:bun /app /app
# The logger writes to /app/logs; /app itself (made by WORKDIR) is root's, so make the folder for the bun user.
RUN mkdir -p /app/logs && chown bun:bun /app /app/logs
USER bun
EXPOSE 5180
CMD ["bun", "apps/bot/src/bot.ts"]
