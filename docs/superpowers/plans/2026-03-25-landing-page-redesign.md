# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the neon-cyberpunk landing page with a monochrome, scroll-driven brand impression page featuring a two-act hero transition with topographic line animations.

**Architecture:** Fixed viewport with scroll-runway pattern for the hero transition (Acts 1-2), then normal scrolling for remaining sections. All scroll animation via `requestAnimationFrame` reading `window.scrollY`, coordinated through a custom `useScrollProgress` hook. Each section is a standalone React component.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, TypeScript

**Spec:** `docs/specs/2026-03-25-landing-page-redesign.md`
**Prototype:** `prototype/index.html` (the definitive reference for scroll behavior)

**Architecture note:** The spec lists `scroll-controller.tsx` in its file map. This plan intentionally replaces that with the `useScrollProgress` hook pattern — scroll position is managed in `landing-page.tsx` and passed to sections via props. This is simpler and avoids an unnecessary wrapper component.

---

## File Map

```
Modified:
  src/app/globals.css                          -- Replace neon tokens + animations with monochrome, fix body overflow
  src/app/layout.tsx                           -- Add Inter font, remove Orbitron/Rajdhani, update metadata
  src/components/landing/landing-page.tsx       -- New orchestrator composing new sections (named export)

Created:
  src/lib/easing.ts                            -- Easing functions (easeOutCubic, easeInOutCubic)
  src/hooks/use-scroll-progress.ts             -- Scroll position → normalized progress values
  src/hooks/use-mouse-proximity.ts             -- Mouse position relative to element for border glow
  src/components/landing/scroll-viewport.tsx    -- Scroll runway + fixed viewport wrapper
  src/components/landing/signal-section.tsx     -- Act 2: The Signal (statement, topo lines, copy)
  src/components/landing/topo-lines.tsx         -- SVG line generation, trace-in, traveling wave
  src/components/landing/capabilities-section.tsx -- 4 outcome cards with border glow
  src/components/landing/border-glow-card.tsx   -- Reusable card with mouse-proximity border effect
  src/components/landing/mission-section.tsx    -- The Why section
  src/components/landing/fixed-nav.tsx          -- Fixed nav (VECTR + EST. 2026 · ZÜRICH)

Replaced (files exist but will be fully rewritten):
  src/components/landing/hero-section.tsx       -- Act 1: The Void (replaces old neon hero)
  src/components/landing/cta-section.tsx        -- Stay in the loop (replaces old neon CTA)
  src/components/landing/footer.tsx             -- Minimal footer (replaces old neon footer)

Deleted:
  src/components/landing/cyber-background.tsx
  src/components/landing/drone-visual.tsx
  src/components/landing/glow-cursor.tsx
  src/components/landing/network-section.tsx
  src/components/landing/command-section.tsx
  src/components/landing/features-section.tsx
  src/components/landing/navbar.tsx
```

---

### Task 1: Foundation — Easing utilities and scroll hook

**Files:**
- Create: `src/lib/easing.ts`
- Create: `src/hooks/use-scroll-progress.ts`

- [ ] **Step 1: Create easing functions**

Create `src/lib/easing.ts`:

```typescript
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
```

- [ ] **Step 2: Create scroll progress hook**

Create `src/hooks/use-scroll-progress.ts`. This hook tracks `window.scrollY` via `requestAnimationFrame` with a ticking guard and returns the raw scroll position. Components compute their own progress ranges from it.

