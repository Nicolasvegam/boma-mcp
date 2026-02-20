# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

```bash
npm run build        # Build with tsup (output: build/)
npm run dev          # Build in watch mode
npm run start        # Run the built server (node build/index.js)
npx tsc --noEmit     # Type-check without emitting
```

No test framework is configured.

## Environment

Requires two env vars (server exits without them):
- `BOMA_USER_EMAIL`
- `BOMA_USER_PASSWORD`

## Architecture

This is an MCP (Model Context Protocol) server that exposes Boma room reservation tools over stdio. It connects to a Supabase backend.

**Layers:**

1. **`src/index.ts`** — Entry point. Validates env vars, creates `McpServer` + `BomaClient`, registers tools, connects stdio transport.
2. **`src/tools/`** — Tool registration functions (`registerReservationTools`, `registerUserTools`, `registerCalendarTools`). Each tool uses a Zod schema from `dtos/` for input validation and delegates to `BomaClient`.
3. **`src/dtos/`** — Zod schemas paired with TypeScript types for each tool's input. Schemas are passed directly to `server.tool()`.
4. **`src/client/boma.client.ts`** — Single class wrapping all Supabase queries. Handles auth session caching, room name-to-UUID resolution, and timezone conversion.
5. **`src/constants/`** — Supabase config, database table/column names (`ROOMS`, `ROOM_RESERVATIONS`, `USER_PROFILES`), timezone utilities, and the `AVAILABLE_ROOMS` list.
6. **`src/entities/`** — Domain types used by the client (`ReservationPayload`, `ReservationUpdate`).

**Adding a new tool:** Create a Zod schema + type in `dtos/`, add the client method in `boma.client.ts`, register the tool in the appropriate `tools/*.ts` file.

## Key Conventions

- All user-facing times are in `America/Santiago` timezone; the client converts to/from UTC for Supabase storage (`constants/timezone.ts`).
- Database table and column names are centralized in `constants/database.ts` as `TABLE_NAME.COLUMN` (e.g., `ROOM_RESERVATIONS.START_TIME`).
- Room names (Big Mike, Gran Enana, Lakatán, Dacca, Cavendish, Dominico) are the public identifiers; the client resolves them to Supabase UUIDs internally via a cached map.
- Build target is ESM-only, Node 20. The tsup config adds a shebang banner for CLI usage.
