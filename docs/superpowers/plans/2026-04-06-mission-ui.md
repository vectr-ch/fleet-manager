# Mission UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the mission management UI: list page with filters, stepped creation flow with map-based polygon drawing, detail page with state transitions, and client-side waypoint preview — implementing the surveillance mission type.

**Architecture:** Next.js App Router with tRPC + React Query for data fetching. Mission creation uses a dedicated `/missions/new` page with a split layout (Leaflet map + stepped config panel). Type-specific param components are modular — only `SurveillanceParams` is implemented now. Client-side boustrophedon algorithm provides real-time waypoint preview; backend persists on save.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, tRPC 11, React Query 5, Leaflet 1.9 + React Leaflet 5, Tailwind 4, Zod 4

**Linear Issues:** VEC-35 (state machine UI), VEC-46 (mission management UI), VEC-120 (surveillance area drawing), VEC-124 (mission telemetry)

---

## File Map

### New Files
| File | Responsibility |
|------|---------------|
| `src/lib/waypoints.ts` | Client-side boustrophedon algorithm for real-time preview |
| `src/lib/mission-types.ts` | Mission type definitions, status colors, abort action labels |
| `src/app/(dashboard)/missions/new/page.tsx` | Mission creation page — map + stepped config panel |
| `src/app/(dashboard)/missions/[id]/page.tsx` | Mission detail page — map + info + state transitions |
| `src/components/missions/mission-creation-panel.tsx` | Stepped config panel (orchestrates steps 1-4) |
| `src/components/missions/steps/type-select-step.tsx` | Step 1: Mission type selector |
| `src/components/missions/steps/configure-step.tsx` | Step 2: Type-specific params (renders per-type component) |
| `src/components/missions/steps/base-fleet-step.tsx` | Step 3: Base selection + fleet preview |
| `src/components/missions/steps/review-step.tsx` | Step 4: Review all settings before creating |
| `src/components/missions/params/surveillance-params.tsx` | Surveillance-specific form: spacing, altitude, speed, loop |
| `src/components/missions/mission-detail-panel.tsx` | Detail view: mission info, nodes, events, action buttons |
| `src/components/missions/mission-status-badge.tsx` | Reusable status badge with color per state |
| `src/components/missions/preflight-report.tsx` | Pre-flight check results display |
| `src/components/map/mission-map.tsx` | Extended map: polygon drawing, waypoint path overlay, base markers |
| `src/components/map/polygon-draw.tsx` | Polygon drawing interaction using Leaflet events (no leaflet-draw dep) |
| `src/components/map/waypoint-path.tsx` | Polyline overlay showing generated waypoint path |

### Modified Files
| File | Changes |
|------|---------|
| `src/lib/types.ts` | Replace Mission stub with full schema; add MissionType, MissionDetail, PreFlightReport types |
| `src/server/routers/missions.ts` | Replace stubs with real FMS API calls (list, create, update, state transitions, fleet, waypoints) |
| `src/server/routers/index.ts` | Add missionTypes router |
| `src/app/(dashboard)/missions/page.tsx` | Full rewrite: status filter tabs, type badges, quick actions, click to detail |

---

## Task 1: Types and Utilities

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/mission-types.ts`
- Create: `src/lib/waypoints.ts`

- [ ] **Step 1: Update Mission types in `src/lib/types.ts`**

Replace the mission stub (lines 117-134) with the full schema matching the backend:

```typescript
// ─── Mission Types ──────────────────────────────────────────

export const missionStatusSchema = z.enum([
  "draft", "planned", "approved", "activating", "active",
  "completing", "completed", "aborting", "aborted", "canceled",
]);
export type MissionStatus = z.infer<typeof missionStatusSchema>;

