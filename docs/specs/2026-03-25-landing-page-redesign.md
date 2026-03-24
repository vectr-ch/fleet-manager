# Landing Page Redesign

**Date:** 2026-03-25
**Status:** Approved
**Prototype:** `prototype/index.html` (serves on any static HTTP server)

## Overview

Replace the current neon-cyberpunk landing page with a monochrome, scroll-driven experience that prioritizes brand impression over product marketing. The page targets future enterprise clients, investors, and talent — the goal is "remember the name," not hard conversion.

## Design Principles

- **Monochrome precision** — grayscale foundation. No accent colors. Cyberpunk lives in structure (grids, monospace type, geometric precision), not in neon.
- **Quiet confidence** — understated copy, no hype, no fake stats. Every word earns its place.
- **Scroll as narrative** — the page tells a two-act story driven by scroll position. The transition between acts is the signature moment.
- **Maintainability** — shadcn/ui components, proper component separation, reusable animation hooks. Production-grade React, not a one-off HTML prototype.

## Design Inspiration

Vercel x Cloudflare aesthetic with refined cyberpunk undercurrents. The restraint of Stripe's copy, the dark authority of Cloudflare's brand, the structural precision of Linear.

## Page Structure

### Section 1: Act 1 — The Void (Hero)

Full viewport. Nearly empty. Suspense.

**Elements:**
- Faint background grid (80px cells, ~2% white opacity)
- Subtle horizontal accent line at 50% height
- Eyebrow: `AUTONOMOUS FLEET INFRASTRUCTURE` (monospace, 11px, tracked wide, muted)
- Title: `VECTR` (Inter thin/100, ~13vw clamped 72–140px, letter-spacing 20px)
- Scroll hint at bottom: `Scroll` label + pulsing vertical line

**Behavior:**
- Static on load. No animations until user scrolls.
- All elements participate in the scroll-driven exit (see Transition below).

### Section 2: Scroll Transition (Act 1 → Act 2)

The signature interaction. Scroll input drives a choreographed transition where the user feels stationary while the world rearranges around them (Apple-style scroll-lock effect). This is the most important part of the page — see `prototype/index.html` as the definitive reference.

**Architecture:**
- A `scroll-runway` div (height: 400vh) provides scrollable height.
- A `viewport` div (position: fixed, inset: 0, overflow: hidden) contains all visual layers.
- Act 1 sits at **z-index: 10** (on top), Act 2 at **z-index: 5** (behind), Act 3 at **z-index: 3** (behind both). Act 1 starts fully opaque and covers Act 2. As it fades out on scroll, Act 2 is revealed underneath.
- All animation is driven by `requestAnimationFrame` reading `window.scrollY`.

**Scroll map** (values are fractions of viewport height, e.g. 0.2 = 20% of vh):
| Scroll Range | Event | Easing |
|---|---|---|
| 0 → 0.2 | **Act 1 exits:** grid/line fade to 0. Title translates up by `eased * 70%vh` (nonlinear acceleration via easeOutCubic — feels like 3-4x scroll speed). Tag fades at 4x rate, scroll hint at 6x. | easeOutCubic |
| 0.05 → 0.55 | **Act 2 lines trace in** (see Line Behavior below). Noise fades to 35% opacity, glow orb fades in. | easeInOutCubic |
| 0.12 → 0.34 | Statement text fades up with 30px translateY | easeOutCubic |
| 0.22 → 0.37 | "We're building it." fades up with 16px translateY | easeOutCubic |
| 0.32 → 0.42 | Divider line scales in from left (scaleX 0→1) | easeOutCubic |
| 0.36 → 0.46 | Stack keywords fade up with 10px translateY | easeOutCubic |
| 0.35 | Fixed nav fades in (CSS transition, 0.4s) | — |
| 0.8 → 1.05 | Act 3 fades in (opacity 0→1) | linear |
| >1.5 | Transition complete: Act 3 translates up with scroll (normal scrolling resumes) | — |

**Critical constraints:**
- Act 2 begins entering at 0.05 — BEFORE Act 1 finishes exiting at 0.2. This overlap eliminates dead space.
- **Act 2 container must NOT have an opacity fade.** The topo lines are revealed via `stroke-dashoffset`, which requires the SVG to be rendered at full opacity. A container-level opacity fade would mask the trace effect and make lines appear to fade in instead of draw. Noise, glow, and text have their own individual opacity controls.

### Section 3: Act 2 — The Signal

The statement moment. Topographic lines create atmosphere while the copy delivers the mission.

**Topographic lines:**

7 SVG paths inside a `viewBox="0 0 1400 900"` with `preserveAspectRatio="xMidYMid slice"`. Lines are centered vertically (yCenter = 450), spaced ~55px apart. Each path extends from x=1700 to x=-300 (offscreen both sides to prevent visible endpoints). Stroke: `rgba(255,255,255,0.045)`, width 0.8, round linecap.

