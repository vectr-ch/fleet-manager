"use client";

import { useMouseProximity } from "@/hooks/use-mouse-proximity";

interface BorderGlowCardProps {
  children: React.ReactNode;
}

export function BorderGlowCard({ children }: BorderGlowCardProps) {
  const { ref, x, y, isNear } = useMouseProximity(150);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        padding: "24px",
        border: "1px solid var(--lp-border)",
        borderRadius: "2px",
      }}
    >
      {/* Glow overlay */}
      <div
        style={{
          position: "absolute",
          inset: "-1px",
          borderRadius: "inherit",
          pointerEvents: "none",
          overflow: "hidden",
          opacity: isNear ? 1 : 0,
          transition: "opacity 0.3s ease",
          background: `radial-gradient(circle 150px at ${x}px ${y}px, rgba(255,255,255,0.1), transparent)`,
        }}
      />
      {children}
    </div>
  );
}
