# VECTR Fleet Dashboard Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a functional Next.js prototype of the VECTR Fleet Intelligence dashboard with server-side simulation, tRPC API, interactive map, and i18n readiness.

**Architecture:** Next.js 15 App Router with a persistent layout shell (topbar + sidebar). tRPC serves mock data from an in-memory simulation engine that ticks every second. Client polls via React Query. Drone selection state managed via React context. All user-facing strings extracted for i18n via next-intl.

**Tech Stack:** Next.js 15, Tailwind CSS v4, shadcn/ui, tRPC v11, react-leaflet, Zod, next-intl

**Spec:** `docs/specs/2026-03-11-fleet-dashboard-design.md`
**Reference mock:** `claude_vectr_dashboard.html`

---

## Chunk 1: Project Foundation

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Create Next.js project**

```bash
cd /Users/xmedavid/dev/vectr/fleet
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --yes
```

Expected: Project scaffolded with App Router, Tailwind, TypeScript.

- [ ] **Step 2: Verify it runs**

```bash
cd /Users/xmedavid/dev/vectr/fleet
npm run dev
```

Expected: Dev server starts on localhost:3000.

- [ ] **Step 3: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js 15 project"
```

---

### Task 2: Install core dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install tRPC, Zod, react-leaflet, next-intl, and utilities**

```bash
npm install @trpc/server@next @trpc/client@next @trpc/react-query@next @tanstack/react-query zod superjson react-leaflet leaflet next-intl
npm install -D @types/leaflet
```

- [ ] **Step 2: Verify install**

```bash
npm ls @trpc/server @tanstack/react-query zod react-leaflet next-intl
```

Expected: All packages listed, no peer dependency errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install tRPC, Zod, react-leaflet, next-intl"
```

---

### Task 3: Initialize shadcn/ui

**Files:**
- Create: `components.json`, `src/lib/utils.ts`, `src/components/ui/`

- [ ] **Step 1: Run shadcn init**

```bash
npx shadcn@latest init --defaults
```

- [ ] **Step 2: Add required components**

```bash
npx shadcn@latest add button badge tabs progress alert-dialog tooltip
```

- [ ] **Step 3: Verify components exist**

Check that `src/components/ui/button.tsx`, `tabs.tsx`, `badge.tsx`, `progress.tsx`, `alert-dialog.tsx`, `tooltip.tsx` exist.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: initialize shadcn/ui with core components"
```

---

### Task 4: Configure design tokens and fonts

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `tailwind.config.ts` (if exists, or CSS-based config for Tailwind v4)

The mock uses these exact color values. We map them into Tailwind's theme so components use `bg-surface`, `text-text-dim`, `border-border2`, etc.

- [ ] **Step 1: Update globals.css with design tokens**

Replace the contents of `src/app/globals.css` with:

```css
@import "tailwindcss";

@theme {
  --color-bg: #080808;
  --color-surface: #0f0f0f;
  --color-border: #1a1a1a;
  --color-border2: #252525;
  --color-muted: #3a3a3a;
  --color-subtle: #666666;
  --color-text: #e8e8e8;
  --color-text-dim: #888888;
  --color-accent: #e8e8e8;
  --color-fleet-green: #22c55e;
  --color-fleet-green-dim: #16a34a22;
  --color-fleet-amber: #f59e0b;
  --color-fleet-amber-dim: #f59e0b18;
  --color-fleet-red: #ef4444;
  --color-fleet-red-dim: #ef444418;
  --color-fleet-blue: #3b82f6;
  --color-fleet-blue-dim: #3b82f615;

  --font-mono: 'Geist Mono', monospace;
  --font-sans: 'DM Sans', sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 13px;
  line-height: 1.5;
  height: 100vh;
  overflow: hidden;
}

/* Leaflet dark tile filter */
.leaflet-tile {
  filter: brightness(0.55) saturate(0.4) hue-rotate(190deg) !important;
}

/* Leaflet popup theme */
.leaflet-popup-content-wrapper {
  background: #0f0f0f !important;
  border: 1px solid #252525 !important;
  border-radius: 5px !important;
  color: #888 !important;
  box-shadow: 0 4px 20px #00000088 !important;
}
.leaflet-popup-tip { background: #0f0f0f !important; }
.leaflet-popup-close-button { color: #666 !important; }

/* Zone label tooltip */
.zone-label {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  color: #3b82f6;
}
.zone-label::before { display: none !important; }

/* Drone marker ring animation */
@keyframes drone-ring {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(2.2); opacity: 0; }
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #252525; border-radius: 2px; }

/* Pulse animation for status dot */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Progress bar shimmer */
@keyframes shimmer {
  from { left: -100%; }
  to { left: 100%; }
}
```

- [ ] **Step 2: Update root layout with fonts**

Update `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VECTR Fleet Intelligence",
  description: "Fleet management and drone swarm coordination",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Verify dev server renders dark background**

```bash
npm run dev
```

Open localhost:3000 — should show dark `#080808` background.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: configure design tokens, fonts, and Tailwind theme"
```

---

### Task 5: Set up i18n with next-intl

**Files:**
- Create: `src/i18n/request.ts`
- Create: `messages/en.json`
- Modify: `next.config.ts`

We set up next-intl with a single `en` locale for now. All user-facing strings go into `messages/en.json`. The structure is flat by component domain.

- [ ] **Step 1: Create messages file**

Create `messages/en.json`:

```json
{
  "common": {
    "appName": "VECTR",
    "appSuffix": "Fleet",
    "online": "Online",
    "offline": "Offline",
    "nominal": "Nominal"
  },
  "topbar": {
    "overview": "Overview",
    "missions": "Missions",
    "fleet": "Fleet",
    "bases": "Bases",
    "telemetry": "Telemetry",
    "audit": "Audit"
  },
  "sidebar": {
    "active": "Active",
    "overview": "Overview",
    "liveMission": "Live Mission",
    "map": "Map",
    "manage": "Manage",
    "drones": "Drones",
    "baseStations": "Base Stations",
    "missionPlans": "Mission Plans",
    "system": "System",
    "alerts": "Alerts",
    "auditLog": "Audit Log",
    "settings": "Settings",
    "firmware": "Firmware"
  },
  "dashboard": {
    "fleetOverview": "Fleet Overview",
    "newMission": "New Mission",
    "preFlightCheck": "Pre-flight Check",
    "dronesActive": "Drones Active",
    "coverage": "Coverage",
    "formation": "Formation",
    "meshLinks": "Mesh Links",
    "etaComplete": "ETA Complete"
  },
  "fleet": {
    "title": "Fleet",
    "formationIntegrity": "Formation Integrity",
    "avgBat": "Avg Bat",
    "meshRtt": "Mesh RTT",
    "uplink": "Uplink",
    "battery": "BAT",
    "lowBattery": "LOW BAT",
    "recentAlerts": "Recent Alerts"
  },
  "alerts": {
    "title": "Alerts"
  },
  "commands": {
    "title": "Commands",
    "pause": "Pause",
    "rtbAll": "RTB All",
    "goTo": "Go-To",
    "orbit": "Orbit",
    "abortMission": "ABORT MISSION",
    "commandLog": "Command Log",
    "confirmAbort": "Are you sure you want to abort the mission? This cannot be undone.",
    "confirmAbortTitle": "Abort Mission"
  },
  "swarmHealth": {
    "swarm": "Swarm",
    "baseLink": "Base Link",
    "cloud": "Cloud",
    "alerts": "Alerts"
  },
  "map": {
    "missionArea": "MISSION AREA",
    "wind": "WIND",
    "alt": "ALT",
    "gps": "GPS"
  }
}
```

- [ ] **Step 2: Create i18n request config**

Create `src/i18n/request.ts`:

```ts
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const locale = "en";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 3: Update next.config.ts**

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
```

- [ ] **Step 4: Verify dev server still starts**

```bash
npm run dev
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: set up next-intl with English messages"
```

---

### Task 6: Define shared Zod schemas and types

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Create type definitions**

Create `src/lib/types.ts`:

```ts
import { z } from "zod";

// ── Position ──
export const positionSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});
export type Position = z.infer<typeof positionSchema>;

// ── Grid position ──
export const gridPosSchema = z.object({
  row: z.number(),
  col: z.number(),
});
export type GridPos = z.infer<typeof gridPosSchema>;

// ── Drone ──
export const droneRoleSchema = z.enum(["coordinator", "follower", "relay"]);
export type DroneRole = z.infer<typeof droneRoleSchema>;

export const droneStatusSchema = z.enum([
  "nominal",
  "warning",
  "critical",
  "rtb",
  "offline",
]);
export type DroneStatus = z.infer<typeof droneStatusSchema>;

export const droneSchema = z.object({
  id: z.string(),
  role: droneRoleSchema,
  status: droneStatusSchema,
  position: positionSchema,
  gridPos: gridPosSchema,
  battery: z.number().min(0).max(100),
  heading: z.number(),
});
export type Drone = z.infer<typeof droneSchema>;