export const missionSchema = z.object({
  id: z.string(),
  type: z.string(),
  mode: z.string(),
  status: missionStatusSchema,
  base_id: z.string().nullable().optional(),
  drone_count: z.number().nullable().optional(),
  min_drone_count: z.number().nullable().optional(),
  params: z.any().optional(),
  waypoints: z.any().optional(),
  abort_action: z.any().optional(),
  created_by: z.string(),
  approved_by: z.string().nullable().optional(),
  activated_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Mission = z.infer<typeof missionSchema>;

export const missionNodeSchema = z.object({
  mission_id: z.string(),
  node_id: z.string(),
  role: z.string().nullable().optional(),
  assigned_at: z.string(),
});
export type MissionNode = z.infer<typeof missionNodeSchema>;

export const missionEventSchema = z.object({
  id: z.string(),
  mission_id: z.string(),
  from_status: z.string().nullable().optional(),
  to_status: z.string(),
  actor_id: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  created_at: z.string(),
});
export type MissionEvent = z.infer<typeof missionEventSchema>;

export const missionDetailSchema = z.object({
  mission: missionSchema,
  nodes: z.array(missionNodeSchema),
  events: z.array(missionEventSchema),
});
export type MissionDetail = z.infer<typeof missionDetailSchema>;

export const missionTypeSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  description: z.string(),
  params_schema: z.any(),
  default_abort_action: z.any(),
  icon: z.string().nullable().optional(),
  enabled: z.boolean(),
  sort_order: z.number(),
});
export type MissionType = z.infer<typeof missionTypeSchema>;

export const preFlightCheckSchema = z.object({
  name: z.string(),
  passed: z.boolean(),
  detail: z.string(),
});

export const preFlightReportSchema = z.object({
  passed: z.boolean(),
  checks: z.array(preFlightCheckSchema),
});
export type PreFlightReport = z.infer<typeof preFlightReportSchema>;

export const fleetAssignmentResultSchema = z.object({
  assigned_nodes: z.array(missionNodeSchema),
  total_pool: z.number(),
  healthy_pool: z.number(),
});
export type FleetAssignmentResult = z.infer<typeof fleetAssignmentResultSchema>;
```

- [ ] **Step 2: Create mission type utilities in `src/lib/mission-types.ts`**

```typescript
import type { MissionStatus } from "./types";

// Status display config
export const missionStatusConfig: Record<MissionStatus, { label: string; color: string; bgColor: string }> = {
  draft:      { label: "Draft",      color: "text-neutral-400", bgColor: "bg-neutral-800" },
  planned:    { label: "Planned",    color: "text-blue-400",    bgColor: "bg-blue-900/30" },
  approved:   { label: "Approved",   color: "text-blue-300",    bgColor: "bg-blue-900/40" },
  activating: { label: "Activating", color: "text-amber-400",   bgColor: "bg-amber-900/30" },
  active:     { label: "Active",     color: "text-green-400",   bgColor: "bg-green-900/30" },
  completing: { label: "Completing", color: "text-green-300",   bgColor: "bg-green-900/20" },
  completed:  { label: "Completed",  color: "text-green-500",   bgColor: "bg-green-900/40" },
  aborting:   { label: "Aborting",   color: "text-red-400",     bgColor: "bg-red-900/30" },
  aborted:    { label: "Aborted",    color: "text-red-500",     bgColor: "bg-red-900/40" },
  canceled:   { label: "Canceled",   color: "text-neutral-500", bgColor: "bg-neutral-800/50" },
};

// Abort action labels
export const abortActionLabels: Record<string, string> = {
  return_to_base: "Return to Base",
  emergency_land: "Emergency Land",
  hover: "Hover in Place",
};

// Mission type icons (for the type selector)
export const missionTypeIcons: Record<string, string> = {
  surveillance: "scan",
  search_rescue: "search",
  payload_delivery: "package",
};

// Actions available per status
export const statusActions: Record<string, { label: string; action: string; variant: "default" | "destructive" | "outline" }[]> = {
  draft:    [{ label: "Submit for Approval", action: "submit", variant: "default" }],
  planned:  [
    { label: "Approve", action: "approve", variant: "default" },
    { label: "Reject", action: "reject", variant: "outline" },
  ],
  approved: [{ label: "Activate Mission", action: "activate", variant: "default" }],
  active:   [
    { label: "Complete", action: "complete", variant: "default" },
    { label: "Abort", action: "abort", variant: "destructive" },
  ],
};

