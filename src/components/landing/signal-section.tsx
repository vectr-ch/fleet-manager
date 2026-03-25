"use client";

import { useEffect, useRef, useState } from "react";
import { easeOutCubic, easeInOutCubic } from "@/lib/easing";
import { TopoLines, type TopoLinesHandle } from "./topo-lines";

interface SignalSectionProps {
  scrollY: number;
}

export function SignalSection({ scrollY }: SignalSectionProps) {
  const [vh, setVh] = useState(800);

  useEffect(() => {
    setVh(window.innerHeight);
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

      // Wave time increments continuously
      if (enterProgress > 0) {
        waveTime += delta;
      }

      // Topo lines
      topoRef.current?.update(enterProgress, waveTime);

      // Noise layer
      if (noiseRef.current) {
        noiseRef.current.style.opacity = `${enterEased * 0.35}`;
      }

      // Glow orb
      if (glowRef.current) {
        glowRef.current.style.opacity = `${enterEased}`;
      }

      // Statement
      if (statementRef.current) {
        const progress = Math.max(
          0,
          Math.min(1, (sy - vh * 0.12) / (vh * 0.22)),
        );
        const eased = easeOutCubic(progress);
        statementRef.current.style.opacity = `${eased}`;
        statementRef.current.style.transform = `translateY(${(1 - eased) * 30}px)`;
      }

      // Follow
      if (followRef.current) {
        const progress = Math.max(
          0,
          Math.min(1, (sy - vh * 0.22) / (vh * 0.15)),
        );
        const eased = easeOutCubic(progress);
        followRef.current.style.opacity = `${eased}`;
        followRef.current.style.transform = `translateY(${(1 - eased) * 16}px)`;
      }

      // Divider
      if (dividerRef.current) {
        const progress = Math.max(
          0,
          Math.min(1, (sy - vh * 0.32) / (vh * 0.1)),
        );
        dividerRef.current.style.opacity = `${progress}`;
        dividerRef.current.style.transform = `scaleX(${easeOutCubic(progress)})`;
      }

      // Stack
      if (stackRef.current) {
        const progress = Math.max(
          0,
          Math.min(1, (sy - vh * 0.36) / (vh * 0.1)),
        );
        const eased = easeOutCubic(progress);
        stackRef.current.style.opacity = `${eased}`;
        stackRef.current.style.transform = `translateY(${(1 - eased) * 10}px)`;
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
