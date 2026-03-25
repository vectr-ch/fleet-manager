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
      {/* Border-only glow: the radial gradient is masked to only show
          on a 1px border ring, keeping the card interior clean */}
      <div
        style={{
          position: "absolute",
          inset: "-1px",
          borderRadius: "inherit",
          pointerEvents: "none",
          opacity: isNear ? 1 : 0,
          transition: "opacity 0.3s ease",
          background: `radial-gradient(circle 120px at ${x + 1}px ${y + 1}px, rgba(255,255,255,0.4), transparent)`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }}
      />
      {children}
    </div>
  );
}