// Cancelable statuses
export const cancelableStatuses = ["draft", "planned", "approved"];
```

- [ ] **Step 3: Create client-side waypoint generation in `src/lib/waypoints.ts`**

Port the Go boustrophedon algorithm to TypeScript for real-time preview:

```typescript
export interface LatLng {
  lat: number;
  lng: number;
}

export interface WaypointParams {
  spacingM: number;
  altitudeM: number;
  speedMS: number;
}

export interface GeneratedWaypoint {
  lat: number;
  lng: number;
  altitude_m: number;
  speed_ms: number;
  index: number;
}

export function generateWaypoints(
  polygon: LatLng[],
  params: WaypointParams
): GeneratedWaypoint[] {
  if (polygon.length < 3 || params.spacingM <= 0) return [];

  // Bounding box
  let minLat = polygon[0].lat, maxLat = polygon[0].lat;
  for (const p of polygon) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
  }

  const spacingDeg = params.spacingM / 111320;
  const waypoints: GeneratedWaypoint[] = [];
  let idx = 0;
  let leftToRight = true;

  for (let lat = minLat; lat <= maxLat; lat += spacingDeg) {
    const intersections = scanLineIntersections(polygon, lat);
    if (intersections.length < 2) continue;
    intersections.sort((a, b) => a - b);

    for (let i = 0; i + 1 < intersections.length; i += 2) {
      let startLng = intersections[i];
      let endLng = intersections[i + 1];
      if (!leftToRight) [startLng, endLng] = [endLng, startLng];

      waypoints.push(
        { lat, lng: startLng, altitude_m: params.altitudeM, speed_ms: params.speedMS, index: idx },
        { lat, lng: endLng, altitude_m: params.altitudeM, speed_ms: params.speedMS, index: idx + 1 }
      );
      idx += 2;
    }
    leftToRight = !leftToRight;
  }

  return waypoints;
}

function scanLineIntersections(polygon: LatLng[], lat: number): number[] {
  const xs: number[] = [];
  const n = polygon.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    let a = polygon[i], b = polygon[j];
    if (a.lat > b.lat) [a, b] = [b, a];
    if (lat < a.lat || lat >= b.lat) continue;
    const t = (lat - a.lat) / (b.lat - a.lat);
    xs.push(a.lng + t * (b.lng - a.lng));
  }
  return xs;
}
```

- [ ] **Step 4: Verify build**

Run: `cd /home/kusanagi/projects/vectr/front && npm run build` (or `npx next build`)

- [ ] **Step 5: Commit**

```
feat(types): mission types, status config, client-side waypoint generation

VEC-35 full mission type system. VEC-121 boustrophedon preview algorithm.
```

---

## Task 2: tRPC Mission Router — Real API Calls

**Files:**
- Modify: `src/server/routers/missions.ts`
- Create: `src/server/routers/mission-types.ts`
- Modify: `src/server/routers/index.ts`

- [ ] **Step 1: Rewrite missions router with real FMS calls**

Replace `src/server/routers/missions.ts` entirely:

```typescript
import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { fmsFetch } from "@/lib/fms";
import type { Mission, MissionDetail, PreFlightReport, FleetAssignmentResult } from "@/lib/types";

