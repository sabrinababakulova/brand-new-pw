# AGENTS.md — brand-new-pw

This document is the project operations guide for coding agents.

## Project snapshot

- **Project:** `brand-new-pw`
- **Framework:** TanStack Start + TanStack Router (file-based routes)
- **Build tool:** Vite
- **Language:** TypeScript (strict)
- **Package manager/runtime:** Bun (lockfile: `bun.lock`)
- **Styling:** Tailwind CSS v4 + custom CSS tokens (`src/styles.css`)
- **Auth:** Better Auth
- **API layer:** tRPC (`/api/trpc/$`)
- **DB layer:** Drizzle ORM + PostgreSQL
- **i18n:** Paraglide (`messages/en.json`, `messages/de.json`)
- **Lint/format:** Biome

---

## Commands

From `package.json`:

- `bun --bun run dev` — local dev server on port 3000
- `bun --bun run build` — production build
- `bun --bun run preview` — preview build
- `bun --bun run test` — run vitest
- `bun --bun run lint` — biome lint
- `bun --bun run format` — biome format
- `bun --bun run check` — biome check
- `bun --bun run db:generate` — drizzle generate
- `bun --bun run db:migrate` — drizzle migrate
- `bun --bun run db:push` — drizzle push
- `bun --bun run db:pull` — drizzle pull
- `bun --bun run db:studio` — drizzle studio

---

## Directory map

- `src/routes/` — route files (including server/API routes)
- `src/components/` — UI components (Header/Footer/Theme/Locale)
- `src/integrations/` — tanstack-query, trpc, better-auth wrappers
- `src/lib/` — auth client/server helpers + utilities
- `src/db/` — Drizzle db client + schema
- `src/env.ts` — typed env validation via T3 Env
- `messages/` — i18n message catalogs
- `project.inlang/` — Paraglide config
- `public/` — static assets

---

## Current routes

UI routes:

- `/` → `src/routes/index.tsx` (starter landing page)
- `/about` → `src/routes/about.tsx`

API routes:

- `/api/auth/$` → Better Auth handlers (`GET`, `POST`)
- `/api/trpc/$` → tRPC fetch adapter (`GET`, `POST`)

Root shell:

- `src/routes/__root.tsx` defines layout/head/devtools/theme init.

---

## Architecture notes

### Router + app shell

- Router created in `src/router.tsx` using generated `routeTree`.
- Root route context includes:
  - `queryClient`
  - `trpc` options proxy
- `TanStackQueryProvider` wraps app in root shell.
- Header/Footer are global.

### Data fetching

- tRPC client configured via `httpBatchStreamLink`.
- Endpoint resolves to `/api/trpc` (server uses localhost fallback for SSR).
- SuperJSON used for query dehydration/hydration.

### Auth

- Better Auth configured in `src/lib/auth.ts` with:
  - `emailAndPassword.enabled = true`
  - `tanstackStartCookies` plugin
- Auth API route delegates to `auth.handler(request)`.
- Header user block uses `authClient.useSession()`.

### Database

- Drizzle uses `drizzle-orm/node-postgres` in `src/db/index.ts`.
- Requires `process.env.DATABASE_URL` at runtime.
- Initial schema contains `todos` table:
  - `id` serial PK
  - `title` text NOT NULL
  - `created_at` timestamp default now

### i18n

- Paraglide plugin outputs to `src/paraglide`.
- Strategy: `['url', 'baseLocale']` in Vite plugin.
- Locale switcher uses runtime `getLocale`, `setLocale`, `locales`.
- Messages source files:
  - `messages/en.json`
  - `messages/de.json`

### Styling/theme

- Tailwind v4 via `@tailwindcss/vite` plugin.
- Custom theme toggle persists mode in `localStorage` (`light|dark|auto`).
- Inline boot script in root route prevents theme flash.

---

## Environment variables

Observed/required variables:

- `DATABASE_URL` — required by Drizzle db client and drizzle-kit
- `PORT` — optional for SSR TRPC base URL fallback (`default 3000`)
- `SERVER_URL` — optional, validated in `src/env.ts`
- `VITE_APP_TITLE` — optional client env in `src/env.ts`

Files:

- `.env.local` exists locally (do not commit secrets)
- `.gitignore` ignores `*.local` and `.env`

---

## Tooling config notes

- **Biome** (`biome.json`)
  - Tabs for indentation
  - Double quotes in JS formatter
  - Includes `src`, `.vscode`, `vite.config.ts`, etc.
  - Excludes generated `src/routeTree.gen.ts` and `src/styles.css`
- **TSConfig**
  - strict mode on
  - moduleResolution `bundler`
  - path aliases: `#/*` and `@/*` → `src/*`
- **Drizzle** (`drizzle.config.ts`)
  - reads env from `.env.local` then `.env`
  - output dir `./drizzle`

---

## Current status assessment

This is still very close to template/starter state:

- Branding is mostly TanStack starter text/links.
- tRPC router currently uses in-memory todos array (not DB-backed).
- Auth is configured but no dedicated auth pages/workflows in app routes.
- DB schema exists but is not wired into route logic yet.

---

## Agent operating rules for this repo

1. **Do not commit secrets** (`.env*`, tokens, API keys).
2. **Prefer Bun commands** for consistency with lockfile.
3. Keep route changes aligned with file-based routing conventions.
4. If adding user-facing copy, update i18n messages (at least en/de).
5. For API changes, keep client + server tRPC types in sync.
6. For DB changes:
   - update `src/db/schema.ts`
   - generate migration artifacts
   - document migration steps in PR.
7. Run before PR when possible:
   - `bun --bun run check`
   - `bun --bun run test`
   - `bun --bun run build`

---

## Suggested next implementation priorities

1. Replace template content/branding in Header/Footer/Home/About.
2. Add real auth screens and protected route examples.
3. Connect tRPC todo procedures to Drizzle/Postgres.
4. Add seed script and basic integration tests.
5. Expand i18n coverage across all user-facing labels.
6. Add deployment README section (runtime, env, migration flow).

---

If you are a coding agent, use this file as orientation and re-verify against source before major refactors.