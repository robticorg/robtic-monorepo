# Copilot Instructions — Robtic Monorepo

## Architecture

Bun-workspace monorepo (`"type": "module"`, ESM everywhere). Three apps consume four shared libs:

```
apps/bot        → Discord.js ticket bot (Bun runtime, top-level await)
apps/api        → NestJS REST API (scaffold, not yet wired to libs)
apps/dashboard  → Next.js 16 + Tailwind v4 + shadcn/ui (skeleton)

libs/shared     → Shared TypeScript types (@robo/shared)
libs/config     → Env validation + MongoDB connector (@robo/config)
libs/database   → Prisma ORM services over PostgreSQL (@robo/db)
libs/logger     → Chalk-based logger with file rotation (@robo/logger)
```

**Dependency flow:** `shared` ← `logger` ← `config` ← `database` ← `bot`. The API app is standalone for now.

**Path aliases** are defined in `tsconfig.base.json`: `@robo/db`, `@robo/config/*`, `@robo/logger`, `@robo/shared`. The bot also uses `@/` → `src/` and `lib/` → `src/lib/` (see `apps/bot/tsconfig.json`).

## Key Commands

| Task | Command |
|---|---|
| Install deps | `bun install` (from root) |
| Dev bot | `bun dev:bot` (uses `bun --watch`) |
| Dev dashboard | `bun dev:dash` |
| Prisma generate | `bun build:db` |
| Prisma migrate | `bun create:db` |
| Prisma Studio | `bun dev:db` |
| Seed database | `bun import:db` |
| Build all | `bun build` (libs first, then apps) |
| Typecheck | `bun typecheck` (project references via `tsconfig.build.json`) |
| API dev | `cd apps/api && bun start:dev` (NestJS `--watch`) |
| API tests | `cd apps/api && bun test` (Jest) |
| Bot tests | `cd apps/bot && bun test` (Bun test runner) |

## Bot Patterns

- **Entry:** `apps/bot/src/bot.ts` — side-effect imports handlers, loads commands, registers slash commands, then `client.login()`.
- **Client:** Plain `discord.js Client` singleton (not subclassed). `commands` collection added via module augmentation in `types/client.d.ts`.
- **Command files** (`src/commands/*.ts`): Default-export `{ data: SlashCommandBuilder, run(interaction, client), access? }`.
- **Event files** (`src/events/*.ts`): Default-export `{ name: Events.*, once?: boolean, run(...args) }`.
- **Component files** (`src/components/*.ts`): Same event shape — loaded alongside events by `events.handler.ts`.
- **Interaction routing:** Three separate `InteractionCreate` listeners filter by `isChatInputCommand()`, `isButton()`/`isStringSelectMenu()`, and `isModalSubmit()`. Button customIds use `ticket_`/`menu_` prefixes.
- **Permission system:** 3 layers — static Discord permission flags (`Permissions/permissions.ts`), button configs (`Permissions/buttons.ts`), and per-guild DB overrides (`PermissionService`). Action dispatch maps `ButtonType` → action functions in `Permissions/actions/*.ts`.
- **Error handling:** `BotError` class with typed categories (`"EVENT"`, `"COMMAND"`, `"DATABASE"`). Always use `InteractionUtils.safeReply()`/`safeDefer()` to wrap Discord replies.
- **Loader:** `utils/loader.ts` — flat directory scanner (non-recursive). Uses `readdirSync` + dynamic `import()`.

## Database Patterns

- **Schema:** `libs/database/prisma/schema.prisma` — PostgreSQL with Prisma Accelerate. Key models: `Guild → Panel → TicketPanel → Ticket`, `FormData → Question`, `Permission`, `ButtonData`.
- **Services** (`libs/database/src/services/`): `GuildService`, `TicketService`, `PanelService`, `FormService`, `PermissionService`. All methods are async, wrap Prisma in `try/catch`, log via `Logger.database()`/`Logger.error()`, and return `null` on failure (no thrown exceptions).
- **Barrel export:** `libs/database/src/db.ts` re-exports all services, generated Prisma types, defaults, and the `prisma` client instance.
- **Generated output:** Prisma client outputs to `libs/database/generated/prisma/` (not `node_modules`).

## Dashboard Patterns

Feature-based structure under `apps/dashboard/src/features/` — each feature gets `components/`, `hooks/`, `utils/`, `types.ts`. Uses `@/` path alias. UI components via shadcn/ui in `src/common/components/ui/`.

## Conventions

- **Package scope:** All workspace packages use `@robo/*` — use this when adding new libs.
- **Module system:** ESM with `"type": "module"`. Use `import`/`export`, not `require`.
- **File naming:** `camelCase.ts` for most files, `PascalCase.ts` for classes/embeds. Note known typos: `message.hendler.ts`, `persmession.ts`, `ticektAccess.ts` — preserve these names to avoid breaking imports.
- **Export style:** Default exports for bot event/command modules; named exports + barrel files for libs.
- **Logger usage:** Import `{ Logger }` from `@robo/logger`. Levels: `debug`, `success`, `info`, `warn`, `error`, `database`.
- **Env vars:** `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID` (optional), `MONGO_URI`, `DATABASE_URL`. Validated in `libs/config/src/env.ts`.
