# VECTR Fleet Dashboard — Design Spec

## Overview

Convert the static HTML mock (`claude_vectr_dashboard.html`) into a functional Next.js prototype with server-side simulation, tRPC API, and interactive UI. All data is mock but flows through a realistic data layer so the transition to real telemetry requires minimal changes.

## Tech Stack

- **Next.js 15** — App Router, server components where applicable
- **Tailwind CSS v4** — custom theme matching the mock's design tokens
- **shadcn/ui** — base primitives (Button, Badge, Tabs, Progress, AlertDialog, Tooltip)
- **tRPC v11** — typed API layer between client and server
- **react-leaflet** — map with OSM tiles, dark CSS filter
- **Zod** — shared schema validation

## Project Structure

```
src/
├── app/                          # App Router pages
│   ├── layout.tsx                # Shell: Topbar + Sidebar
│   ├── page.tsx                  # Overview dashboard
│   ├── missions/page.tsx         # Placeholder
│   ├── fleet/page.tsx            # Placeholder
│   ├── bases/page.tsx            # Placeholder
│   ├── telemetry/page.tsx        # Placeholder
│   └── audit/page.tsx            # Placeholder
├── components/
│   ├── layout/                   # Topbar, Sidebar, OrgSelector
│   ├── dashboard/                # StatsRow, BodyGrid
│   ├── map/                      # MapPanel, DroneMarker, MissionZone, MeshLinks
│   ├── fleet/                    # DroneList, DroneListItem, FleetPanel
│   ├── alerts/                   # AlertList, AlertItem
│   ├── commands/                 # CommandGrid, CommandLog, AbortButton
│   └── ui/                       # shadcn primitives
├── server/
│   ├── trpc.ts                   # tRPC init + appRouter
│   ├── routers/                  # drones, missions, alerts, commands
│   └── simulation/               # engine, state, seed
├── lib/
│   ├── types.ts                  # Zod schemas + inferred TS types
│   └── utils.ts                  # cn(), formatters
└── hooks/                        # tRPC query wrappers
```

## Data Model

### Drone
```
id: string ("D-01"..."D-08")
role: "coordinator" | "follower" | "relay"
status: "nominal" | "warning" | "critical" | "rtb" | "offline"
position: { lat: number, lng: number }
gridPos: { row: number, col: number }
battery: number (0-100)
heading: number (degrees)
```

### Mission
```
id: string
name: string
status: "active" | "paused" | "aborted" | "complete"
coverage: number (0-100)
formation: "grid" | "line" | "orbit"
formationIntegrity: number (0-100)
bounds: [lat, lng][]
eta: number (minutes)
baseId: string
```

### Alert
```
id: string
severity: "info" | "warning" | "critical"
title: string
detail: string
droneId?: string
timestamp: Date
```

### Command
```
id: string
type: "pause" | "resume" | "rtb" | "goto" | "orbit" | "abort"
target: "ALL" | string (drone ID)
state: "pending" | "executing" | "completed" | "failed"
timestamp: Date
```

### BaseStation
```
id: string
position: { lat: number, lng: number }
status: "online" | "offline"
uplinkLatency: number (ms)
```

## Simulation Engine

- Singleton `WorldState` initialized from seed data matching the mock
- `tick()` runs every 1 second:
  - Drones drift along scan lines (small position deltas)
  - Battery drains ~0.05%/tick
  - Coverage increases ~0.02%/tick
  - D-07 starts at 22% — triggers RTB alert and status change at 15%
- Commands mutate state immediately
- Pause stops the tick loop; abort sets mission to aborted

## tRPC API

| Endpoint | Type | Returns | Poll |
|---|---|---|---|
| `drones.list` | query | `Drone[]` | 2s |
| `drones.getById` | query | `Drone` | 2s |
| `missions.active` | query | `Mission` | 2s |
| `missions.pause` | mutation | `Mission` | — |
| `missions.resume` | mutation | `Mission` | — |
| `missions.abort` | mutation | `Mission` | — |
| `alerts.list` | query | `Alert[]` | 5s |
| `alerts.dismiss` | mutation | `void` | — |
| `commands.dispatch` | mutation | `Command` | — |
| `commands.log` | query | `Command[]` | 3s |

## UI Components

### Layout Shell (persistent across routes)
- **Topbar**: logo, org selector, nav links (`<Link>`), status pill, avatar
- **Sidebar**: section groups, active state from route, live badge counts

### Overview Page
- **StatsRow**: 5 cards (Drones Active, Coverage, Formation, Mesh Links, ETA)
- **BodyGrid**: MapPanel (left) + RightPanel (right)

### MapPanel
- react-leaflet, dark CSS filter on tiles
- MissionZone polygon, CoverageArea fill, DroneMarkers, MeshLinks, BaseMarker
- Map overlays: wind/alt/GPS chips, zoom controls, mission progress bar
- Click drone marker to select

### RightPanel (shadcn Tabs)
- **Fleet**: formation integrity, telemetry grid, drone list with selection
- **Alerts**: severity-colored items, dismiss action
- **Commands**: grid of command buttons, command log, abort with confirmation

## Interactions

- Drone selection syncs between list and map (React context)
- Commands dispatch via tRPC mutation, optimistic log update
- Abort requires confirmation dialog before executing
- Sidebar badges reflect live alert/drone counts
- Navigation between pages via App Router

## Design Tokens

Custom Tailwind theme mapped from mock CSS variables:
- `bg: #080808`, `surface: #0f0f0f`, `border: #1a1a1a`, `border2: #252525`
- `muted: #3a3a3a`, `subtle: #666`, `text: #e8e8e8`, `text-dim: #888`
- `green: #22c55e`, `amber: #f59e0b`, `red: #ef4444`, `blue: #3b82f6`
- Fonts: Geist Mono (monospace), DM Sans (sans)