// ── Mission ──
export const missionStatusSchema = z.enum([
  "active",
  "paused",
  "aborted",
  "complete",
]);
export type MissionStatus = z.infer<typeof missionStatusSchema>;

export const formationTypeSchema = z.enum(["grid", "line", "orbit"]);
export type FormationType = z.infer<typeof formationTypeSchema>;

export const missionSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: missionStatusSchema,
  coverage: z.number().min(0).max(100),
  formation: formationTypeSchema,
  formationIntegrity: z.number().min(0).max(100),
  bounds: z.array(positionSchema).min(4).max(4),
  eta: z.number(),
  baseId: z.string(),
});
export type Mission = z.infer<typeof missionSchema>;

// ── Alert ──
export const alertSeveritySchema = z.enum(["info", "warning", "critical"]);
export type AlertSeverity = z.infer<typeof alertSeveritySchema>;

export const alertSchema = z.object({
  id: z.string(),
  severity: alertSeveritySchema,
  title: z.string(),
  detail: z.string(),
  droneId: z.string().optional(),
  timestamp: z.date(),
});
export type Alert = z.infer<typeof alertSchema>;

// ── Command ──
export const commandTypeSchema = z.enum([
  "pause",
  "resume",
  "rtb",
  "goto",
  "orbit",
  "abort",
  "activate_mission",
  "set_formation",
  "adjust_spacing",
]);
export type CommandType = z.infer<typeof commandTypeSchema>;

export const commandStateSchema = z.enum([
  "pending",
  "executing",
  "completed",
  "failed",
]);
export type CommandState = z.infer<typeof commandStateSchema>;

export const commandSchema = z.object({
  id: z.string(),
  type: commandTypeSchema,
  target: z.string(), // "ALL" or drone ID
  state: commandStateSchema,
  timestamp: z.date(),
});
export type Command = z.infer<typeof commandSchema>;

// ── Base Station ──
export const baseStationSchema = z.object({
  id: z.string(),
  position: positionSchema,
  status: z.enum(["online", "offline"]),
  uplinkLatency: z.number(),
});
export type BaseStation = z.infer<typeof baseStationSchema>;

// ── Mesh link (for map rendering) ──
export const meshLinkSchema = z.object({
  from: z.string(),
  to: z.string(),
});
export type MeshLink = z.infer<typeof meshLinkSchema>;
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: define shared Zod schemas and TypeScript types"
```

---

## Chunk 2: Server — Simulation Engine & tRPC

### Task 7: Create simulation seed data

**Files:**
- Create: `src/server/simulation/seed.ts`

All initial values match the HTML mock exactly (8 drones, positions, battery levels, mission at 62%, etc.).

- [ ] **Step 1: Create seed data**

Create `src/server/simulation/seed.ts`:

```ts
import type { Drone, Mission, Alert, Command, BaseStation, MeshLink } from "@/lib/types";

export function createSeedDrones(): Drone[] {
  return [
    { id: "D-01", role: "coordinator", status: "nominal", position: { lat: 32.260, lng: -110.924 }, gridPos: { row: 1, col: 1 }, battery: 84, heading: 90 },
    { id: "D-02", role: "follower",    status: "nominal", position: { lat: 32.260, lng: -110.913 }, gridPos: { row: 1, col: 2 }, battery: 79, heading: 90 },
    { id: "D-03", role: "relay",       status: "nominal", position: { lat: 32.260, lng: -110.901 }, gridPos: { row: 1, col: 3 }, battery: 76, heading: 90 },
    { id: "D-04", role: "follower",    status: "nominal", position: { lat: 32.254, lng: -110.924 }, gridPos: { row: 2, col: 1 }, battery: 71, heading: 90 },
    { id: "D-05", role: "follower",    status: "nominal", position: { lat: 32.254, lng: -110.913 }, gridPos: { row: 2, col: 2 }, battery: 68, heading: 90 },
    { id: "D-06", role: "follower",    status: "nominal", position: { lat: 32.254, lng: -110.901 }, gridPos: { row: 2, col: 3 }, battery: 65, heading: 90 },
    { id: "D-07", role: "follower",    status: "warning", position: { lat: 32.248, lng: -110.920 }, gridPos: { row: 3, col: 1 }, battery: 22, heading: 90 },
    { id: "D-08", role: "follower",    status: "nominal", position: { lat: 32.248, lng: -110.908 }, gridPos: { row: 3, col: 2 }, battery: 61, heading: 90 },
  ];
}

export function createSeedMission(): Mission {
  return {
    id: "MISSION-241",
    name: "Area Surveillance",
    status: "active",
    coverage: 62,
    formation: "grid",
    formationIntegrity: 87,
    bounds: [
      { lat: 32.262, lng: -110.928 },
      { lat: 32.262, lng: -110.895 },
      { lat: 32.244, lng: -110.895 },
      { lat: 32.244, lng: -110.928 },
    ],
    eta: 18,
    baseId: "BASE-01",
  };
}

export function createSeedAlerts(): Alert[] {
  const now = Date.now();
  return [
    { id: "ALT-001", severity: "warning",  title: "D-07 Battery Critical",    detail: "22% remaining · RTB threshold at 15%",           droneId: "D-07", timestamp: new Date(now - 2 * 60_000) },
    { id: "ALT-002", severity: "info",     title: "Formation reconfigured",   detail: "Grid spacing adjusted for terrain",               timestamp: new Date(now - 8 * 60_000) },
    { id: "ALT-003", severity: "info",     title: "Mission ACTIVATED",        detail: "8 drones · Area Surveillance · Alpha-7",           timestamp: new Date(now - 24 * 60_000) },
  ];
}

export function createSeedCommands(): Command[] {
  const now = Date.now();
  return [
    { id: "CMD-001", type: "activate_mission", target: "ALL", state: "completed", timestamp: new Date(now - 24 * 60_000) },
    { id: "CMD-002", type: "set_formation",    target: "ALL", state: "completed", timestamp: new Date(now - 20 * 60_000) },
    { id: "CMD-003", type: "adjust_spacing",   target: "ALL", state: "executing", timestamp: new Date(now - 8 * 60_000) },
  ];
}

export function createSeedBaseStations(): BaseStation[] {
  return [
    { id: "BASE-01", position: { lat: 32.240, lng: -110.932 }, status: "online", uplinkLatency: 14 },
  ];
}