**Per-line configuration** (each line has unique wave character so they never sync):
- `amplitude`: 20–60px (varies via `40 + sin(i * 1.2) * 20`)
- `frequency`: 0.003–0.005 (varies via `0.003 + i * 0.0003`)
- `phaseOffset`: staggered via `i * 1.1`
- `speed`: 0.4–0.58 (varies via `0.4 + i * 0.03`)

**Path generation:** Each path is built from 80 sample points. For each point: `y = yBase + amplitude * sin(x * frequency + phaseOffset + time * speed)`. Points are connected via Catmull-Rom-to-cubic-bezier conversion (tension 0.3) for smooth curves. Paths are built right-to-left (x goes from xMax to xMin) so that `stroke-dashoffset` traces from the right edge.

**Line behavior has two distinct phases — this separation is critical:**

1. **Tracing phase** (`lineEased < 1`): Path geometry is **static** (the initial wave shape at time=0). Only `stroke-dashoffset` animates, creating the drawing-along-the-path effect. Each line is staggered by `i * 0.06` in enter progress, and the trace completes over 85% of the remaining progress. `stroke-dasharray` is set to the path's total length; `stroke-dashoffset` goes from full length (hidden) to 0 (fully drawn).

2. **Living phase** (`lineEased >= 1`): `stroke-dasharray` is removed (`'none'`). Path geometry now updates every frame via `requestAnimationFrame` — the `time` parameter in the wave function increments continuously, causing wave peaks to physically travel along each line like ocean swells. This runs independently of scroll.

**Why the separation matters:** If you rebuild path geometry during the trace phase, the changing path length desynchronizes with the dasharray/dashoffset values, and the trace effect breaks — lines appear to fade in instead of draw. We hit this bug during prototyping. The fix: keep geometry frozen during trace, switch to dynamic geometry only after fully drawn.

**Noise texture:** Fractal noise SVG filter at ~35% opacity. Fades in with Act 2.

**Glow orb:** Radial gradient (white, 2% opacity), top-right. Subtle depth cue.

**Copy:**
- Statement: *"Autonomous fleets need infrastructure that doesn't exist yet."* (Inter 200, ~4.5vw clamped 30–50px)
- Follow: *"We're building it."* (Inter, ~2vw clamped 17–22px, muted gray)
- Divider: 32px horizontal line, dark gray
- Stack: `MESH · EDGE · TELEMETRY · FLEET` (monospace, 10px, tracked wide, very muted)

**Fixed nav** (appears at 0.35vh scroll):
- Left: `VECTR` (14px, 500 weight, letter-spacing 5px)
- Right: `EST. 2026 · ZÜRICH` (10px, monospace, very muted)

### Section 4: Capabilities

Four cards showing what VECTR unlocks. Outcome-focused, not technology-focused.

**Cards:**

1. **Operates Without Connectivity** — Full autonomous operation at the edge. No cloud dependency, no single point of failure.
2. **Self-Healing Mesh** — Decentralized network that routes around failures. If a node drops, the fleet adapts.
3. **Real-Time Awareness** — Live telemetry from every node in the fleet. Observe, command, and react in real-time.
4. **Zero-Trust Security** — mTLS from device to cloud. Every connection authenticated, every payload encrypted.

**Card design:**
- Monospace eyebrow label (capability name)
- Body text (one sentence, muted gray)
- Subtle border (1px, ~4% white opacity)
- **Mouse-proximity border glow:** Radial gradient follows cursor position relative to each card. Border partially illuminates near the mouse. Effect radius ~150px. Implementation: track `mousemove` on the card grid, calculate distance from cursor to each card edge, apply a CSS `background` gradient on a pseudo-element or border-image positioned at the cursor.
- Grid layout: `repeat(auto-fit, minmax(200px, 1fr))` with 32px gap

### Section 5: The Why (Mission)

Short, punchy block. No visual gimmicks.

**Content:**
- Eyebrow: `WHY`
- Heading: *"The infrastructure gap"* (or similar — exact copy TBD)
- Body: Framing around category creation. Autonomous drone fleets will reshape industries, but the infrastructure to coordinate them — real mesh networking, edge-first compute, swarm-level control — doesn't exist yet. That's what VECTR is building.
- Key angles: mesh/swarm control as a specific gap, building a new category (not fixing a broken one), the connected-world assumption as the core problem.

**Design:** Same section treatment as tech grid — eyebrow + heading + paragraph, left-aligned, max-width ~520px.

### Section 6: Stay in the Loop

Quiet email capture. Non-prominent, non-urgent.

**Content:**
- Eyebrow: `STAY IN THE LOOP`
- Body: *"We're early. If this resonates, leave your email — we'll reach out when there's something to show."*
- Form: email input + submit button
- No success theatrics — simple confirmation text on submit