export const missionsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const res = await fmsFetch<{ missions: Mission[] }>(`/orgs/${ctx.orgSlug}/missions`, {
      accessToken: ctx.accessToken,
    });
    return res.missions;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return fmsFetch<MissionDetail>(`/orgs/${ctx.orgSlug}/missions/${input.id}`, {
        accessToken: ctx.accessToken,
      });
    }),

  create: protectedProcedure
    .input(z.object({
      type: z.string(),
      mode: z.string().optional(),
      base_id: z.string().optional(),
      params: z.any().optional(),
      abort_action: z.any().optional(),
      drone_count: z.number().optional(),
      min_drone_count: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<Mission>(`/orgs/${ctx.orgSlug}/missions`, {
        method: "POST",
        body: input,
        accessToken: ctx.accessToken,
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      type: z.string().optional(),
      mode: z.string().optional(),
      base_id: z.string().optional(),
      params: z.any().optional(),
      abort_action: z.any().optional(),
      drone_count: z.number().optional(),
      min_drone_count: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      return fmsFetch<Mission>(`/orgs/${ctx.orgSlug}/missions/${id}`, {
        method: "PATCH",
        body,
        accessToken: ctx.accessToken,
      });
    }),

  // State transitions
  submit: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<Mission>(`/orgs/${ctx.orgSlug}/missions/${input.id}/submit`, {
        method: "POST",
        accessToken: ctx.accessToken,
      });
    }),

  approve: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<Mission>(`/orgs/${ctx.orgSlug}/missions/${input.id}/approve`, {
        method: "POST",
        accessToken: ctx.accessToken,
      });
    }),

  reject: protectedProcedure
    .input(z.object({ id: z.string(), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<Mission>(`/orgs/${ctx.orgSlug}/missions/${input.id}/reject`, {
        method: "POST",
        body: { reason: input.reason },
        accessToken: ctx.accessToken,
      });
    }),

  activate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<{ mission: Mission; preflight_report: PreFlightReport }>(
        `/orgs/${ctx.orgSlug}/missions/${input.id}/activate`,
        { method: "POST", accessToken: ctx.accessToken }
      );
    }),

  complete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<Mission>(`/orgs/${ctx.orgSlug}/missions/${input.id}/complete`, {
        method: "POST",
        accessToken: ctx.accessToken,
      });
    }),

  abort: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<Mission>(`/orgs/${ctx.orgSlug}/missions/${input.id}/abort`, {
        method: "POST",
        accessToken: ctx.accessToken,
      });
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<Mission>(`/orgs/${ctx.orgSlug}/missions/${input.id}/cancel`, {
        method: "POST",
        accessToken: ctx.accessToken,
      });
    }),

  // Fleet & waypoints
  assignFleet: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<FleetAssignmentResult>(
        `/orgs/${ctx.orgSlug}/missions/${input.id}/assign-fleet`,
        { method: "POST", accessToken: ctx.accessToken }
      );
    }),

  generateWaypoints: protectedProcedure
    .input(z.object({
      id: z.string(),
      spacing_m: z.number(),
      altitude_m: z.number(),
      speed_ms: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      return fmsFetch<Mission>(`/orgs/${ctx.orgSlug}/missions/${id}/generate-waypoints`, {
        method: "POST",
        body,
        accessToken: ctx.accessToken,
      });
    }),

  // Node assignment
  assignNode: protectedProcedure
    .input(z.object({ id: z.string(), node_id: z.string(), role: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch(`/orgs/${ctx.orgSlug}/missions/${input.id}/nodes`, {
        method: "POST",
        body: { node_id: input.node_id, role: input.role },
        accessToken: ctx.accessToken,
      });
    }),

  removeNode: protectedProcedure
    .input(z.object({ id: z.string(), node_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch(`/orgs/${ctx.orgSlug}/missions/${input.id}/nodes/${input.node_id}`, {
        method: "DELETE",
        accessToken: ctx.accessToken,
      });
    }),
});
```

- [ ] **Step 2: Create mission types router**

Create `src/server/routers/mission-types.ts`:

```typescript
import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { fmsFetch } from "@/lib/fms";
import type { MissionType } from "@/lib/types";

export const missionTypesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const res = await fmsFetch<{ types: MissionType[] }>(`/orgs/${ctx.orgSlug}/mission-types`, {
      accessToken: ctx.accessToken,
    });
    return res.types;
  }),

  getByName: protectedProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      return fmsFetch<MissionType>(`/orgs/${ctx.orgSlug}/mission-types/${input.name}`, {
        accessToken: ctx.accessToken,
      });
    }),
});
```

- [ ] **Step 3: Register in app router**

In `src/server/routers/index.ts`, add:
```typescript
import { missionTypesRouter } from "./mission-types";
```
And add to the appRouter:
```typescript
missionTypes: missionTypesRouter,
```

- [ ] **Step 4: Verify build**

- [ ] **Step 5: Commit**

```
feat(api): wire mission tRPC router to FMS backend