export function createSeedMeshLinks(): MeshLink[] {
  return [
    { from: "D-01", to: "D-02" },
    { from: "D-02", to: "D-03" },
    { from: "D-01", to: "D-04" },
    { from: "D-02", to: "D-05" },
    { from: "D-03", to: "D-06" },
    { from: "D-04", to: "D-05" },
    { from: "D-05", to: "D-06" },
    { from: "D-04", to: "D-07" },
    { from: "D-05", to: "D-08" },
    { from: "D-07", to: "D-08" },
  ];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/server/simulation/seed.ts
git commit -m "feat: add simulation seed data matching mock"
```

---

### Task 8: Build simulation state and engine

**Files:**
- Create: `src/server/simulation/state.ts`
- Create: `src/server/simulation/engine.ts`

- [ ] **Step 1: Create world state singleton**

Create `src/server/simulation/state.ts`:

```ts
import type { Drone, Mission, Alert, Command, BaseStation, MeshLink } from "@/lib/types";
import {
  createSeedDrones,
  createSeedMission,
  createSeedAlerts,
  createSeedCommands,
  createSeedBaseStations,
  createSeedMeshLinks,
} from "./seed";

export interface WorldState {
  drones: Drone[];
  mission: Mission;
  alerts: Alert[];
  commands: Command[];
  baseStations: BaseStation[];
  meshLinks: MeshLink[];
  tickCount: number;
}

function createInitialState(): WorldState {
  return {
    drones: createSeedDrones(),
    mission: createSeedMission(),
    alerts: createSeedAlerts(),
    commands: createSeedCommands(),
    baseStations: createSeedBaseStations(),
    meshLinks: createSeedMeshLinks(),
    tickCount: 0,
  };
}

// Singleton — survives hot reloads in dev via globalThis
const globalForState = globalThis as unknown as { worldState?: WorldState };
export const worldState: WorldState =
  globalForState.worldState ?? createInitialState();
globalForState.worldState = worldState;

export function resetState(): void {
  const fresh = createInitialState();
  Object.assign(worldState, fresh);
}
```

- [ ] **Step 2: Create simulation engine**

Create `src/server/simulation/engine.ts`:

```ts
import type { Command } from "@/lib/types";
import { worldState } from "./state";

const RTB_THRESHOLD = 15;
const BATTERY_DRAIN_RATE = 0.05;
const COVERAGE_RATE = 0.02;
let alertCounter = 100;
let cmdCounter = 100;

export function tick(): void {
  const { mission, drones, alerts } = worldState;

  if (mission.status !== "active") return;

  worldState.tickCount++;

  // Drift drones along scan lines
  for (const drone of drones) {
    if (drone.status === "rtb" || drone.status === "offline") continue;

    const i = drones.indexOf(drone);
    const t = worldState.tickCount * 0.02;
    drone.position = {
      lat: drone.position.lat + Math.cos(t + i * 1.1) * 0.00002,
      lng: drone.position.lng + Math.sin(t + i * 0.8) * 0.00003,
    };
  }

  // Drain batteries
  for (const drone of drones) {
    if (drone.status === "rtb" || drone.status === "offline") continue;

    drone.battery = Math.max(0, drone.battery - BATTERY_DRAIN_RATE);

    // Warning threshold
    if (drone.battery <= 25 && drone.status === "nominal") {
      drone.status = "warning";
      alerts.unshift({
        id: `ALT-${++alertCounter}`,
        severity: "warning",
        title: `${drone.id} Battery Low`,
        detail: `${Math.round(drone.battery)}% remaining · RTB threshold at ${RTB_THRESHOLD}%`,
        droneId: drone.id,
        timestamp: new Date(),
      });
    }

    // RTB threshold
    if (drone.battery <= RTB_THRESHOLD && drone.status !== "rtb") {
      drone.status = "rtb";
      alerts.unshift({
        id: `ALT-${++alertCounter}`,
        severity: "critical",
        title: `${drone.id} Returning to Base`,
        detail: `Battery at ${Math.round(drone.battery)}% — automatic RTB initiated`,
        droneId: drone.id,
        timestamp: new Date(),
      });
    }
  }

  // Advance coverage
  if (mission.coverage < 100) {
    mission.coverage = Math.min(100, mission.coverage + COVERAGE_RATE);
  }

  // Update ETA (rough estimate based on remaining coverage)
  const remaining = 100 - mission.coverage;
  mission.eta = Math.max(0, Math.round(remaining / (COVERAGE_RATE * 60)));

  // Recalculate formation integrity based on active drones
  const activeDrones = drones.filter(
    (d) => d.status === "nominal" || d.status === "warning"
  );
  mission.formationIntegrity = Math.round(
    (activeDrones.length / drones.length) * 100
  );

  // Complete mission check
  if (mission.coverage >= 100) {
    mission.status = "complete";
    alerts.unshift({
      id: `ALT-${++alertCounter}`,
      severity: "info",
      title: "Mission Complete",
      detail: `${mission.id} — 100% coverage achieved`,
      timestamp: new Date(),
    });
  }
}

export function dispatchCommand(
  type: string,
  target: string
): void {
  const { mission, drones, commands, alerts } = worldState;
  const cmd = {
    id: `CMD-${++cmdCounter}`,
    type: type as Command["type"],
    target,
    state: "executing" as const,
    timestamp: new Date(),
  };
  commands.unshift(cmd);

  switch (type) {
    case "pause":
      mission.status = "paused";
      cmd.state = "completed";
      break;

    case "resume":
      if (mission.status === "paused") {
        mission.status = "active";
      }
      cmd.state = "completed";
      break;

    case "abort":
      mission.status = "aborted";
      cmd.state = "completed";
      alerts.unshift({
        id: `ALT-${++alertCounter}`,
        severity: "critical",
        title: "Mission ABORTED",
        detail: `${mission.id} aborted by operator`,
        timestamp: new Date(),
      });
      break;

    case "rtb": {
      const targets =
        target === "ALL"
          ? drones.filter((d) => d.status !== "offline")
          : drones.filter((d) => d.id === target);
      for (const d of targets) {
        d.status = "rtb";
      }
      cmd.state = "completed";
      break;
    }

    default:
      // goto, orbit — mark executing, will auto-complete after a few ticks
      setTimeout(() => {
        cmd.state = "completed";
      }, 5000);
      break;
  }
}

// Start tick loop — singleton guard
const globalForEngine = globalThis as unknown as { engineStarted?: boolean };
if (!globalForEngine.engineStarted) {
  globalForEngine.engineStarted = true;
  setInterval(tick, 1000);
}
```

- [ ] **Step 3: Verify types compile**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/server/simulation/
git commit -m "feat: implement simulation state singleton and tick engine"
```

---

### Task 9: Set up tRPC with App Router

**Files:**
- Create: `src/server/trpc.ts`
- Create: `src/server/routers/drones.ts`
- Create: `src/server/routers/missions.ts`
- Create: `src/server/routers/alerts.ts`
- Create: `src/server/routers/commands.ts`
- Create: `src/server/routers/index.ts`
- Create: `src/app/api/trpc/[trpc]/route.ts`
- Create: `src/lib/trpc/client.ts`
- Create: `src/lib/trpc/provider.tsx`

- [ ] **Step 1: Create tRPC init**

Create `src/server/trpc.ts`:

```ts
import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
```

- [ ] **Step 2: Create drone router**

Create `src/server/routers/drones.ts`:

```ts
import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { worldState } from "../simulation/state";

export const dronesRouter = router({
  list: publicProcedure.query(() => {
    return worldState.drones;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const drone = worldState.drones.find((d) => d.id === input.id);
      if (!drone) throw new Error(`Drone ${input.id} not found`);
      return drone;
    }),
});
```

- [ ] **Step 3: Create mission router**

Create `src/server/routers/missions.ts`:

```ts
import { router, publicProcedure } from "../trpc";
import { worldState } from "../simulation/state";
import { dispatchCommand } from "../simulation/engine";

export const missionsRouter = router({
  active: publicProcedure.query(() => {
    return worldState.mission;
  }),

  pause: publicProcedure.mutation(() => {
    dispatchCommand("pause", "ALL");
    return worldState.mission;
  }),

  resume: publicProcedure.mutation(() => {
    dispatchCommand("resume", "ALL");
    return worldState.mission;
  }),

  abort: publicProcedure.mutation(() => {
    dispatchCommand("abort", "ALL");
    return worldState.mission;
  }),
});
```

- [ ] **Step 4: Create alerts router**

Create `src/server/routers/alerts.ts`:

```ts
import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { worldState } from "../simulation/state";

export const alertsRouter = router({
  list: publicProcedure.query(() => {
    return worldState.alerts;
  }),

  dismiss: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      worldState.alerts = worldState.alerts.filter((a) => a.id !== input.id);
    }),
});
```

- [ ] **Step 5: Create commands router**

Create `src/server/routers/commands.ts`:

```ts
import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { worldState } from "../simulation/state";
import { dispatchCommand } from "../simulation/engine";
import { commandTypeSchema } from "@/lib/types";

export const commandsRouter = router({
  dispatch: publicProcedure
    .input(
      z.object({
        type: commandTypeSchema,
        target: z.string().default("ALL"),
      })
    )
    .mutation(({ input }) => {
      dispatchCommand(input.type, input.target);
      return worldState.commands[0];
    }),

  log: publicProcedure.query(() => {
    return worldState.commands.slice(0, 20);
  }),
});
```

- [ ] **Step 6: Create root app router**

Create `src/server/routers/index.ts`:

```ts
import { router, publicProcedure } from "../trpc";
import { dronesRouter } from "./drones";
import { missionsRouter } from "./missions";
import { alertsRouter } from "./alerts";
import { commandsRouter } from "./commands";
import { worldState } from "../simulation/state";

export const appRouter = router({
  drones: dronesRouter,
  missions: missionsRouter,
  alerts: alertsRouter,
  commands: commandsRouter,

  baseStations: publicProcedure.query(() => {
    return worldState.baseStations;
  }),

  meshLinks: publicProcedure.query(() => {
    return worldState.meshLinks;
  }),
});

export type AppRouter = typeof appRouter;
```

- [ ] **Step 7: Create API route handler**

Create `src/app/api/trpc/[trpc]/route.ts`:

```ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers";

// Ensure simulation engine is running
import "@/server/simulation/engine";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
```

- [ ] **Step 8: Create tRPC client utilities**

Create `src/lib/trpc/client.ts`:

```ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers";

export const trpc = createTRPCReact<AppRouter>();
```

Create `src/lib/trpc/provider.tsx`:

```tsx
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./client";
import superjson from "superjson";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
```

- [ ] **Step 9: Wire provider into root layout**

Update `src/app/layout.tsx` to wrap children with `TRPCProvider` and `NextIntlClientProvider`:

```tsx
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { TRPCProvider } from "@/lib/trpc/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "VECTR Fleet Intelligence",
  description: "Fleet management and drone swarm coordination",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <TRPCProvider>{children}</TRPCProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 10: Test tRPC endpoint**

```bash
npm run dev &
sleep 3
curl -s 'http://localhost:3000/api/trpc/drones.list' | head -c 200
```

Expected: JSON array of 8 drone objects.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: set up tRPC with App Router, routers, and client provider"
```

---

## Chunk 3: Layout Shell

### Task 10: Create drone selection context

**Files:**
- Create: `src/hooks/use-drone-selection.tsx`

- [ ] **Step 1: Create selection context**

Create `src/hooks/use-drone-selection.tsx`:

```tsx
"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface DroneSelectionContext {
  selectedDroneId: string | null;
  selectDrone: (id: string | null) => void;
}

const DroneSelectionCtx = createContext<DroneSelectionContext>({
  selectedDroneId: null,
  selectDrone: () => {},
});

export function DroneSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>("D-01");

  const selectDrone = useCallback((id: string | null) => {
    setSelectedDroneId(id);
  }, []);

  return (
    <DroneSelectionCtx.Provider value={{ selectedDroneId, selectDrone }}>
      {children}
    </DroneSelectionCtx.Provider>
  );
}

export function useDroneSelection() {
  return useContext(DroneSelectionCtx);
}
```

- [ ] **Step 2: Add provider to layout**

In `src/app/layout.tsx`, wrap children with `DroneSelectionProvider` (inside `TRPCProvider`).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add drone selection context"
```

---

### Task 11: Build Topbar component

**Files:**
- Create: `src/components/layout/topbar.tsx`

- [ ] **Step 1: Create Topbar**

Create `src/components/layout/topbar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", key: "overview" },
  { href: "/missions", key: "missions" },
  { href: "/fleet", key: "fleet" },
  { href: "/bases", key: "bases" },
  { href: "/telemetry", key: "telemetry" },
  { href: "/audit", key: "audit" },
] as const;

