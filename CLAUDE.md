# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Next.js dev server (hot reload)
npm run build     # production build
npm run lint      # run ESLint
npm test          # run unit tests
```

Running the frontend against the local backend:
```bash
FMS_URL=http://localhost:4000 npm run dev
```

The full local stack (Postgres, Valkey, FMS, UI) can be started from the parent directory with `make start`. See the root `Makefile` for details.

## Architecture

Fleet Manager is the web frontend for VECTR Fleet Intelligence. It's a Next.js 16 app (App Router, React 19, TypeScript) that communicates with the Fleet Manager Server (FMS) Go API via a tRPC layer.

### Tech stack

- **Framework**: Next.js 16 with App Router, `output: "standalone"`
- **UI**: Tailwind CSS 4, shadcn/ui (base-nova style)
- **Icons**: Always use `lucide-react` — never create inline/custom SVG icons. Import from `lucide-react` and use as components (e.g., `<Settings />`, `<Map />`)
- **State**: TanStack React Query via tRPC
- **Maps**: Leaflet + react-leaflet with OpenStreetMap tiles
- **i18n**: next-intl (messages in `messages/en.json`)
- **Validation**: Zod schemas in `src/lib/types.ts`
- **Real-time telemetry**: NATS via `@nats-io/nats-core` (wsconnect) + `@nats-io/jetstream` — connects to Synadia Cloud over WebSocket (`wss://connect.ngs.global`)

### Package layout

- `src/app/` — Next.js App Router pages and layouts
  - `(dashboard)/` — authenticated dashboard pages (bases, fleet, map, missions, etc.)
  - `admin/` — sysadmin panel (login, organisations, sysadmin management)
  - `login/`, `setup/`, `select-org/` — auth flows
- `src/server/` — tRPC server-side routers (BFF layer calling FMS API)
- `src/lib/` — shared utilities
  - `fms.ts` — HTTP client for the FMS API (`FMS_URL` env var, defaults to `http://fms:4000`)
  - `trpc/` — tRPC client and provider
  - `types.ts` — Zod schemas and TypeScript types for all API entities
  - `auth/` — cookie-based auth helpers
- `src/components/` — React components organised by domain
  - `ui/` — shadcn/ui primitives (Button, Badge, Tabs, etc.)
  - `dashboard/` — reusable dashboard components (ActionButton, ConfirmModal, FieldInput, FieldSelect, Toggle)
  - `layout/` — Topbar, Sidebar
  - `map/` — Leaflet map components
  - `landing/` — public landing page
  - `auth/` — auth flow components
  - `settings/` — settings page components
- `src/hooks/` — custom React hooks
- `src/i18n/` — next-intl config
- `messages/` — i18n translation files
- `prototype/` — HTML design mockups (reference only, see Design section below)

### Key patterns

- **tRPC BFF**: frontend never calls the FMS API directly. All data flows through `src/server/routers/` which call `fms.ts` server-side. This keeps auth tokens on the server.
- **Zod schemas**: all API response shapes are defined in `src/lib/types.ts` and used for runtime validation.
- **Dark theme only**: the app uses `class="dark"` on `<html>`. All design uses the dark palette.

## Design

### Visual identity

The UI follows a **Vercel + Cloudflare** design aesthetic: ultra-clean dark theme, monospace labels, subtle 1px borders, generous negative space, and restrained use of colour. This is the north star for all UI work.

Key design tokens (defined in `src/app/globals.css`):
- **Background**: `#080808` (bg), `#0f0f0f` (surface/card), `#0a0a0a` (inset)
- **Borders**: `#1a1a1a` (primary), `#252525` (secondary)
- **Text**: `#e8e8e8` (foreground), `#888` (muted), `#555` (subtle), `#3a3a3a` (faint)
- **Semantic colours**: `fleet-green` (#22c55e), `fleet-amber` (#f59e0b), `fleet-red` (#ef4444), `fleet-blue` (#3b82f6)
- **Fonts**: Geist Mono for labels/data, DM Sans for body text

### Prototype mockups

The `prototype/` directory contains HTML mockups (`claude_vectr_dashboard.html`) that represent the **design direction** we want to move toward. These are guidelines, not pixel-perfect specs:

- Use them as reference for layout patterns, colour usage, and component density
- The actual features and visual details are decided during implementation based on what the backend supports and what makes the most UX sense
- When building a new page or major component, discuss the design approach first — don't just copy the mock

### Building new UI

When creating new pages or significant visual components:

1. **Design first** — discuss the approach, create browser mockups if helpful, and align on the design before writing production code
2. **Use dashboard components** — prefer `ActionButton`, `ConfirmModal`, `FieldInput`, `FieldSelect`, `Toggle` from `@/components/dashboard` over inline Tailwind button/input styles
3. **Destructive actions need confirmation** — decommission, revoke, delete, and similar operations must use `ConfirmModal`
4. **Stay within the design system** — use the established colour tokens, border styles, and typography. Don't introduce new colours or font sizes without reason

### Component conventions

- **Action buttons**: use `ActionButton` with variants (`default`, `primary`, `green`, `amber`, `danger`, `ghost`)
- **Form inputs**: use `FieldInput` (removes native spinners, consistent focus ring)
- **Toggles**: use `Toggle` instead of raw checkboxes for on/off settings
- **Modals**: use `ConfirmModal` for destructive confirmations; full custom modals for complex forms (create base, credential display)
- **Status indicators**: use `StatusChip` (pill with animated dot) for entity status, `StatusDot` for compact table indicators

## Git workflow

- **Never commit code without explicit user approval** — write and test the code, but do not run `git add` or `git commit` unless the user explicitly asks you to commit.
- **No Co-Authored-By trailers** — never add `Co-Authored-By` lines (or any AI attribution) to commit messages.