```typescript
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function useScrollProgress() {
  const [scrollY, setScrollY] = useState(0);
  const ticking = useRef(false);

  const onScroll = useCallback(() => {
    if (!ticking.current) {
      ticking.current = true;
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking.current = false;
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return scrollY;
}

/** Compute normalized progress (0-1) for a scroll range */
export function progress(scrollY: number, start: number, end: number): number {
  return Math.max(0, Math.min(1, (scrollY - start) / (end - start)));
}
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/xmedavid/dev/vectr/front && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds (new files are not imported yet, so no errors)

- [ ] **Step 4: Commit**

```bash
git add src/lib/easing.ts src/hooks/use-scroll-progress.ts
git commit -m "feat(landing): add easing utilities and scroll progress hook"
```

---

### Task 2: Update globals.css — Replace neon tokens with monochrome

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace landing page CSS custom properties**

In `globals.css`, find the `.landing-page` block with all `--lp-neon-*` variables, `--lp-bg-*`, `--lp-text-*`, `--lp-gradient-*`, `--lp-font-*` variables. Replace the entire block with monochrome tokens:

```css
.landing-page {
  /* Backgrounds */
  --lp-bg-primary: #09090b;
  --lp-bg-secondary: #18181b;
  --lp-bg-tertiary: #27272a;

  /* Text */
  --lp-text-primary: #fafafa;
  --lp-text-secondary: #a1a1aa;
  --lp-text-muted: #52525b;
  --lp-text-faint: #3f3f46;

  /* Borders */
  --lp-border: rgba(255, 255, 255, 0.04);
  --lp-border-subtle: rgba(255, 255, 255, 0.03);

  /* Fonts */
  --lp-font-body: "Inter", system-ui, -apple-system, sans-serif;
  --lp-font-mono: ui-monospace, "SF Mono", "Fira Code", monospace;
}
```

- [ ] **Step 2: Remove neon tokens from @theme block**

In `globals.css` lines 64-80, the `@theme` block defines `--color-lp-neon-*`, `--color-lp-bg-*`, `--color-lp-text-*`, `--font-display` (Orbitron), and `--font-body` (Rajdhani). Remove all of these entries. These are Tailwind theme extensions that make neon colors available as utility classes — they must go.

- [ ] **Step 3: Fix body overflow for landing page**

The global `body` rule at line 156-162 of `globals.css` has `overflow: hidden; height: 100vh;`. This is needed for the dashboard but **will completely prevent scrolling on the landing page**. The entire scroll-runway pattern depends on `window.scrollY` changing.

Add an override in the `.landing-page` block (which wraps the marketing route via `(marketing)/layout.tsx`):

```css
.landing-page {
  /* ... existing monochrome tokens ... */
}

/* Override dashboard body styles for landing page scrolling */
.landing-page body,
body:has(.landing-page) {
  overflow-y: auto;
  height: auto;
}
```

If the `:has()` selector causes issues, alternatively scope it via the marketing layout: add `overflow-y: auto; height: auto;` as inline styles on the `.landing-page` wrapper div, and ensure the body override is applied.

**This is load-bearing for the entire scroll interaction. Verify scrolling works before proceeding.**

- [ ] **Step 4: Remove all neon utility classes and old animations**

Delete all `.lp-gradient-text`, `.lp-btn-clip`, `.lp-card-clip`, `.lp-neon-*-glow`, `.lp-neon-*-border`, `.lp-section`, `.lp-animate-*` classes. Delete all `@keyframes lp-*` animations (lp-grid-move, lp-scan-line, lp-rotate-ring, lp-glitch, lp-float, lp-particle-float, lp-pulse, lp-gradient-shift, lp-blink, lp-node-pulse, lp-spin-rotor, lp-shake, lp-fade-in-up).

Add only the one animation we need:

```css
@keyframes lp-pulse-line {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.9; }
}
```

- [ ] **Step 5: Verify build**

Run: `cd /Users/xmedavid/dev/vectr/front && npx next build --no-lint 2>&1 | tail -10`
Expected: Build will have errors because existing components reference removed tokens. This is expected — we'll delete those components in the next task.

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(landing): replace neon design tokens with monochrome palette"
```

---

### Task 3: Delete old components and update layout

**Files:**
- Delete: `src/components/landing/cyber-background.tsx`
- Delete: `src/components/landing/drone-visual.tsx`
- Delete: `src/components/landing/glow-cursor.tsx`
- Delete: `src/components/landing/network-section.tsx`
- Delete: `src/components/landing/command-section.tsx`
- Delete: `src/components/landing/features-section.tsx`
- Delete: `src/components/landing/navbar.tsx`
- Delete: `src/components/landing/hero-section.tsx` (old neon version — will be recreated in Task 5)
- Delete: `src/components/landing/cta-section.tsx` (old neon version — will be recreated in Task 10)
- Delete: `src/components/landing/footer.tsx` (old neon version — will be recreated in Task 10)
- Modify: `src/app/layout.tsx`
- Modify: `src/components/landing/landing-page.tsx` (temporary minimal version)