export function Topbar() {
  const pathname = usePathname();
  const t = useTranslations("topbar");
  const tc = useTranslations("common");

  return (
    <header className="h-11 border-b border-border bg-surface flex items-center px-4 shrink-0">
      {/* Logo */}
      <div className="font-mono text-[13px] font-semibold tracking-wider text-text uppercase pr-5 border-r border-border2 mr-5">
        {tc("appName")} <span className="text-subtle font-light">/ {tc("appSuffix")}</span>
      </div>

      {/* Org selector */}
      <button className="flex items-center gap-1.5 text-xs text-text-dim px-2.5 py-1 border border-border2 rounded-[5px] font-mono hover:border-muted hover:text-text transition-colors">
        <span className="w-1.5 h-1.5 rounded-full bg-fleet-blue" />
        Bravo Team
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Nav */}
      <nav className="flex gap-0.5 ml-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "text-xs text-text-dim px-2.5 py-1 rounded font-mono tracking-wide transition-colors",
                isActive && "text-text bg-border2",
                !isActive && "hover:text-text hover:bg-border"
              )}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-fleet-green px-2 py-0.5 bg-fleet-green-dim border border-fleet-green/15 rounded-full">
          <span className="w-[5px] h-[5px] rounded-full bg-fleet-green animate-pulse" />
          BASE-01 {tc("online")}
        </div>
        <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-[#1e3a5f] to-fleet-blue border border-border2 flex items-center justify-center text-[10px] font-semibold text-white cursor-pointer">
          DK
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/topbar.tsx
git commit -m "feat: build Topbar component with nav and i18n"
```

---

### Task 12: Build Sidebar component

**Files:**
- Create: `src/components/layout/sidebar.tsx`

- [ ] **Step 1: Create Sidebar**

Create `src/components/layout/sidebar.tsx`:

```tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: { value: string | number; variant: "green" | "red" | "amber" | "muted" };
}