**Design:** Same section padding. Input and button in monochrome (dark background, subtle border, muted text). Hover state brightens border slightly.

### Section 7: Footer

Minimal.

- Left: `VECTR` + `info@vectr.ch`
- Right: `© 2026`
- Single row, subtle top border (1px, ~3% white opacity)
- No link columns (no pages to link to yet)
- No legal entity suffix (pending GmbH vs AG decision)

## Technical Requirements

### Stack
- **Framework:** Next.js (existing project, v16)
- **Components:** shadcn/ui where applicable (buttons, inputs, form components)
- **Styling:** Tailwind CSS 4 (existing setup) + CSS custom properties for design tokens
- **Animation:** Vanilla JS with `requestAnimationFrame` for scroll-driven effects. CSS transitions for simpler state changes. No heavy animation libraries needed.
- **SVG:** Inline SVG for topographic lines (generated via JS for dasharray control)

### Code Architecture

```
src/
  components/
    landing/
      landing-page.tsx          # Page orchestrator
      hero-section.tsx           # Act 1 (The Void)
      signal-section.tsx         # Act 2 (The Signal) + topo lines
      capabilities-section.tsx   # Cards with border glow
      mission-section.tsx        # The Why
      cta-section.tsx            # Stay in the loop
      footer.tsx                 # Minimal footer
      topo-lines.tsx             # SVG line generation + wave animation
      scroll-controller.tsx      # Scroll position tracking + progress calculations
      border-glow-card.tsx       # Reusable card with proximity glow effect
  hooks/
    use-scroll-progress.ts       # Custom hook: scroll position → normalized progress
    use-mouse-proximity.ts       # Custom hook: mouse position relative to element
  lib/
    easing.ts                    # Easing functions (easeOutCubic, easeInOutCubic)
```

**Key decisions:**
- Scroll logic lives in a custom hook (`useScrollProgress`) that returns normalized progress values. Components subscribe to the progress they care about.
- Topo lines are their own component managing SVG generation and `requestAnimationFrame` for the traveling wave.
- Border glow is a reusable component (`BorderGlowCard`) wrapping shadcn `Card`.
- Each section is a standalone component with no cross-dependencies.
- Design tokens (colors, spacing) via CSS custom properties in `globals.css`, prefixed `--lp-` (existing convention).
- Scroll-driven components (`hero-section`, `signal-section`, `scroll-controller`, `topo-lines`) require `"use client"` directive since they use `useEffect`, `useRef`, `requestAnimationFrame`, and `window.scrollY`.

**Note on prototype divergence:** The `prototype/index.html` Capabilities section shows tech-stack cards (VectRNet, Edge Compute, etc.) — this is **outdated placeholder content**. The spec's outcome-focused cards (Section 4) are canonical. Similarly, the prototype's "Why" section copy and footer content are placeholders — follow the spec.

### Performance
- All scroll handlers use `requestAnimationFrame` with ticking guard (no redundant frames)
- Passive scroll listeners
- SVG path recalculation only runs when lines are visible
- `will-change: transform, opacity` on animated elements
- Wave animation stops when offscreen

### Routing
- Landing page lives at `/(marketing)/page.tsx` (existing route)
- No new routes needed
- Dashboard routes are untouched

### What Gets Removed
- All existing landing page components (`cyber-background.tsx`, `drone-visual.tsx`, `glow-cursor.tsx`, `network-section.tsx`, `command-section.tsx`, `features-section.tsx`, `navbar.tsx`)
- All `--lp-neon-*` CSS variables and associated glow utilities
- Fake stats, military language, ITAR claims
- Multi-color design tokens (replaced with grayscale)

### What Gets Preserved
- Existing `(marketing)` route structure
- `globals.css` file (updated, not replaced)
- Fonts: keep Inter; Orbitron/Rajdhani can be removed (also remove from Google Fonts link in `layout.tsx`)
- shadcn/ui setup and configuration
- Update `layout.tsx` metadata (title/description) to match new copy style — remove "AI-powered" and similar forbidden terms

## Copy Style Guide

- No exclamation marks
- No superlatives ("best", "revolutionary", "game-changing")
- No fake metrics or social proof
- Technical terms used precisely, not as marketing
- Short sentences. Active voice. Present tense for what exists, future tense only when honest.
- Okay to use: "mesh", "edge", "swarm", "telemetry", "mTLS", "GPS-denied" — these are real, specific terms
- Not okay: "military-grade", "enterprise-ready", "AI-powered", "next-generation"

## Out of Scope

- Dashboard/authenticated routes (completely untouched)
- Blog, about, careers, or other marketing pages
- Email submission backend (form is frontend-only for now)
- Mobile-specific interactions (responsive layout yes, mobile-only features no)
- Analytics/tracking integration
