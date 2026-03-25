"use client";

import { useState, useEffect } from "react";
import { easeOutCubic } from "@/lib/easing";

interface HeroSectionProps {
  scrollY: number;
}

export function HeroSection({ scrollY }: HeroSectionProps) {
  const [vh, setVh] = useState(800);

  useEffect(() => {
    setVh(window.innerHeight);
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const exitProgress = Math.min(1, scrollY / (vh * 0.2));
  const exitEased = easeOutCubic(exitProgress);

  const gridOpacity = 1 - exitEased;
  const voidLineOpacity = 1 - exitEased;
  const titleTranslateY = exitEased * vh * 0.7;
  const titleOpacity = Math.max(0, 1 - exitProgress * 2.5);
  const eyebrowOpacity = Math.max(0, 1 - exitProgress * 4);
  const scrollHintOpacity = Math.max(0, 1 - exitProgress * 6);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Void grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: gridOpacity,
          willChange: "transform, opacity",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Void line */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: "1px",
          opacity: voidLineOpacity,
          background:
            "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.035) 50%, transparent 95%)",
        }}
      />

      {/* Center content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `translateY(-${titleTranslateY}px)`,
          willChange: "transform, opacity",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontFamily: "var(--lp-font-mono)",
            fontSize: "11px",
            letterSpacing: "8px",
            color: "var(--lp-text-faint)",
            textTransform: "uppercase",
            marginBottom: "48px",
            opacity: eyebrowOpacity,
          }}
        >
          AUTONOMOUS FLEET INFRASTRUCTURE
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "clamp(72px, 13vw, 140px)",
            fontWeight: 100,
            color: "var(--lp-text-primary)",
            letterSpacing: "20px",
            opacity: titleOpacity,
          }}
        >
          VECTR
        </div>
      </div>

      {/* Scroll hint */}
      <div
        style={{
          position: "absolute",
          bottom: "48px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          opacity: scrollHintOpacity,
        }}
      >
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "3px",
            color: "var(--lp-text-faint)",
            textTransform: "uppercase",
            fontFamily: "var(--lp-font-mono)",
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: "1px",
            height: "40px",
            background:
              "linear-gradient(to bottom, var(--lp-text-faint), transparent)",
            animation: "lp-pulse-line 2s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}