- [ ] **Step 1: Delete old landing components**

Delete all 10 component files listed above. This removes every old neon landing component. `landing-page.tsx` is kept but will be rewritten.

- [ ] **Step 2: Update root layout — remove unused fonts, update metadata**

In `src/app/layout.tsx`:
- **Add** `Inter:wght@100;200;300;400;500` to the Google Fonts URL. The entire design depends on Inter thin (100) and light (200) weights.
- **Remove** Orbitron and Rajdhani from the Google Fonts URL (they are only used by old landing components).
- Keep Geist Mono and DM Sans.
- Update the metadata title to `"VECTR"` and description to `"Autonomous fleet infrastructure"`. Remove any mention of "AI-powered" or marketing language.

- [ ] **Step 3: Create minimal landing-page.tsx placeholder**

Replace `src/components/landing/landing-page.tsx` with a minimal placeholder so the app builds. **Use a named export** — `page.tsx` imports with `{ LandingPage }`:

```tsx
export function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#09090b", color: "#fafafa" }}>
      <p style={{ padding: "40px", color: "#52525b" }}>Landing page redesign in progress</p>
    </div>
  );
}
```

- [ ] **Step 4: Verify clean build**

Run: `cd /Users/xmedavid/dev/vectr/front && npx next build --no-lint 2>&1 | tail -10`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add -A src/components/landing/ src/app/layout.tsx src/app/\(marketing\)/page.tsx
git commit -m "refactor(landing): remove old neon components, clean up fonts and metadata"
```

---

### Task 4: Scroll viewport wrapper and fixed nav

**Files:**
- Create: `src/components/landing/scroll-viewport.tsx`
- Create: `src/components/landing/fixed-nav.tsx`

- [ ] **Step 1: Create scroll viewport wrapper**

Create `src/components/landing/scroll-viewport.tsx`. This provides the scroll-runway + fixed viewport pattern. Children are rendered inside the fixed viewport. The runway height is configurable.

```tsx
"use client";

interface ScrollViewportProps {
  runwayHeight?: string; // e.g. "400vh"
  children: React.ReactNode;
}

