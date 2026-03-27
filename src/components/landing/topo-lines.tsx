"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { easeOutCubic } from "@/lib/easing";

// ===== Line configuration =====

interface LineConfig {
  yBase: number;
  amplitude: number;
  frequency: number;
  phaseOffset: number;
  speed: number;
}

const LINE_COUNT = 7;
const Y_CENTER = 450;
const Y_SPACING = 55;
const SAMPLE_COUNT = 80;
const X_MIN = -300;
const X_MAX = 1700;
const TENSION = 0.3;

function makeLineConfigs(): LineConfig[] {
  const configs: LineConfig[] = [];
  for (let i = 0; i < LINE_COUNT; i++) {
    configs.push({
      yBase: Y_CENTER + (i - Math.floor(LINE_COUNT / 2)) * Y_SPACING,
      amplitude: 40 + Math.sin(i * 1.2) * 20,
      frequency: 0.003 + i * 0.0003,
      phaseOffset: i * 1.1,
      speed: 0.4 + i * 0.03,
    });
  }
  return configs;
}

// ===== Path generation =====

function buildWavePath(cfg: LineConfig, time: number): string {
  const points: { x: number; y: number }[] = [];
  for (let s = 0; s <= SAMPLE_COUNT; s++) {
    const t = s / SAMPLE_COUNT;
    const x = X_MAX - t * (X_MAX - X_MIN); // 1700 -> -300 (right to left)
    const y =
      cfg.yBase +
      cfg.amplitude *
        Math.sin(x * cfg.frequency + cfg.phaseOffset + time * cfg.speed);
    points.push({ x, y });
  }

  // Catmull-Rom to cubic bezier
  let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;

  for (let j = 1; j < points.length - 1; j++) {
    const prev = points[j - 1];
    const curr = points[j];
    const next = points[j + 1];
    const cp1x = curr.x - (next.x - prev.x) * TENSION;
    const cp1y = curr.y - (next.y - prev.y) * TENSION;

    if (j === 1) {
      d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${curr.x.toFixed(1)},${curr.y.toFixed(1)}`;
    } else {
      d += ` S${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${curr.x.toFixed(1)},${curr.y.toFixed(1)}`;
    }
  }

  const last = points[points.length - 1];
  d += ` L${last.x.toFixed(1)},${last.y.toFixed(1)}`;
  return d;
}

// ===== Public handle =====

export interface TopoLinesHandle {
  update: (enterProgress: number, waveTime: number, exitProgress?: number) => void;
}

// ===== Component =====

export const TopoLines = forwardRef<TopoLinesHandle>(function TopoLines(
  _props,
  ref,
) {
  const groupRef = useRef<SVGGElement>(null);
  const pathRefs = useRef<SVGPathElement[]>([]);
  const pathLengths = useRef<number[]>([]);
  const lineConfigs = useRef<LineConfig[]>(makeLineConfigs());
  // Track wave continuity per line
  const transitionTimes = useRef<number[]>(new Array(LINE_COUNT).fill(-1));
  const lastWaveT = useRef<number[]>(new Array(LINE_COUNT).fill(0));
  // Once a line has fully traced in, it never goes back to the static path
  const everCompleted = useRef<boolean[]>(new Array(LINE_COUNT).fill(false));

  // On mount: set initial static paths (time=0) and measure lengths
  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;

    const configs = lineConfigs.current;
    const paths: SVGPathElement[] = [];
    const lengths: number[] = [];

    for (let i = 0; i < LINE_COUNT; i++) {
      const pathEl = g.children[i] as SVGPathElement;
      if (!pathEl) continue;

      const d = buildWavePath(configs[i], 0);
      pathEl.setAttribute("d", d);

      const len = pathEl.getTotalLength();
      lengths.push(len);
      paths.push(pathEl);

      // Start fully hidden
      pathEl.style.strokeDasharray = `${len}`;
      pathEl.style.strokeDashoffset = `${len}`;
    }

    pathRefs.current = paths;
    pathLengths.current = lengths;
  }, []);

  // Expose update method to parent
  useImperativeHandle(ref, () => ({
    update(enterProgress: number, waveTime: number, exitProgress: number = 0) {
      const paths = pathRefs.current;
      const configs = lineConfigs.current;
      const transitions = transitionTimes.current;
      const lastT = lastWaveT.current;
      const completed = everCompleted.current;

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];

        const staggerDelay = i * 0.06;
        const lineProgress = Math.max(
          0,
          Math.min(1, (enterProgress - staggerDelay) / 0.6),
        );
        const lineEased = easeOutCubic(lineProgress);

        // Once completed, never go back to static trace-in
        if (!completed[i] && lineEased < 1) {
          // FIRST TRACE IN: wave path + dashoffset reveal
          path.setAttribute("d", buildWavePath(configs[i], waveTime));
          const currentLen = path.getTotalLength();
          path.style.strokeDasharray = `${currentLen}`;
          path.style.strokeDashoffset = `${currentLen * (1 - lineEased)}`;
          transitions[i] = -1;
          lastT[i] = waveTime;
        } else if (exitProgress > 0 || (completed[i] && lineEased < 1)) {
          // TRACE OUT (or reverse-trace on scroll up after completion)
          // Use lineEased for reverse-trace visibility, exitProgress for forward trace-out
          const visibility = completed[i] && lineEased < 1
            ? lineEased  // scroll up: line fades back using lineEased
            : 1 - exitProgress;  // scroll down: line traces out

          const t = lastT[i];
          path.setAttribute("d", buildWavePath(configs[i], t));
          const currentLen = path.getTotalLength();
          path.style.strokeDasharray = `${currentLen}`;
          path.style.strokeDashoffset = `${currentLen * (1 - visibility)}`;
          transitions[i] = -1;
        } else {
          // LIVING: wave animation
          completed[i] = true;
          if (transitions[i] < 0) {
            transitions[i] = waveTime - lastT[i];
          }
          const t = waveTime - transitions[i];
          lastT[i] = t;

          path.style.strokeDasharray = "none";
          path.style.strokeDashoffset = "0";
          path.setAttribute("d", buildWavePath(configs[i], t));
        }
      }
    },
  }));

  return (
    <svg
      viewBox="0 0 1400 900"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <g ref={groupRef}>
        {Array.from({ length: LINE_COUNT }, (_, i) => (
          <path
            key={i}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={0.8}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  );
});
