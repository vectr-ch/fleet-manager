"use client";

import { useEffect, useRef } from "react";
import { easeOutCubic, easeInOutCubic } from "@/lib/easing";
import { useViewportHeight } from "@/hooks/use-viewport-height";
import { TopoLines, type TopoLinesHandle } from "./topo-lines";

interface SignalSectionProps {
  scrollY: number;
}

export function SignalSection({ scrollY }: SignalSectionProps) {
  const vh = useViewportHeight();

  // Keep scrollY in a ref so the rAF loop always reads the latest value
  const scrollYRef = useRef(scrollY);
  useEffect(() => {
    scrollYRef.current = scrollY;
  }, [scrollY]);

  const topoRef = useRef<TopoLinesHandle>(null);
  const noiseRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLParagraphElement>(null);
  const followRef = useRef<HTMLParagraphElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    let lastTime = 0;
    let waveTime = 0;

    function loop(timestamp: number) {
      const delta = lastTime ? (timestamp - lastTime) / 1000 : 0;
      lastTime = timestamp;

      const sy = scrollYRef.current;

      // Enter progress: 0.05vh -> 0.55vh
      const enterProgress = Math.max(
        0,
        Math.min(1, (sy - vh * 0.05) / (vh * 0.5)),
      );
      const enterEased = easeInOutCubic(enterProgress);

      // Exit progress: lines trace out as user scrolls past (0.8vh → 1.3vh)
      const exitProgress = Math.max(
        0,
        Math.min(1, (sy - vh * 0.8) / (vh * 0.5)),
      );

      // Wave time increments continuously
      if (enterProgress > 0) {
        waveTime += delta;
      }

      // Topo lines (pass exitProgress for trace-out)
      topoRef.current?.update(enterProgress, waveTime, exitProgress);

      // Noise layer (fades out on exit)
      if (noiseRef.current) {
        const noiseOpacity = enterEased * 0.35 * Math.max(0, 1 - exitProgress);
        noiseRef.current.style.opacity = `${noiseOpacity}`;
      }

      // Glow orb (fades out on exit)
      if (glowRef.current) {
        const glowOpacity = enterEased * Math.max(0, 1 - exitProgress);
        glowRef.current.style.opacity = `${glowOpacity}`;
      }

      // Text exit: as exitProgress increases, text fades and moves up
      const textExitOffset = exitProgress * vh * 0.4; // accelerated upward exit
      const textExitOpacity = 1 - exitProgress * 2; // fades out in first half of exit

      // Statement
      if (statementRef.current) {
        const progress = Math.max(
          0,
          Math.min(1, (sy - vh * 0.12) / (vh * 0.22)),
        );
        const eased = easeOutCubic(progress);
        const enterY = (1 - eased) * 30;
        const opacity = Math.max(0, Math.min(eased, textExitOpacity));
        statementRef.current.style.opacity = `${opacity}`;
        statementRef.current.style.transform = `translateY(${enterY - textExitOffset}px)`;
      }

      // Follow
      if (followRef.current) {
        const progress = Math.max(
          0,
          Math.min(1, (sy - vh * 0.22) / (vh * 0.15)),
        );
        const eased = easeOutCubic(progress);
        const enterY = (1 - eased) * 16;
        const opacity = Math.max(0, Math.min(eased, textExitOpacity));
        followRef.current.style.opacity = `${opacity}`;
        followRef.current.style.transform = `translateY(${enterY - textExitOffset}px)`;
      }

      // Divider
      if (dividerRef.current) {
        const progress = Math.max(
          0,
          Math.min(1, (sy - vh * 0.32) / (vh * 0.1)),
        );
        const opacity = Math.max(0, Math.min(progress, textExitOpacity));
        dividerRef.current.style.opacity = `${opacity}`;
        dividerRef.current.style.transform = `scaleX(${easeOutCubic(progress)}) translateY(${-textExitOffset}px)`;
      }

      // Stack
      if (stackRef.current) {
        const progress = Math.max(
          0,
          Math.min(1, (sy - vh * 0.36) / (vh * 0.1)),
        );
        const eased = easeOutCubic(progress);
        const enterY = (1 - eased) * 10;
        const opacity = Math.max(0, Math.min(eased, textExitOpacity));
        stackRef.current.style.opacity = `${opacity}`;
        stackRef.current.style.transform = `translateY(${enterY - textExitOffset}px)`;
      }

      // Keep loop running when lines are visible (for traveling wave)
      if (enterProgress > 0) {
        rafId = requestAnimationFrame(loop);
      } else {
        // Reset and wait for next scroll trigger
        lastTime = 0;
        rafId = requestAnimationFrame(loop);
      }
    }

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [vh]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 5,
      }}
    >
      {/* Topo lines */}
      <TopoLines ref={topoRef} />

      {/* Noise layer */}
      <div
        ref={noiseRef}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg viewBox=%220 0 512 512%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.04%22/%3E%3C/svg%3E')",
          backgroundSize: "256px 256px",
        }}
      />

      {/* Glow orb */}
      <div
        ref={glowRef}
        style={{
          position: "absolute",
          top: "25%",
          right: "8%",
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 65%)",
          borderRadius: "50%",
          opacity: 0,
        }}
      />

      {/* Statement text container */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "0 clamp(40px, 10vw, 140px)",
          maxWidth: 780,
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div>
          <p
            ref={statementRef}
            style={{
              fontSize: "clamp(30px, 4.5vw, 50px)",
              fontWeight: 200,
              color: "var(--lp-text-primary)",
              lineHeight: 1.4,
              letterSpacing: "-0.5px",
              willChange: "transform, opacity",
              opacity: 0,
              margin: 0,
            }}
          >
            Autonomous fleets need infrastructure that doesn&apos;t exist yet.
          </p>

          <p
            ref={followRef}
            style={{
              fontSize: "clamp(17px, 2vw, 22px)",
              color: "var(--lp-text-muted)",
              marginTop: 28,
              willChange: "transform, opacity",
              opacity: 0,
              marginBottom: 0,
            }}
          >
            We&apos;re building it.
          </p>

          <div
            ref={dividerRef}
            style={{
              width: 32,
              height: 1,
              background: "var(--lp-text-faint)",
              margin: "44px 0 20px",
              transformOrigin: "left",
              opacity: 0,
            }}
          />

          <div
            ref={stackRef}
            style={{
              fontFamily: "var(--lp-font-mono)",
              fontSize: 10,
              color: "var(--lp-text-faint)",
              letterSpacing: 4,
              opacity: 0,
            }}
          >
            MESH &middot; EDGE &middot; TELEMETRY &middot; FLEET
          </div>
        </div>
      </div>
    </div>
  );
}