export function ScrollViewport({ runwayHeight = "400vh", children }: ScrollViewportProps) {
  return (
    <div style={{ height: runwayHeight, position: "relative" }}>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create fixed nav component**

Create `src/components/landing/fixed-nav.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useScrollProgress } from "@/hooks/use-scroll-progress";

export function FixedNav() {
  const scrollY = useScrollProgress();
  const [vh, setVh] = useState(800); // safe SSR default

  useEffect(() => {
    setVh(window.innerHeight);
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const visible = scrollY > vh * 0.35;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center transition-opacity duration-400"
      style={{
        padding: "24px 40px",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <span
        className="text-sm font-medium"
        style={{ color: "#e4e4e7", letterSpacing: "5px" }}
      >
        VECTR
      </span>
      <span
        style={{
          fontSize: "10px",
          color: "var(--lp-text-faint)",
          letterSpacing: "3px",
          fontFamily: "var(--lp-font-mono)",
        }}
      >
        EST. 2026 · ZÜRICH
      </span>
    </nav>
  );
}
```

**SSR note:** `vh` defaults to 800 during server render, then updates on mount via `useEffect`. This avoids hydration mismatches. The same pattern (useState default + useEffect to read window) should be used in any component that reads `window.innerHeight`.

- [ ] **Step 3: Verify build**

Run: `cd /Users/xmedavid/dev/vectr/front && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/scroll-viewport.tsx src/components/landing/fixed-nav.tsx
git commit -m "feat(landing): add scroll viewport wrapper and fixed nav"
```

---

### Task 5: Act 1 — The Void (hero section)

**Files:**
- Create: `src/components/landing/hero-section.tsx`

- [ ] **Step 1: Create hero section**

Create `src/components/landing/hero-section.tsx`. This is Act 1 — the VECTR title against the void.

The component receives `scrollY` as a prop (from the parent orchestrator) and computes its own exit animations. See spec Section 1 and prototype lines 242-253 (HTML) + 453-465 (JS) for exact behavior.

Key elements:
- `.void-grid`: CSS background-image with 80px grid lines at ~1.8% white opacity
- `.void-line`: Horizontal gradient line at 50% height
- Eyebrow: `AUTONOMOUS FLEET INFRASTRUCTURE` (monospace, 11px, letter-spacing 8px, `--lp-text-faint`)
- Title: `VECTR` (Inter 100 weight, clamp(72px, 13vw, 140px), letter-spacing 20px)
- Scroll hint: `Scroll` label + pulsing 1px vertical line (use `lp-pulse-line` animation)

**Scroll behavior** (all computed from `scrollY` prop):
- Exit zone: `0 → 0.2 * vh`
- Grid + horizontal line: opacity `1 - easeOutCubic(exitProgress)`
- Title: translateY `-(eased * 0.7 * vh)px`, opacity `max(0, 1 - exitProgress * 2.5)`
- Tag: opacity `max(0, 1 - exitProgress * 4)`
- Scroll hint: opacity `max(0, 1 - exitProgress * 6)`

Position: `absolute, inset: 0, z-index: 10`.

**Performance:** Apply `will-change: transform, opacity` to the title, tag, grid, and void-line elements since they animate every frame during scroll. Also apply it to the signal section's statement, follow, divider, and stack elements. This hints the browser to promote them to compositor layers.

- [ ] **Step 2: Wire into landing page temporarily for visual testing**

Update `src/components/landing/landing-page.tsx` to import `ScrollViewport`, `HeroSection`, `FixedNav`, and `useScrollProgress`. Render them together:

```tsx
"use client";

import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { ScrollViewport } from "./scroll-viewport";
import { HeroSection } from "./hero-section";
import { FixedNav } from "./fixed-nav";

export function LandingPage() {
  const scrollY = useScrollProgress();

  return (
    <div style={{ background: "var(--lp-bg-primary)" }}>
      <FixedNav />
      <ScrollViewport>
        <HeroSection scrollY={scrollY} />
      </ScrollViewport>
    </div>
  );
}
```

- [ ] **Step 3: Test in browser**

Run: `cd /Users/xmedavid/dev/vectr/front && npm run dev`
Open http://localhost:3000. Verify:
- VECTR title centered on black background with faint grid
- Scroll hint pulsing at bottom
- On scroll: title rockets upward and fades, grid fades, tag vanishes quickly

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/hero-section.tsx src/components/landing/landing-page.tsx
git commit -m "feat(landing): implement Act 1 hero section with scroll-driven exit"
```

---

### Task 6: Topographic lines component

**Files:**
- Create: `src/components/landing/topo-lines.tsx`

This is the most complex component. Follow the prototype (`prototype/index.html` lines 329-496) as the definitive reference.

- [ ] **Step 1: Create topo-lines component**

Create `src/components/landing/topo-lines.tsx`. This component:
1. Generates 7 SVG paths on mount (via `useRef` + `useEffect`)
2. Measures each path's total length for dasharray
3. Exposes an `update(enterProgress: number, waveTime: number)` method called by the parent's animation frame

**SVG setup:**
- `viewBox="0 0 1400 900"`, `preserveAspectRatio="xMidYMid slice"`
- Paths: stroke `rgba(255,255,255,0.045)`, width 0.8, fill none, linecap round

**Line config** (7 lines, centered at yCenter=450, spacing=55):
- `amplitude`: `40 + sin(i * 1.2) * 20` (range: 20-60px)
- `frequency`: `0.003 + i * 0.0003`
- `phaseOffset`: `i * 1.1`
- `speed`: `0.4 + i * 0.03`

**Path generation** — full TypeScript implementation (translated from prototype lines 375-408):

```typescript
interface LineConfig {
  yBase: number;
  amplitude: number;
  frequency: number;
  phaseOffset: number;
  speed: number;
}

const SAMPLE_COUNT = 80;
const X_MIN = -300;
const X_MAX = 1700;

function buildWavePath(cfg: LineConfig, time: number): string {
  // Sample points along the wave (right to left for stroke-dashoffset trace direction)
  const points: { x: number; y: number }[] = [];
  for (let s = 0; s <= SAMPLE_COUNT; s++) {
    const t = s / SAMPLE_COUNT;
    const x = X_MAX - t * (X_MAX - X_MIN); // 1700 → -300
    const y = cfg.yBase + cfg.amplitude * Math.sin(
      x * cfg.frequency + cfg.phaseOffset + time * cfg.speed
    );
    points.push({ x, y });
  }

  // Build SVG path: Catmull-Rom to cubic bezier conversion (tension 0.3)
  let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  const tension = 0.3;

  for (let j = 1; j < points.length - 1; j++) {
    const prev = points[j - 1];
    const curr = points[j];
    const next = points[j + 1];
    const cp1x = curr.x - (next.x - prev.x) * tension;
    const cp1y = curr.y - (next.y - prev.y) * tension;

    if (j === 1) {
      // First segment uses full cubic bezier (C command)
      d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${curr.x.toFixed(1)},${curr.y.toFixed(1)}`;
    } else {
      // Subsequent segments use smooth cubic bezier (S command)
      d += ` S${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${curr.x.toFixed(1)},${curr.y.toFixed(1)}`;
    }
  }

  const last = points[points.length - 1];
  d += ` L${last.x.toFixed(1)},${last.y.toFixed(1)}`;
  return d;
}
```

**Two-phase behavior (CRITICAL):**
- `lineEased < 1`: TRACING — static path (time=0), animate `strokeDashoffset` only. `dasharray = totalLength`, `dashoffset = totalLength * (1 - lineEased)`.
- `lineEased >= 1`: LIVING — remove dasharray (`'none'`), rebuild path with current `waveTime` every frame.

Stagger per line: `delay = i * 0.06`, progress over `0.85` of remaining range.

The component should use `useRef` for the SVG group element and path elements, and `useImperativeHandle` or a callback ref pattern to let the parent drive updates.

- [ ] **Step 2: Verify the component renders an empty SVG without errors**

Import into landing-page.tsx temporarily, render inside the viewport. Check browser — should see nothing (lines start hidden via dashoffset), no console errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/topo-lines.tsx
git commit -m "feat(landing): add topographic lines component with trace and wave animation"
```

---

### Task 7: Act 2 — The Signal (signal section)

**Files:**
- Create: `src/components/landing/signal-section.tsx`

- [ ] **Step 1: Create signal section**

Create `src/components/landing/signal-section.tsx`. This is Act 2 — the statement with topographic lines. Position: `absolute, inset: 0, z-index: 5`.

Contains:
- `<TopoLines>` component (from Task 6)
- Noise layer: div with fractal noise SVG background, opacity controlled by `enterEased * 0.35`
- Glow orb: radial gradient div (top 25%, right 8%, 500x500px, white 2% opacity)
- Statement: *"Autonomous fleets need infrastructure that doesn't exist yet."*
- Follow: *"We're building it."*
- Divider: 32px line, scaleX animation
- Stack: `MESH · EDGE · TELEMETRY · FLEET`

**This component owns the animation frame loop.** It receives `scrollY` as prop, computes `enterProgress` (0.05-0.55 vh range), and drives:
1. TopoLines trace/wave via a ref callback
2. Noise/glow opacity
3. Text reveal (statement at 0.12-0.34, follow at 0.22-0.37, divider at 0.32-0.42, stack at 0.36-0.46)

The traveling wave requires a persistent `requestAnimationFrame` loop that runs independently of scroll once lines are visible. Use a `useEffect` that starts the loop when `enterProgress > 0` and cleans up on unmount.

**IMPORTANT:** Do NOT apply opacity to this component's container div. The topo lines must be at full opacity for stroke-dashoffset to work. Each child element controls its own opacity independently.

See prototype lines 467-524 for the exact scroll-to-style mapping.

- [ ] **Step 2: Wire into landing page**

Update `landing-page.tsx` to render both HeroSection and SignalSection inside the ScrollViewport:

```tsx
<ScrollViewport>
  <HeroSection scrollY={scrollY} />
  <SignalSection scrollY={scrollY} />
</ScrollViewport>
```

- [ ] **Step 3: Test in browser**

Open http://localhost:3000. Verify the full Act 1 → Act 2 transition:
- VECTR title exits upward fast
- Topo lines trace in from right, staggered
- Statement text fades up
- After full trace, lines start traveling wave
- No dead space between acts
- Compare against `prototype/index.html` served at localhost:3737

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/signal-section.tsx src/components/landing/landing-page.tsx
git commit -m "feat(landing): implement Act 2 signal section with scroll transition"
```

---

### Task 8: Mouse proximity hook and border glow card

**Files:**
- Create: `src/hooks/use-mouse-proximity.ts`
- Create: `src/components/landing/border-glow-card.tsx`

- [ ] **Step 1: Create mouse proximity hook**

Create `src/hooks/use-mouse-proximity.ts`:

```typescript
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface MousePosition {
  x: number;
  y: number;
  isNear: boolean;
}

export function useMouseProximity(radius: number = 150) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0, isNear: false });

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const isNear = x >= -radius && x <= rect.width + radius
                && y >= -radius && y <= rect.height + radius;
    setPosition({ x, y, isNear });
  }, [radius]);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

  return { ref, ...position };
}
```

- [ ] **Step 2: Create border glow card**

Create `src/components/landing/border-glow-card.tsx`. This wraps content in a card that has a radial border glow following the mouse position. Implementation: a container div with `position: relative` and `overflow: hidden`. A pseudo-element (or an extra div) with a radial gradient positioned at the mouse coordinates creates the border glow effect. The border itself is the card's default subtle border that "lights up" near the cursor.

The card should accept `children` and render with the monochrome card style (1px border at `--lp-border` opacity, padding 24px).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-mouse-proximity.ts src/components/landing/border-glow-card.tsx
git commit -m "feat(landing): add mouse proximity hook and border glow card"
```

---

### Task 9: Capabilities section

**Files:**
- Create: `src/components/landing/capabilities-section.tsx`

- [ ] **Step 1: Create capabilities section**

Create `src/components/landing/capabilities-section.tsx`. Four outcome-focused cards using `BorderGlowCard`:

1. **Operates Without Connectivity** — Full autonomous operation at the edge. No cloud dependency, no single point of failure.
2. **Self-Healing Mesh** — Decentralized network that routes around failures. If a node drops, the fleet adapts.
3. **Real-Time Awareness** — Live telemetry from every node in the fleet. Observe, command, and react in real-time.
4. **Zero-Trust Security** — mTLS from device to cloud. Every connection authenticated, every payload encrypted.

Layout: CSS grid `repeat(auto-fit, minmax(200px, 1fr))` with 32px gap.
Each card: monospace eyebrow label (11px, `--lp-text-secondary`, letter-spacing 2px), body text (13px, `--lp-text-faint`, line-height 1.6).
Section wrapper: padding `120px clamp(40px, 10vw, 140px)`, top border `--lp-border-subtle`.

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/capabilities-section.tsx
git commit -m "feat(landing): add capabilities section with border glow cards"
```

---

### Task 10: Mission, CTA, and Footer sections

**Files:**
- Create: `src/components/landing/mission-section.tsx`
- Create: `src/components/landing/cta-section.tsx`
- Create: `src/components/landing/footer.tsx`

- [ ] **Step 1: Create mission section**

Create `src/components/landing/mission-section.tsx`. Simple section:
- Eyebrow: `WHY` (monospace, 10px, `--lp-text-faint`, letter-spacing 4px)
- Heading: *"The infrastructure gap"* (28px, weight 300, `--lp-text-secondary`)
- Body: Copy about category creation — autonomous drone fleets will reshape industries, but the infrastructure to coordinate them (real mesh networking, edge-first compute, swarm-level control) doesn't exist yet. That's what VECTR is building.
- Left-aligned, max-width 520px.

- [ ] **Step 2: Create CTA section**

Create `src/components/landing/cta-section.tsx`:
- Eyebrow: `STAY IN THE LOOP`
- Body: *"We're early. If this resonates, leave your email — we'll reach out when there's something to show."*
- Form: email input (shadcn `Input` component) + submit button (shadcn `Button` variant outline)
- Style inputs to match monochrome: dark bg (`rgba(255,255,255,0.03)`), subtle border (`--lp-bg-tertiary`), muted placeholder
- Basic email validation, simple "Thanks" confirmation on submit
- No backend — just local state for now

- [ ] **Step 3: Create footer**

Create `src/components/landing/footer.tsx`:
- Left: `VECTR` (12px, `--lp-bg-tertiary` color, letter-spacing 1px) + `info@vectr.ch`
- Right: `© 2026`
- Single flex row, subtle top border
- No legal entity suffix, no link columns

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/mission-section.tsx src/components/landing/cta-section.tsx src/components/landing/footer.tsx
git commit -m "feat(landing): add mission, CTA, and footer sections"
```

---

### Task 11: Assemble the full page

**Files:**
- Modify: `src/components/landing/landing-page.tsx`

- [ ] **Step 1: Update the landing page orchestrator**

Replace the landing-page.tsx with the final orchestrator that composes all sections. Structure:

```tsx
"use client";

import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { ScrollViewport } from "./scroll-viewport";
import { FixedNav } from "./fixed-nav";
import { HeroSection } from "./hero-section";
import { SignalSection } from "./signal-section";
import { CapabilitiesSection } from "./capabilities-section";
import { MissionSection } from "./mission-section";
import { CtaSection } from "./cta-section";
import { Footer } from "./footer";

export function LandingPage() {
  const scrollY = useScrollProgress();

  return (
    <div style={{ background: "var(--lp-bg-primary)", color: "var(--lp-text-primary)" }}>
      <FixedNav />
      <ScrollViewport>
        {/* Act 1: The Void — z-index 10 */}
        <HeroSection scrollY={scrollY} />

        {/* Act 2: The Signal — z-index 5 */}
        <SignalSection scrollY={scrollY} />

        {/* Act 3: Remaining sections — z-index 3 */}
        <Act3 scrollY={scrollY} />
      </ScrollViewport>
    </div>
  );
}
```

The `Act3` wrapper handles its own opacity fade-in (scroll range 0.8-1.05 vh) and translateY after transition completes (>1.5vh). It renders:
- `<CapabilitiesSection />`
- `<MissionSection />`
- `<CtaSection />`
- `<Footer />`

Position: `absolute, top: 0, left: 0, right: 0, z-index: 3`, with `padding-top: 100vh` so content starts below the fold.

- [ ] **Step 2: Test the full page in browser**

Run dev server, open http://localhost:3000. Walk through the entire page:
1. Act 1: VECTR title, grid, scroll hint
2. Scroll transition: title exits, lines trace in, statement appears
3. Act 2 settles: wave animation runs
4. Continue scrolling: capabilities cards with border glow
5. Mission section
6. CTA with email input
7. Footer

Compare against the prototype at localhost:3737 for the hero transition.

- [ ] **Step 3: Test responsive behavior**

Resize browser to tablet (1024px) and mobile (375px) widths. Verify:
- Text remains readable, no horizontal overflow
- Grid layout stacks on narrow screens
- Hero title scales via clamp()
- No broken layouts

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/landing-page.tsx
git commit -m "feat(landing): assemble full landing page with all sections"
```

---

### Task 12: Polish and cleanup

**Files:**
- Modify: various (based on testing)
- Delete: `prototype/index.html` (optional — can keep as reference)

- [ ] **Step 1: Performance check**

Open browser DevTools Performance tab. Record a scroll through the hero transition. Check:
- No dropped frames during scroll
- `requestAnimationFrame` callbacks staying under 16ms
- No layout thrashing (reads then writes, not interleaved)

If wave animation is heavy, consider reducing `sampleCount` from 80 to 60, or throttling path rebuilds to every other frame.

- [ ] **Step 2: Check for console errors/warnings**

Open browser console. Scroll through entire page. Fix any:
- React hydration mismatches (especially from `window.innerHeight` during SSR)
- Missing key props
- Unused import warnings

- [ ] **Step 3: Verify all old neon code is gone**

Search the codebase for remnants:
- `grep -r "neon" src/` should return nothing
- `grep -r "COMMAND THE SWARM" src/` should return nothing
- `grep -r "99.9%" src/` should return nothing
- `grep -r "Orbitron" src/` should return nothing

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore(landing): polish, performance tuning, remove legacy references"
```