Replace stubs with real API calls for all 18 mission endpoints.
Add missionTypes router for type registry queries.
```

---

## Task 3: Reusable Mission Components

**Files:**
- Create: `src/components/missions/mission-status-badge.tsx`
- Create: `src/components/missions/preflight-report.tsx`

- [ ] **Step 1: Create mission status badge**

```typescript
"use client";

import type { MissionStatus } from "@/lib/types";
import { missionStatusConfig } from "@/lib/mission-types";

interface MissionStatusBadgeProps {
  status: MissionStatus;
  size?: "sm" | "md";
}

export function MissionStatusBadge({ status, size = "sm" }: MissionStatusBadgeProps) {
  const config = missionStatusConfig[status] ?? missionStatusConfig.draft;
  const sizeClasses = size === "sm"
    ? "text-[10px] px-2 py-0.5"
    : "text-[11px] px-2.5 py-1";

  return (
    <span className={`font-mono tracking-wider uppercase rounded ${sizeClasses} ${config.color} ${config.bgColor} border border-neutral-700/50`}>
      {config.label}
    </span>
  );
}
```

- [ ] **Step 2: Create pre-flight report display**

```typescript
"use client";

import type { PreFlightReport } from "@/lib/types";

interface PreFlightReportProps {
  report: PreFlightReport;
}