function SidebarIcon({ d }: { d: string }) {
  return (
    <svg className="w-3.5 h-3.5 opacity-60 shrink-0" viewBox="0 0 14 14" fill="none">
      <path d={d} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const badgeVariants = {
  green: "bg-fleet-green-dim text-fleet-green border-fleet-green/15",
  red: "bg-fleet-red-dim text-fleet-red border-fleet-red/15",
  amber: "bg-fleet-amber-dim text-fleet-amber border-fleet-amber/15",
  muted: "bg-border2 text-subtle",
} as const;

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("sidebar");

  // Live badge data
  const { data: drones } = trpc.drones.list.useQuery(undefined, { refetchInterval: 2000 });
  const { data: alerts } = trpc.alerts.list.useQuery(undefined, { refetchInterval: 5000 });

  const droneCount = drones?.length ?? 0;
  const alertCount = alerts?.filter((a) => a.severity !== "info").length ?? 0;
  const activeMissions = 1; // mock for now

  const sections: { label: string; items: SidebarItem[] }[] = [
    {
      label: t("active"),
      items: [
        { label: t("overview"), href: "/", icon: <SidebarIcon d="M4 7h6M7 4v6" /> },
        {
          label: t("liveMission"),
          href: "/missions",
          icon: <SidebarIcon d="M7 4.5v3l1.5 1.5" />,
          badge: { value: activeMissions, variant: "green" },
        },
        { label: t("map"), href: "#", icon: <SidebarIcon d="M2 11L5 6l2.5 3L9 7l3 4H2z" /> },
      ],
    },
    {
      label: t("manage"),
      items: [
        {
          label: t("drones"),
          href: "/fleet",
          icon: <SidebarIcon d="M7 1L9 5h4L10 8l1 4-4-2.5L3 12l1-4L1 5h4z" />,
          badge: { value: droneCount, variant: "muted" },
        },
        {
          label: t("baseStations"),
          href: "/bases",
          icon: <SidebarIcon d="M5 4V3a2 2 0 014 0v1" />,
          badge: { value: 2, variant: "green" },
        },
        { label: t("missionPlans"), href: "#", icon: <SidebarIcon d="M4.5 6.5h5M4.5 8.5h3" /> },
      ],
    },
    {
      label: t("system"),
      items: [
        {
          label: t("alerts"),
          href: "#",
          icon: <SidebarIcon d="M7 1v2M7 11v2M1 7h2M11 7h2" />,
          badge: alertCount > 0 ? { value: alertCount, variant: "amber" } : undefined,
        },
        { label: t("auditLog"), href: "/audit", icon: <SidebarIcon d="M2 4h10M2 7h10M2 10h6" /> },
        { label: t("settings"), href: "#", icon: <SidebarIcon d="M7 4.5v3M7 9.5v.5" /> },
      ],
    },
  ];

  return (
    <aside className="w-[200px] border-r border-border bg-surface flex flex-col shrink-0 py-3">
      {sections.map((section) => (
        <div key={section.label} className="px-2 mb-5">
          <div className="font-mono text-[10px] tracking-widest text-subtle uppercase px-2 mb-1">
            {section.label}
          </div>
          {section.items.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-[5px] cursor-pointer text-text-dim text-[12.5px] transition-colors relative",
                  isActive && "bg-border2 text-text",
                  !isActive && "hover:bg-border hover:text-text"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-text rounded-r" />
                )}
                {item.icon}
                {item.label}
                {item.badge && (
                  <span
                    className={cn(
                      "ml-auto font-mono text-[10px] px-1.5 py-px rounded-sm font-medium border",
                      badgeVariants[item.badge.variant]
                    )}
                  >
                    {item.badge.value}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}

      {/* Bottom */}
      <div className="mt-auto pt-2 px-2 border-t border-border">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-[5px] text-text-dim text-[12.5px] cursor-pointer hover:bg-border hover:text-text">
          <SidebarIcon d="M7 1a6 6 0 100 12A6 6 0 007 1z" />
          {t("firmware")}
          <span className="ml-auto font-mono text-[10px] px-1.5 py-px rounded-sm bg-border2 text-subtle">
            v2.4
          </span>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/sidebar.tsx
git commit -m "feat: build Sidebar component with live badge counts"
```

---

### Task 13: Wire layout shell

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update root layout to include shell**

The root layout should render the topbar and a main flex container with sidebar + content area. The page content renders inside the content slot.

```tsx
// src/app/layout.tsx — body contents:
<body className="antialiased flex flex-col h-screen overflow-hidden">
  <NextIntlClientProvider messages={messages}>
    <TRPCProvider>
      <DroneSelectionProvider>
        <Topbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </DroneSelectionProvider>
    </TRPCProvider>
  </NextIntlClientProvider>
</body>
```

- [ ] **Step 2: Create minimal page.tsx**

Replace `src/app/page.tsx` with:

```tsx
export default function OverviewPage() {
  return (
    <div className="flex items-center justify-center flex-1 text-text-dim font-mono text-sm">
      Loading dashboard...
    </div>
  );
}
```

- [ ] **Step 3: Verify layout renders**

```bash
npm run dev
```

Open localhost:3000 — should show dark topbar, sidebar with live badge counts, and "Loading dashboard..." in the content area.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: wire layout shell with topbar, sidebar, and content slot"
```

---

## Chunk 4: Dashboard — Stats, Map, Fleet Panel

### Task 14: Build StatsRow component

**Files:**
- Create: `src/components/dashboard/stats-row.tsx`

- [ ] **Step 1: Create StatsRow**

Create `src/components/dashboard/stats-row.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";

export function StatsRow() {
  const t = useTranslations("dashboard");
  const { data: drones } = trpc.drones.list.useQuery(undefined, { refetchInterval: 2000 });
  const { data: mission } = trpc.missions.active.useQuery(undefined, { refetchInterval: 2000 });
  const { data: meshLinks } = trpc.meshLinks.useQuery(undefined, { refetchInterval: 2000 });

  const nominalCount = drones?.filter((d) => d.status === "nominal").length ?? 0;
  const warningCount = drones?.filter((d) => d.status === "warning").length ?? 0;
  const activeCount = drones?.filter((d) => d.status !== "offline").length ?? 0;

  const stats = [
    {
      label: t("dronesActive"),
      value: String(activeCount),
      meta: (
        <>
          <span className="text-fleet-green">●</span> {nominalCount} nominal · {warningCount} warning
        </>
      ),
    },
    {
      label: t("coverage"),
      value: `${Math.round(mission?.coverage ?? 0)}`,
      unit: "%",
      meta: (
        <>
          <span className="text-fleet-green">↑</span> live
        </>
      ),
    },
    {
      label: t("formation"),
      value: `${mission?.formationIntegrity ?? 0}`,
      unit: "%",
      valueColor: "text-fleet-green",
      meta: (
        <>
          <span className="text-fleet-green">●</span> {mission?.formation ?? "grid"} · VRP locked
        </>
      ),
    },
    {
      label: t("meshLinks"),
      value: String((meshLinks?.length ?? 0) * 2 + 4), // bidirectional + base uplinks
      meta: (
        <>
          <span className="text-fleet-green">●</span> All nodes connected
        </>
      ),
    },
    {
      label: t("etaComplete"),
      value: String(mission?.eta ?? 0),
      unit: "m",
      meta: warningCount > 0 ? (
        <>
          <span className="text-fleet-amber">⚠</span> {warningCount} drone warning
        </>
      ) : (
        <>
          <span className="text-fleet-green">●</span> On track
        </>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-px bg-border border-y border-border shrink-0">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-surface px-4 py-3 flex flex-col gap-1">
          <div className="font-mono text-[10px] tracking-wider text-subtle uppercase">
            {stat.label}
          </div>
          <div className={`font-mono text-[22px] font-semibold leading-none tracking-tight ${stat.valueColor ?? "text-text"}`}>
            {stat.value}
            {stat.unit && (
              <span className="text-sm text-subtle">{stat.unit}</span>
            )}
          </div>
          <div className="text-[11px] text-text-dim flex items-center gap-1">
            {stat.meta}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/stats-row.tsx
git commit -m "feat: build StatsRow with live tRPC data"
```

---

### Task 15: Build MapPanel component

**Files:**
- Create: `src/components/map/map-panel.tsx`
- Create: `src/components/map/map-content.tsx`
- Create: `src/components/map/drone-markers.tsx`
- Create: `src/components/map/mission-zone.tsx`
- Create: `src/components/map/mesh-links.tsx`
- Create: `src/components/map/base-marker.tsx`
- Create: `src/components/map/map-overlays.tsx`

react-leaflet must be loaded client-side only (no SSR). We use `dynamic` import for the map container.

- [ ] **Step 1: Create map panel wrapper (dynamic import)**

Create `src/components/map/map-panel.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";

const MapContent = dynamic(() => import("./map-content").then((m) => m.MapContent), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-bg flex items-center justify-center text-subtle font-mono text-xs">
      Loading map...
    </div>
  ),
});

export function MapPanel() {
  return (
    <div className="bg-bg relative overflow-hidden">
      <MapContent />
    </div>
  );
}
```

- [ ] **Step 2: Create MapContent with Leaflet**

Create `src/components/map/map-content.tsx`:

```tsx
"use client";

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { trpc } from "@/lib/trpc/client";
import { DroneMarkers } from "./drone-markers";
import { MissionZone } from "./mission-zone";
import { MeshLinksLayer } from "./mesh-links";
import { BaseMarkerLayer } from "./base-marker";
import { MapOverlays } from "./map-overlays";
import "leaflet/dist/leaflet.css";

const CENTER: [number, number] = [32.253, -110.911];
const ZOOM = 14;

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute bottom-3 right-3 flex gap-1 z-[1000]">
      <button
        onClick={() => map.zoomIn()}
        className="w-7 h-7 bg-[#0a0a0acc] border border-border2 rounded flex items-center justify-center text-subtle text-xs backdrop-blur-sm hover:text-text hover:border-muted"
      >
        +
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-7 h-7 bg-[#0a0a0acc] border border-border2 rounded flex items-center justify-center text-subtle text-xs backdrop-blur-sm hover:text-text hover:border-muted"
      >
        −
      </button>
      <button
        onClick={() => map.setView(CENTER, ZOOM)}
        className="w-7 h-7 bg-[#0a0a0acc] border border-border2 rounded flex items-center justify-center text-subtle text-xs backdrop-blur-sm hover:text-text hover:border-muted"
      >
        ⊙
      </button>
    </div>
  );
}

export function MapContent() {
  const { data: drones } = trpc.drones.list.useQuery(undefined, { refetchInterval: 2000 });
  const { data: mission } = trpc.missions.active.useQuery(undefined, { refetchInterval: 2000 });
  const { data: meshLinks } = trpc.meshLinks.useQuery(undefined, { refetchInterval: 2000 });
  const { data: baseStations } = trpc.baseStations.useQuery(undefined, { refetchInterval: 2000 });

  return (
    <MapContainer
      center={CENTER}
      zoom={ZOOM}
      zoomControl={false}
      attributionControl={false}
      className="w-full h-full"
      style={{ background: "#080808" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {mission && <MissionZone mission={mission} />}
      {drones && meshLinks && <MeshLinksLayer drones={drones} meshLinks={meshLinks} />}
      {drones && <DroneMarkers drones={drones} />}
      {baseStations?.map((base) => (
        <BaseMarkerLayer key={base.id} base={base} drones={drones ?? []} />
      ))}

      <ZoomControls />
      <MapOverlays mission={mission ?? null} />
    </MapContainer>
  );
}
```

- [ ] **Step 3: Create DroneMarkers**

Create `src/components/map/drone-markers.tsx`:

```tsx
"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Drone } from "@/lib/types";
import { useDroneSelection } from "@/hooks/use-drone-selection";

function createDroneIcon(drone: Drone, isSelected: boolean): L.DivIcon {
  const col = drone.status === "nominal" ? "#22c55e" : drone.status === "warning" ? "#f59e0b" : "#ef4444";
  const glow = col + "44";
  const ring = isSelected ? `border: 2px solid ${col};` : "";

  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer">
      <div style="width:${isSelected ? 14 : 10}px;height:${isSelected ? 14 : 10}px;border-radius:50%;background:${col};border:1.5px solid ${col};box-shadow:0 0 8px ${glow};${ring}position:relative">
        <div style="position:absolute;inset:-4px;border-radius:50%;border:1px solid ${col};opacity:0.3;animation:drone-ring 2s infinite"></div>
      </div>
      <div style="font-family:monospace;font-size:9px;color:#888;background:#080808cc;padding:1px 4px;border-radius:2px;border:1px solid #252525;white-space:nowrap">${drone.id}${drone.status === "warning" ? " ⚡" : ""}</div>
    </div>`,
    iconSize: [50, 28],
    iconAnchor: [25, 10],
  });
}

interface DroneMarkersProps {
  drones: Drone[];
}

export function DroneMarkers({ drones }: DroneMarkersProps) {
  const { selectedDroneId, selectDrone } = useDroneSelection();

  return (
    <>
      {drones.map((drone) => (
        <Marker
          key={drone.id}
          position={[drone.position.lat, drone.position.lng]}
          icon={createDroneIcon(drone, drone.id === selectedDroneId)}
          eventHandlers={{
            click: () => selectDrone(drone.id),
          }}
        >
          <Popup>
            <div style={{ fontFamily: "monospace", fontSize: "11px", lineHeight: "1.6" }}>
              <strong style={{ color: "#e8e8e8" }}>{drone.id}</strong>
              <br />
              Role: <span style={{ color: "#888" }}>{drone.role}</span>
              <br />
              Battery: <span style={{ color: drone.battery < 25 ? "#f59e0b" : "#22c55e" }}>
                {Math.round(drone.battery)}%
              </span>
              <br />
              Status: <span style={{ color: drone.status === "nominal" ? "#22c55e" : "#f59e0b" }}>
                {drone.status}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
```

- [ ] **Step 4: Create MissionZone**

Create `src/components/map/mission-zone.tsx`:

```tsx
"use client";

import { Polygon, Polyline, Tooltip } from "react-leaflet";
import type { Mission } from "@/lib/types";

interface MissionZoneProps {
  mission: Mission;
}

export function MissionZone({ mission }: MissionZoneProps) {
  const positions = mission.bounds.map(
    (b) => [b.lat, b.lng] as [number, number]
  );

  // Coverage area (bottom portion based on coverage %)
  const coverageFraction = mission.coverage / 100;
  const minLat = Math.min(...mission.bounds.map((b) => b.lat));
  const maxLat = Math.max(...mission.bounds.map((b) => b.lat));
  const coverageLat = minLat + (maxLat - minLat) * coverageFraction;
  const minLng = Math.min(...mission.bounds.map((b) => b.lng));
  const maxLng = Math.max(...mission.bounds.map((b) => b.lng));

  const coveragePositions: [number, number][] = [
    [minLat, minLng],
    [minLat, maxLng],
    [coverageLat, maxLng],
    [coverageLat, minLng],
  ];

  // Scan lines across the coverage area
  const scanLines: [number, number][][] = [];
  const lineCount = 7;
  for (let i = 0; i < lineCount; i++) {
    const lat = minLat + i * ((coverageLat - minLat) / lineCount);
    scanLines.push([
      [lat, minLng],
      [lat, maxLng],
    ]);
  }

  // Waypoint rows (planned route)
  const waypointRows: [number, number][][] = [
    [[32.261, -110.928], [32.261, -110.895]],
    [[32.255, -110.895], [32.255, -110.928]],
    [[32.249, -110.928], [32.249, -110.895]],
  ];

  return (
    <>
      {/* Mission zone outline */}
      <Polygon
        positions={positions}
        pathOptions={{
          color: "#3b82f6",
          weight: 1.5,
          opacity: 0.5,
          fillColor: "#3b82f6",
          fillOpacity: 0.04,
          dashArray: "4,6",
        }}
      >
        <Tooltip
          permanent
          direction="top"
          className="zone-label"
          offset={[0, -4]}
        >
          <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#3b82f6", letterSpacing: "0.08em" }}>
            MISSION AREA · ALPHA-7
          </span>
        </Tooltip>
      </Polygon>

      {/* Coverage fill */}
      <Polygon
        positions={coveragePositions}
        pathOptions={{
          color: "#3b82f6",
          weight: 0,
          fillColor: "#3b82f6",
          fillOpacity: 0.07,
        }}
      />

      {/* Scan lines */}
      {scanLines.map((line, i) => (
        <Polyline
          key={`scan-${i}`}
          positions={line}
          pathOptions={{ color: "#3b82f6", weight: 0.6, opacity: 0.15 }}
        />
      ))}

      {/* Waypoint route */}
      {waypointRows.map((pts, i) => (
        <Polyline
          key={`wp-${i}`}
          positions={pts}
          pathOptions={{ color: "#3b82f6", weight: 1, opacity: 0.12, dashArray: "3,5" }}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 5: Create MeshLinksLayer**

Create `src/components/map/mesh-links.tsx`:

```tsx
"use client";

import { Polyline } from "react-leaflet";
import type { Drone, MeshLink } from "@/lib/types";

interface MeshLinksLayerProps {
  drones: Drone[];
  meshLinks: MeshLink[];
}

export function MeshLinksLayer({ drones, meshLinks }: MeshLinksLayerProps) {
  const droneMap = new Map(drones.map((d) => [d.id, d]));

  return (
    <>
      {meshLinks.map((link) => {
        const from = droneMap.get(link.from);
        const to = droneMap.get(link.to);
        if (!from || !to) return null;

        const isWarn = from.status === "warning" || to.status === "warning";

        return (
          <Polyline
            key={`${link.from}-${link.to}`}
            positions={[
              [from.position.lat, from.position.lng],
              [to.position.lat, to.position.lng],
            ]}
            pathOptions={{
              color: isWarn ? "#f59e0b" : "#22c55e",
              weight: 1,
              opacity: isWarn ? 0.25 : 0.18,
              dashArray: isWarn ? "3,5" : undefined,
            }}
          />
        );
      })}
    </>
  );
}
```

- [ ] **Step 6: Create BaseMarkerLayer**

Create `src/components/map/base-marker.tsx`:

```tsx
"use client";

import { Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import type { BaseStation, Drone } from "@/lib/types";

function createBaseIcon(base: BaseStation): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:3px">
      <div style="width:24px;height:24px;background:#0f0f0f;border:1.5px solid #252525;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 0 10px #00000088">⬡</div>
      <div style="font-family:monospace;font-size:9px;color:#888;background:#080808cc;padding:1px 5px;border-radius:2px;border:1px solid #252525;white-space:nowrap">${base.id}</div>
    </div>`,
    iconSize: [60, 42],
    iconAnchor: [30, 21],
  });
}

interface BaseMarkerLayerProps {
  base: BaseStation;
  drones: Drone[];
}

export function BaseMarkerLayer({ base, drones }: BaseMarkerLayerProps) {
  // Uplink lines to D-01 and D-04 (matching mock)
  const uplinkDrones = drones.filter((d) => d.id === "D-01" || d.id === "D-04");

  return (
    <>
      <Marker
        position={[base.position.lat, base.position.lng]}
        icon={createBaseIcon(base)}
      >
        <Popup>
          <span style={{ fontFamily: "monospace", fontSize: "11px" }}>
            {base.id} · {base.status} · {base.uplinkLatency}ms
          </span>
        </Popup>
      </Marker>

      {uplinkDrones.map((drone) => (
        <Polyline
          key={`uplink-${drone.id}`}
          positions={[
            [base.position.lat, base.position.lng],
            [drone.position.lat, drone.position.lng],
          ]}
          pathOptions={{
            color: "#3b82f6",
            weight: 1,
            opacity: 0.12,
            dashArray: "2,6",
          }}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 7: Create MapOverlays**

Create `src/components/map/map-overlays.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import type { Mission } from "@/lib/types";

interface MapOverlaysProps {
  mission: Mission | null;
}

export function MapOverlays({ mission }: MapOverlaysProps) {
  const t = useTranslations("map");

  return (
    <>
      {/* Top-left info chips */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-[1000]">
        <div className="flex items-center gap-1.5 bg-[#0a0a0acc] border border-border2 rounded px-2 py-1.5 font-mono text-[10px] text-text-dim backdrop-blur-sm">
          <span>{t("wind")}</span>
          <span className="text-text font-medium">12 kt NNE</span>
          <span className="text-fleet-green">●</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#0a0a0acc] border border-border2 rounded px-2 py-1.5 font-mono text-[10px] text-text-dim backdrop-blur-sm">
          <span>{t("alt")}</span>
          <span className="text-text font-medium">120 m AGL</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#0a0a0acc] border border-border2 rounded px-2 py-1.5 font-mono text-[10px] text-text-dim backdrop-blur-sm">
          <span>{t("gps")}</span>
          <span className="text-text text-fleet-green font-medium">8/8 locked</span>
        </div>
      </div>

      {/* Mission progress bar (bottom-left) */}
      {mission && (
        <div className="absolute bottom-3 left-3 flex items-center gap-2.5 bg-[#0a0a0aee] border border-border2 rounded-[5px] px-3 py-2 font-mono text-[10px] z-[1000] backdrop-blur-lg">
          <span className="text-text font-medium text-[11px]">{mission.id}</span>
          <span className="text-border2">·</span>
          <span className="text-text-dim">{mission.name}</span>
          <span className="text-border2">·</span>
          <div className="w-20 h-[3px] bg-border2 rounded-sm overflow-hidden">
            <div
              className="h-full bg-fleet-green rounded-sm relative overflow-hidden"
              style={{ width: `${mission.coverage}%` }}
            >
              <div className="absolute top-0 left-[-100%] right-0 bottom-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
          </div>
          <span className="text-fleet-green font-semibold">{Math.round(mission.coverage)}%</span>
          <span className="text-border2">·</span>
          <span className="text-text-dim">{mission.eta}m ETA</span>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add src/components/map/
git commit -m "feat: build map panel with drone markers, mission zone, mesh links, and overlays"
```

---

### Task 16: Build right panel — Fleet tab

**Files:**
- Create: `src/components/fleet/fleet-panel.tsx`
- Create: `src/components/fleet/drone-list-item.tsx`
- Create: `src/components/fleet/formation-bar.tsx`
- Create: `src/components/fleet/telemetry-summary.tsx`

- [ ] **Step 1: Create DroneListItem**

Create `src/components/fleet/drone-list-item.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";
import { useDroneSelection } from "@/hooks/use-drone-selection";
import { useTranslations } from "next-intl";
import type { Drone } from "@/lib/types";

const statusDotClass = {
  nominal: "bg-fleet-green shadow-[0_0_4px_#22c55e88]",
  warning: "bg-fleet-amber shadow-[0_0_4px_#f59e0b88]",
  critical: "bg-fleet-red shadow-[0_0_4px_#ef444488]",
  rtb: "bg-fleet-amber shadow-[0_0_4px_#f59e0b88]",
  offline: "bg-muted",
} as const;

function batteryBarClass(battery: number) {
  if (battery > 50) return "bg-fleet-green";
  if (battery > 25) return "bg-fleet-amber";
  return "bg-fleet-red";
}

interface DroneListItemProps {
  drone: Drone;
}

export function DroneListItem({ drone }: DroneListItemProps) {
  const { selectedDroneId, selectDrone } = useDroneSelection();
  const t = useTranslations("fleet");
  const isSelected = selectedDroneId === drone.id;
  const isWarning = drone.status === "warning" || drone.status === "critical";

  return (
    <div
      onClick={() => selectDrone(drone.id)}
      className={cn(
        "flex items-center px-3.5 py-2.5 border-b border-border gap-2.5 cursor-pointer transition-colors",
        isSelected && "bg-border",
        !isSelected && "hover:bg-bg",
        isWarning && !isSelected && "bg-fleet-amber/[0.02] border-l-2 border-l-fleet-amber"
      )}
    >
      <div className={cn("w-[7px] h-[7px] rounded-full shrink-0", statusDotClass[drone.status])} />

      <div className="flex-1 min-w-0">
        <div className="font-mono text-[11px] font-medium text-text">
          {drone.id}
          {isWarning && (
            <span className="text-fleet-amber text-[10px] ml-1">⚠ {t("lowBattery")}</span>
          )}
        </div>
        <div className="text-[11px] text-text-dim mt-px">
          {drone.role.charAt(0).toUpperCase() + drone.role.slice(1)} · Grid pos {drone.gridPos.row},{drone.gridPos.col}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1 font-mono text-[10px] text-subtle">
          <span>{t("battery")}</span>
          <span className={cn(drone.battery > 50 ? "text-fleet-green" : drone.battery > 25 ? "text-fleet-amber" : "text-fleet-red")}>
            {Math.round(drone.battery)}%
          </span>
        </div>
        <div className="w-7 h-1 bg-border2 rounded-sm overflow-hidden">
          <div
            className={cn("h-full rounded-sm", batteryBarClass(drone.battery))}
            style={{ width: `${drone.battery}%` }}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create FormationBar**

Create `src/components/fleet/formation-bar.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import type { Mission } from "@/lib/types";

export function FormationBar({ mission }: { mission: Mission }) {
  const t = useTranslations("fleet");

  return (
    <div className="px-3.5 py-2.5 border-b border-border">
      <div className="flex justify-between items-center mb-1.5">
        <div className="font-mono text-[10px] tracking-wider text-subtle uppercase">
          {t("formationIntegrity")}
        </div>
        <div className="font-mono text-[13px] font-semibold text-fleet-green">
          {mission.formationIntegrity}%
        </div>
      </div>
      <div className="h-1 bg-border2 rounded-sm overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-fleet-green to-green-300 rounded-sm"
          style={{ width: `${mission.formationIntegrity}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create TelemetrySummary**

Create `src/components/fleet/telemetry-summary.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import type { Drone } from "@/lib/types";

export function TelemetrySummary({ drones }: { drones: Drone[] }) {
  const t = useTranslations("fleet");

  const avgBattery = drones.length
    ? Math.round(drones.reduce((sum, d) => sum + d.battery, 0) / drones.length)
    : 0;

  return (
    <div className="grid grid-cols-3 gap-1.5 px-3.5 pb-2.5">
      <div className="bg-bg border border-border rounded px-2 py-1.5">
        <div className="font-mono text-[9px] text-subtle uppercase tracking-wider">{t("avgBat")}</div>
        <div className="font-mono text-sm font-semibold text-text mt-0.5">
          {avgBattery}<span className="text-[9px] text-subtle font-normal">%</span>
        </div>
      </div>
      <div className="bg-bg border border-border rounded px-2 py-1.5">
        <div className="font-mono text-[9px] text-subtle uppercase tracking-wider">{t("meshRtt")}</div>
        <div className="font-mono text-sm font-semibold text-text mt-0.5">
          14<span className="text-[9px] text-subtle font-normal">ms</span>
        </div>
      </div>
      <div className="bg-bg border border-border rounded px-2 py-1.5">
        <div className="font-mono text-[9px] text-subtle uppercase tracking-wider">{t("uplink")}</div>
        <div className="font-mono text-sm font-semibold text-fleet-green mt-0.5">OK</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create FleetPanel (combines all)**

Create `src/components/fleet/fleet-panel.tsx`:

```tsx
"use client";

import { trpc } from "@/lib/trpc/client";
import { FormationBar } from "./formation-bar";
import { TelemetrySummary } from "./telemetry-summary";
import { DroneListItem } from "./drone-list-item";

export function FleetPanel() {
  const { data: drones } = trpc.drones.list.useQuery(undefined, { refetchInterval: 2000 });
  const { data: mission } = trpc.missions.active.useQuery(undefined, { refetchInterval: 2000 });

  if (!drones || !mission) return null;

  return (
    <>
      <FormationBar mission={mission} />
      <TelemetrySummary drones={drones} />
      {drones.map((drone) => (
        <DroneListItem key={drone.id} drone={drone} />
      ))}
    </>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/fleet/
git commit -m "feat: build fleet panel with drone list, formation bar, and telemetry"
```

---

### Task 17: Build right panel — Alerts and Commands tabs

**Files:**
- Create: `src/components/alerts/alert-list.tsx`
- Create: `src/components/commands/command-grid.tsx`
- Create: `src/components/commands/command-log.tsx`

- [ ] **Step 1: Create AlertList**

Create `src/components/alerts/alert-list.tsx`:

```tsx
"use client";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import type { AlertSeverity } from "@/lib/types";

const iconStyles: Record<AlertSeverity, string> = {
  warning: "bg-fleet-amber-dim text-fleet-amber border-fleet-amber/15",
  critical: "bg-fleet-red-dim text-fleet-red border-fleet-red/15",
  info: "bg-fleet-blue-dim text-fleet-blue border-fleet-blue/15",
};

const iconSymbols: Record<AlertSeverity, string> = {
  warning: "⚠",
  critical: "✕",
  info: "●",
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export function AlertList() {
  const { data: alerts } = trpc.alerts.list.useQuery(undefined, { refetchInterval: 5000 });
  const utils = trpc.useUtils();
  const dismiss = trpc.alerts.dismiss.useMutation({
    onSuccess: () => utils.alerts.list.invalidate(),
  });

  if (!alerts) return null;

  return (
    <div>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex gap-2.5 px-3.5 py-2.5 border-b border-border cursor-pointer hover:bg-bg transition-colors"
          onClick={() => dismiss.mutate({ id: alert.id })}
        >
          <div
            className={cn(
              "w-5 h-5 rounded flex items-center justify-center text-[10px] shrink-0 mt-px border",
              iconStyles[alert.severity]
            )}
          >
            {iconSymbols[alert.severity]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-text">{alert.title}</div>
            <div className="text-[11px] text-text-dim mt-px">{alert.detail}</div>
          </div>
          <div className="font-mono text-[10px] text-subtle shrink-0">
            {timeAgo(alert.timestamp)}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create CommandGrid**

Create `src/components/commands/command-grid.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function CommandGrid() {
  const t = useTranslations("commands");
  const utils = trpc.useUtils();
  const dispatch = trpc.commands.dispatch.useMutation({
    onSuccess: () => {
      utils.commands.log.invalidate();
      utils.drones.list.invalidate();
      utils.missions.active.invalidate();
    },
  });

  const send = (type: string, target = "ALL") => {
    dispatch.mutate({ type: type as "pause" | "resume" | "rtb" | "goto" | "orbit" | "abort", target });
  };

  return (
    <div className="px-3.5 py-2.5">
      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={() => send("pause")}
          className="px-2.5 py-2 bg-bg border border-border2 rounded-[5px] font-mono text-[10px] text-text-dim text-left tracking-wide hover:border-muted hover:text-text hover:bg-border transition-colors flex items-center gap-1.5"
        >
          ⏸ {t("pause")}
        </button>
        <button
          onClick={() => send("rtb")}
          className="px-2.5 py-2 bg-bg border border-border2 rounded-[5px] font-mono text-[10px] text-text-dim text-left tracking-wide hover:border-muted hover:text-text hover:bg-border transition-colors flex items-center gap-1.5"
        >
          ↩ {t("rtbAll")}
        </button>
        <button
          onClick={() => send("goto")}
          className="px-2.5 py-2 bg-bg border border-border2 rounded-[5px] font-mono text-[10px] text-text-dim text-left tracking-wide hover:border-muted hover:text-text hover:bg-border transition-colors flex items-center gap-1.5"
        >
          ⊕ {t("goTo")}
        </button>
        <button
          onClick={() => send("orbit")}
          className="px-2.5 py-2 bg-bg border border-border2 rounded-[5px] font-mono text-[10px] text-text-dim text-left tracking-wide hover:border-muted hover:text-text hover:bg-border transition-colors flex items-center gap-1.5"
        >
          ⊙ {t("orbit")}
        </button>

        {/* Abort with confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="col-span-2 px-2.5 py-2.5 border border-fleet-red/20 rounded-[5px] font-mono text-[11px] font-semibold text-fleet-red bg-fleet-red-dim tracking-widest hover:bg-fleet-red/15 hover:border-fleet-red/40 transition-colors text-center">
              ⬡ {t("abortMission")}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-surface border-border2">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-text">{t("confirmAbortTitle")}</AlertDialogTitle>
              <AlertDialogDescription className="text-text-dim">
                {t("confirmAbort")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-bg border-border2 text-text-dim hover:bg-border hover:text-text">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => send("abort")}
                className="bg-fleet-red text-white hover:bg-fleet-red/80"
              >
                Abort
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create CommandLog**

Create `src/components/commands/command-log.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import type { CommandState } from "@/lib/types";

const stateStyles: Record<CommandState, string> = {
  completed: "bg-fleet-green-dim text-fleet-green",
  executing: "bg-fleet-blue-dim text-fleet-blue",
  pending: "bg-fleet-amber-dim text-fleet-amber",
  failed: "bg-fleet-red-dim text-fleet-red",
};

const stateLabels: Record<CommandState, string> = {
  completed: "DONE",
  executing: "EXEC",
  pending: "PEND",
  failed: "FAIL",
};

export function CommandLog() {
  const t = useTranslations("commands");
  const { data: commands } = trpc.commands.log.useQuery(undefined, { refetchInterval: 3000 });

  if (!commands) return null;

  return (
    <div className="px-3.5 pb-2.5">
      <div className="font-mono text-[10px] tracking-widest text-subtle uppercase mb-2">
        {t("commandLog")}
      </div>
      <div className="flex flex-col gap-1">
        {commands.slice(0, 10).map((cmd) => (
          <div
            key={cmd.id}
            className="flex items-center gap-2 font-mono text-[10px] px-1.5 py-1 rounded-sm bg-bg border border-border"
          >
            <span className={cn("px-1.5 py-px rounded-sm text-[9px] font-semibold shrink-0", stateStyles[cmd.state])}>
              {stateLabels[cmd.state]}
            </span>
            <span className="text-text-dim flex-1">{cmd.type.toUpperCase().replace("_", " ")}</span>
            <span className="text-subtle">{cmd.target}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/alerts/ src/components/commands/
git commit -m "feat: build alerts list, command grid with abort dialog, and command log"
```

---

### Task 18: Build the right panel with tabs

**Files:**
- Create: `src/components/dashboard/right-panel.tsx`

- [ ] **Step 1: Create RightPanel**

Create `src/components/dashboard/right-panel.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc/client";
import { FleetPanel } from "@/components/fleet/fleet-panel";
import { AlertList } from "@/components/alerts/alert-list";
import { CommandGrid } from "@/components/commands/command-grid";
import { CommandLog } from "@/components/commands/command-log";

export function RightPanel() {
  const tf = useTranslations("fleet");
  const ta = useTranslations("alerts");
  const tc = useTranslations("commands");
  const ts = useTranslations("swarmHealth");

  const { data: alerts } = trpc.alerts.list.useQuery(undefined, { refetchInterval: 5000 });
  const { data: baseStations } = trpc.baseStations.useQuery(undefined, { refetchInterval: 5000 });

  const alertCount = alerts?.filter((a) => a.severity !== "info").length ?? 0;
  const baseLatency = baseStations?.[0]?.uplinkLatency ?? 0;

  return (
    <div className="bg-surface flex flex-col overflow-hidden border-l border-border">
      <Tabs defaultValue="fleet" className="flex flex-col flex-1 overflow-hidden">
        <TabsList className="flex border-b border-border shrink-0 bg-transparent rounded-none h-auto p-0">
          <TabsTrigger
            value="fleet"
            className="flex-1 py-2.5 text-center font-mono text-[10px] tracking-wider text-subtle uppercase rounded-none border-b border-transparent mb-[-1px] data-[state=active]:text-text data-[state=active]:border-b-text data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            {tf("title")}
          </TabsTrigger>
          <TabsTrigger
            value="alerts"
            className="flex-1 py-2.5 text-center font-mono text-[10px] tracking-wider text-subtle uppercase rounded-none border-b border-transparent mb-[-1px] data-[state=active]:text-text data-[state=active]:border-b-text data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            {ta("title")}
          </TabsTrigger>
          <TabsTrigger
            value="commands"
            className="flex-1 py-2.5 text-center font-mono text-[10px] tracking-wider text-subtle uppercase rounded-none border-b border-transparent mb-[-1px] data-[state=active]:text-text data-[state=active]:border-b-text data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            {tc("title")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="flex-1 overflow-y-auto mt-0 scrollbar-thin">
          <FleetPanel />
        </TabsContent>

        <TabsContent value="alerts" className="flex-1 overflow-y-auto mt-0 scrollbar-thin">
          <AlertList />
        </TabsContent>

        <TabsContent value="commands" className="flex-1 overflow-y-auto mt-0 scrollbar-thin">
          <CommandGrid />
          <CommandLog />
        </TabsContent>
      </Tabs>

      {/* Swarm health footer */}
      <div className="grid grid-cols-4 gap-px bg-border border-t border-border shrink-0 mt-auto">
        {[
          { label: ts("swarm"), value: "Nominal", color: "text-fleet-green" },
          { label: ts("baseLink"), value: `${baseLatency}ms`, color: "text-fleet-green" },
          { label: ts("cloud"), value: "Online", color: "text-fleet-green" },
          { label: ts("alerts"), value: `${alertCount} active`, color: alertCount > 0 ? "text-fleet-amber" : "text-fleet-green" },
        ].map((cell) => (
          <div key={cell.label} className="bg-surface px-3.5 py-2 flex flex-col gap-1">
            <div className="font-mono text-[9px] text-subtle uppercase tracking-wider">{cell.label}</div>
            <div className={`font-mono text-[13px] font-semibold tracking-tight ${cell.color}`}>{cell.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/right-panel.tsx
git commit -m "feat: build right panel with Fleet/Alerts/Commands tabs and swarm health footer"
```

---

### Task 19: Assemble the overview page

**Files:**
- Create: `src/components/dashboard/page-header.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create PageHeader**

Create `src/components/dashboard/page-header.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";

export function PageHeader() {
  const t = useTranslations("dashboard");
  const { data: mission } = trpc.missions.active.useQuery(undefined, { refetchInterval: 2000 });

  return (
    <div className="px-5 pt-4 flex items-start justify-between shrink-0">
      <div>
        <div className="text-[15px] font-semibold text-text tracking-tight">
          {t("fleetOverview")}
        </div>
        {mission && (
          <div className="text-[11px] text-text-dim font-mono mt-0.5">
            {mission.id} · {mission.name} · {Math.round(mission.coverage)}% complete · {mission.baseId}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="bg-surface border-border2 text-text-dim hover:border-muted hover:text-text font-sans text-xs">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="mr-1">
            <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          {t("newMission")}
        </Button>
        <Button size="sm" className="bg-text text-bg border-text font-semibold hover:bg-text/80 font-sans text-xs">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="mr-1">
            <path d="M3 5.5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("preFlightCheck")}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Assemble overview page**

Replace `src/app/page.tsx`:

```tsx
"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatsRow } from "@/components/dashboard/stats-row";
import { MapPanel } from "@/components/map/map-panel";
import { RightPanel } from "@/components/dashboard/right-panel";

export default function OverviewPage() {
  return (
    <>
      <PageHeader />
      <StatsRow />
      <div className="grid grid-cols-[1fr_320px] gap-px bg-border flex-1 overflow-hidden mt-px">
        <MapPanel />
        <RightPanel />
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verify the full dashboard renders**

```bash
npm run dev
```

Open localhost:3000 — should show the complete dashboard matching the HTML mock: topbar, sidebar, stats row, map with drone markers, right panel with tabs.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: assemble overview dashboard page with all components"
```

---

## Chunk 5: Placeholder Pages & Final Polish

### Task 20: Create placeholder pages for navigation

**Files:**
- Create: `src/app/missions/page.tsx`
- Create: `src/app/fleet/page.tsx`
- Create: `src/app/bases/page.tsx`
- Create: `src/app/telemetry/page.tsx`
- Create: `src/app/audit/page.tsx`

- [ ] **Step 1: Create all placeholder pages**

Each page follows the same pattern:

```tsx
// src/app/missions/page.tsx
export default function MissionsPage() {
  return (
    <div className="flex items-center justify-center flex-1 text-text-dim font-mono text-sm">
      Missions — Coming soon
    </div>
  );
}
```

Repeat for `fleet/page.tsx` ("Fleet"), `bases/page.tsx` ("Base Stations"), `telemetry/page.tsx` ("Telemetry"), `audit/page.tsx` ("Audit Log").

- [ ] **Step 2: Verify navigation works**

Click through sidebar and topbar links — each should render its placeholder and highlight the active nav item.

- [ ] **Step 3: Commit**

```bash
git add src/app/missions src/app/fleet src/app/bases src/app/telemetry src/app/audit
git commit -m "feat: add placeholder pages for all nav routes"
```

---

### Task 21: Verify full integration

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify checklist**

Open localhost:3000 and confirm:

- [ ] Topbar renders with logo, nav, status pill
- [ ] Sidebar renders with live badge counts
- [ ] Stats row shows 5 stat cards with live data
- [ ] Map shows with dark tiles, mission zone, drone markers, mesh links, base station
- [ ] Drone markers animate (drift)
- [ ] Clicking a drone in the list highlights it in the list and on the map
- [ ] Clicking a drone on the map selects it in the list
- [ ] Fleet tab shows formation bar, telemetry summary, drone list
- [ ] Alerts tab shows alerts with dismiss on click
- [ ] Commands tab shows command buttons that dispatch commands
- [ ] Abort button shows confirmation dialog
- [ ] Command log updates after dispatching commands
- [ ] Navigation between pages works
- [ ] Battery on D-07 slowly drains, triggering alerts when it hits thresholds
- [ ] Coverage percentage slowly increases

- [ ] **Step 3: Fix any type errors**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: VECTR Fleet Dashboard — functional prototype complete"
```
