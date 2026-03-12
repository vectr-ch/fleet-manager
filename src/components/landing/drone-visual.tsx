"use client";

type ParticlePosition = {
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;
};

type Particle = ParticlePosition & {
  color: string;
  delay: string;
  size: number;
};

const PARTICLES: Particle[] = [
  { top: "10%", left: "15%", color: "var(--lp-neon-green)", delay: "0s", size: 6 },
  { top: "20%", right: "10%", color: "var(--lp-neon-cyan)", delay: "0.5s", size: 4 },
  { bottom: "15%", left: "20%", color: "var(--lp-neon-purple)", delay: "1s", size: 5 },
  { bottom: "25%", right: "15%", color: "var(--lp-neon-pink)", delay: "1.5s", size: 4 },
  { top: "50%", left: "5%", color: "var(--lp-neon-green)", delay: "0.8s", size: 3 },
  { top: "40%", right: "5%", color: "var(--lp-neon-cyan)", delay: "1.2s", size: 5 },
];

export function DroneVisual() {
  return (
    <div
      className="relative w-full mx-auto"
      style={{ maxWidth: 500, aspectRatio: "1" }}
    >
      {/* Ring 1 — green, slow */}
      <div
        className="absolute rounded-full"
        style={{
          inset: "5%",
          border: "1px solid rgba(0, 255, 136, 0.3)",
          boxShadow: "0 0 20px rgba(0, 255, 136, 0.1)",
          animation: "lp-rotate-ring 20s linear infinite",
        }}
      />
      {/* Ring 2 — purple, medium reverse */}
      <div
        className="absolute rounded-full"
        style={{
          inset: "15%",
          border: "1px solid rgba(189, 0, 255, 0.4)",
          boxShadow: "0 0 20px rgba(189, 0, 255, 0.15)",
          animation: "lp-rotate-ring 15s linear infinite reverse",
        }}
      />
      {/* Ring 3 — cyan, fast */}
      <div
        className="absolute rounded-full"
        style={{
          inset: "25%",
          border: "1px solid rgba(0, 240, 255, 0.5)",
          boxShadow: "0 0 20px rgba(0, 240, 255, 0.2)",
          animation: "lp-rotate-ring 10s linear infinite",
        }}
      />

      {/* Drone body — floats */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          inset: "30%",
          animation: "lp-float 4s ease-in-out infinite",
        }}
      >
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Hex body */}
          <polygon
            points="100,30 160,65 160,135 100,170 40,135 40,65"
            fill="rgba(0,255,136,0.08)"
            stroke="#00ff88"
            strokeWidth="1.5"
          />
          {/* Inner hex */}
          <polygon
            points="100,55 140,77.5 140,122.5 100,145 60,122.5 60,77.5"
            fill="rgba(0,240,255,0.06)"
            stroke="rgba(0,240,255,0.5)"
            strokeWidth="1"
          />
          {/* Arms */}
          <line x1="100" y1="100" x2="30" y2="40" stroke="rgba(0,255,136,0.4)" strokeWidth="1.5" />
          <line x1="100" y1="100" x2="170" y2="40" stroke="rgba(0,255,136,0.4)" strokeWidth="1.5" />
          <line x1="100" y1="100" x2="30" y2="160" stroke="rgba(0,255,136,0.4)" strokeWidth="1.5" />
          <line x1="100" y1="100" x2="170" y2="160" stroke="rgba(0,255,136,0.4)" strokeWidth="1.5" />
          {/* Rotors */}
          {[
            { cx: 30, cy: 40 },
            { cx: 170, cy: 40 },
            { cx: 30, cy: 160 },
            { cx: 170, cy: 160 },
          ].map(({ cx, cy }, i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="18" fill="rgba(0,255,136,0.05)" stroke="rgba(0,255,136,0.3)" strokeWidth="1" />
              <circle cx={cx} cy={cy} r="4" fill="#00ff88" opacity="0.8" />
              <circle
                cx={cx}
                cy={cy}
                r="14"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="2"
                strokeDasharray="20 44"
                style={{ animation: `lp-rotate-ring ${0.3 + i * 0.05}s linear infinite${i % 2 === 0 ? "" : " reverse"}` }}
              />
            </g>
          ))}
          {/* Center dot */}
          <circle cx="100" cy="100" r="8" fill="rgba(0,255,136,0.2)" stroke="#00ff88" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="3" fill="#00ff88" />
          {/* Crosshair lines */}
          <line x1="85" y1="100" x2="92" y2="100" stroke="rgba(0,240,255,0.6)" strokeWidth="1" />
          <line x1="108" y1="100" x2="115" y2="100" stroke="rgba(0,240,255,0.6)" strokeWidth="1" />
          <line x1="100" y1="85" x2="100" y2="92" stroke="rgba(0,240,255,0.6)" strokeWidth="1" />
          <line x1="100" y1="108" x2="100" y2="115" stroke="rgba(0,240,255,0.6)" strokeWidth="1" />
        </svg>
      </div>

      {/* Particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 6px ${p.color}`,
            animation: `lp-particle-float 3s ease-in-out infinite`,
            animationDelay: p.delay,
            top: p.top,
            left: p.left,
            bottom: p.bottom,
            right: p.right,
          }}
        />
      ))}

      {/* Ambient glow behind drone */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "20%",
          background:
            "radial-gradient(circle, rgba(0,255,136,0.08) 0%, rgba(0,240,255,0.04) 50%, transparent 70%)",
        }}
      />
    </div>
  );
}