export function PreFlightReportDisplay({ report }: PreFlightReportProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${report.passed ? "bg-green-500" : "bg-red-500"}`} />
        <span className="font-mono text-[11px] font-semibold text-white">
          Pre-flight {report.passed ? "Passed" : "Failed"}
        </span>
      </div>
      <div className="space-y-1.5">
        {report.checks.map((check) => (
          <div key={check.name} className="flex items-center gap-2 font-mono text-[11px]">
            <span className={check.passed ? "text-green-500" : "text-red-500"}>
              {check.passed ? "PASS" : "FAIL"}
            </span>
            <span className="text-neutral-400">{check.name}</span>
            <span className="text-neutral-600 ml-auto truncate max-w-[200px]">{check.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```
feat(ui): mission status badge and pre-flight report components
```

---

## Task 4: Map Components — Polygon Drawing + Waypoint Path

**Files:**
- Create: `src/components/map/polygon-draw.tsx`
- Create: `src/components/map/waypoint-path.tsx`
- Create: `src/components/map/mission-map.tsx`

- [ ] **Step 1: Create polygon drawing component**

Uses Leaflet click events to place vertices. No leaflet-draw dependency.

`src/components/map/polygon-draw.tsx` — a React Leaflet component that:
- Listens for map clicks to add polygon vertices
- Renders vertices as circle markers (draggable)
- Renders polygon edges as polylines (blue, semi-transparent fill)
- Double-click closes the polygon
- Provides `onPolygonChange(latlngs: LatLng[])` callback
- Supports clear/reset
- Shows vertex count and "click to add, double-click to close" hint

- [ ] **Step 2: Create waypoint path overlay**

`src/components/map/waypoint-path.tsx` — renders the generated waypoint path:
- Polyline connecting all waypoints in order (green, dashed)
- Small circle markers at each waypoint
- Alternating scan direction visible
- Shows waypoint count label

- [ ] **Step 3: Create mission map component**

`src/components/map/mission-map.tsx` — extended map component that:
- Props: `mode: "view" | "draw"`, `polygon`, `waypoints`, `bases`, `onPolygonChange`
- In draw mode: renders PolygonDraw component, base markers
- In view mode: renders polygon (filled), waypoint path, base marker
- Fits bounds to polygon when provided
- Dark theme tiles (existing CSS)
- Zoom controls (existing pattern)

- [ ] **Step 4: Verify build**

- [ ] **Step 5: Commit**

```
feat(map): polygon drawing, waypoint path overlay, mission map

VEC-120 surveillance area drawing on Leaflet map.
Custom polygon draw via click events (no leaflet-draw dep).
```

---

## Task 5: Mission Creation Page — Stepped Flow

**Files:**
- Create: `src/app/(dashboard)/missions/new/page.tsx`
- Create: `src/components/missions/mission-creation-panel.tsx`
- Create: `src/components/missions/steps/type-select-step.tsx`
- Create: `src/components/missions/steps/configure-step.tsx`
- Create: `src/components/missions/steps/base-fleet-step.tsx`
- Create: `src/components/missions/steps/review-step.tsx`
- Create: `src/components/missions/params/surveillance-params.tsx`

- [ ] **Step 1: Create the page layout**

`src/app/(dashboard)/missions/new/page.tsx`:
- Split layout: map (left, ~60%) + config panel (right, ~40%)
- Map loaded dynamically (SSR disabled)
- Config panel is `MissionCreationPanel`
- State hoisted here: `currentStep`, `missionConfig` (type, params, base, abort), `polygon`, `waypoints`
- Waypoints auto-generated when polygon changes or params change (debounced)

- [ ] **Step 2: Create the stepped panel orchestrator**

`src/components/missions/mission-creation-panel.tsx`:
- Step progress indicator at top (1. Type — 2. Configure — 3. Base — 4. Review)
- Renders the active step component
- Back/Next buttons with validation per step
- "Create Draft" button on step 4
- Calls `trpc.missions.create` mutation then `trpc.missions.generateWaypoints` on success
- Navigates to `/missions/:id` after creation

- [ ] **Step 3: Create Step 1 — Type selector**

`src/components/missions/steps/type-select-step.tsx`:
- Fetches types from `trpc.missionTypes.list`
- Card per type: icon, display_name, description
- Selected card has blue border accent
- Disabled types show "Coming soon" badge
- Only surveillance is enabled for now (others show disabled)

- [ ] **Step 4: Create Step 2 — Configure**

`src/components/missions/steps/configure-step.tsx`:
- Renders the type-specific param component based on selected type
- For surveillance: renders `SurveillanceParams`
- Future types would render their own component here

`src/components/missions/params/surveillance-params.tsx`:
- Spacing (meters): number input, default 30
- Altitude (meters): number input, default 50
- Speed (m/s): number input, default 5
- Loop: toggle switch, default true
- Abort action selector: 3 radio cards (Return to Base, Emergency Land, Hover)
- Instruction text: "Draw the surveillance area on the map"
- Calls `onParamsChange` callback when any value changes
- Sets map to draw mode via callback

- [ ] **Step 5: Create Step 3 — Base & Fleet**

`src/components/missions/steps/base-fleet-step.tsx`:
- Fetches bases from `trpc.bases.list`
- List of bases as selectable cards (name, status, lat/lng, node count)
- Only bases with status "enrolled" and maintenance_mode=false are selectable
- Drone count input (default 1)
- Min drone count input (optional)
- Selected base highlighted on map via callback

- [ ] **Step 6: Create Step 4 — Review**

`src/components/missions/steps/review-step.tsx`:
- Summary of all selections: type, params, base, abort action, drone count
- Map shows polygon + waypoints + base marker (read-only)
- Waypoint count display
- Estimated flight distance/time (calculated from waypoint path)
- "Create Draft" button (primary action)
- "Back" to modify any step

- [ ] **Step 7: Verify build and test flow**

- [ ] **Step 8: Commit**

```
feat(ui): mission creation page with stepped flow and map drawing

VEC-46 mission management create flow.
VEC-120 surveillance area polygon drawing.
4-step wizard: type → configure → base → review.
Real-time waypoint preview on map.
```

---

## Task 6: Mission Detail Page

**Files:**
- Create: `src/app/(dashboard)/missions/[id]/page.tsx`
- Create: `src/components/missions/mission-detail-panel.tsx`

- [ ] **Step 1: Create the detail page**

`src/app/(dashboard)/missions/[id]/page.tsx`:
- Split layout matching creation page: map (left) + detail panel (right)
- Map shows polygon (filled) + waypoint path + base marker
- Map is view-only (no drawing)
- Fetches mission detail: `trpc.missions.getById`
- Loading state, error state, 404 handling

- [ ] **Step 2: Create the detail panel**

`src/components/missions/mission-detail-panel.tsx`:
- Header: mission type badge + status badge + ID
- Info section: base, drone count, abort action, created by, timestamps
- Params section: type-specific display (surveillance shows spacing, altitude, speed)
- Nodes section: list of assigned nodes with roles
- Event timeline: chronological list of state transitions
- Action buttons (contextual based on status):
  - Draft: "Submit for Approval", "Cancel"
  - Planned: "Approve", "Reject" (with reason input), "Cancel"
  - Approved: "Activate", "Cancel"
  - Active: "Complete", "Abort"
- Pre-flight report shown after activation attempt
- All actions call corresponding tRPC mutations, invalidate query on success

- [ ] **Step 3: Verify build and test flow**

- [ ] **Step 4: Commit**

```
feat(ui): mission detail page with state transitions

VEC-35 mission lifecycle controls.
VEC-46 mission management — monitor, approve, activate, abort.
```

---

## Task 7: Missions List Page — Full Rewrite

**Files:**
- Modify: `src/app/(dashboard)/missions/page.tsx`

- [ ] **Step 1: Rewrite missions list page**

Full replacement of the current stub page:
- Header with "Create Mission" button (links to `/missions/new`)
- Status filter tabs: All / Active / Draft / Completed / Aborted
- Mission list with:
  - Type badge (icon + name)
  - Mission status badge (colored)
  - Base name (if assigned)
  - Created timestamp
  - Quick action buttons per status (visible on hover):
    - Active: Abort button
    - Draft: Submit button
    - Planned: Approve button
  - Click row → navigate to `/missions/:id`
- Empty states per filter tab
- Loading state

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```
feat(ui): missions list page with filters and quick actions

VEC-46 mission management list view.
Status filter tabs, type badges, click-to-detail navigation.
```

---

## Task 8: Integration Testing and Polish

**Files:**
- Various — fix issues found during testing

- [ ] **Step 1: Test full creation flow**

Manually test: navigate to /missions/new, select surveillance type, draw polygon on map, configure params (verify waypoint preview updates), select base, review, create draft.

- [ ] **Step 2: Test state transitions**

On the detail page: submit → approve → activate (check pre-flight report) → complete. Also test abort and cancel paths.

- [ ] **Step 3: Test list page**

Verify filters work, quick actions work, click-to-detail works.

- [ ] **Step 4: Fix any issues found**

- [ ] **Step 5: Final commit**

```
fix(ui): mission UI polish and integration fixes
```

---

## Summary

| Task | Description | Linear |
|------|------------|--------|
| 1 | Types, status config, client-side waypoint algorithm | VEC-35, VEC-121 |
| 2 | tRPC mission router — real FMS API calls (18 endpoints) | VEC-35, VEC-46 |
| 3 | Reusable components: status badge, pre-flight report | VEC-35 |
| 4 | Map components: polygon draw, waypoint path, mission map | VEC-120 |
| 5 | Mission creation page — 4-step wizard + map | VEC-46, VEC-120 |
| 6 | Mission detail page — info + state transitions | VEC-35, VEC-46 |
| 7 | Missions list page — filters, badges, quick actions | VEC-46 |
| 8 | Integration testing and polish | All |
