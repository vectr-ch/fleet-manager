"use client";

export function CyberBackground() {
  return (
    <div className="fixed inset-0 -z-[1] pointer-events-none overflow-hidden">
      {/* Animated grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          animation: "lp-grid-move 20s linear infinite",
          transformOrigin: "center bottom",
        }}
      />
      {/* Scan line */}
      <div
        className="absolute left-0 right-0 h-0.5"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.3), transparent)",
          animation: "lp-scan-line 8s linear infinite",
        }}
      />
      {/* Radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(10, 10, 15, 0.8) 100%)",
        }}
      />
    </div>
  );
}
