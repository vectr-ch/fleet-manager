"use client";

import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { useViewportHeight } from "@/hooks/use-viewport-height";

export function FixedNav() {
  const scrollY = useScrollProgress();
  const vh = useViewportHeight();

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
