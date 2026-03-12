"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    tag: "GPS-DENIED CAPABLE",
    title: "Precision Targeting",
    description:
      "Sub-centimeter accuracy using multi-sensor fusion. Operates in GPS-denied environments with visual SLAM and inertial navigation.",
    color: "var(--lp-neon-green)",
    glow: "rgba(0, 255, 136, 0.15)",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <circle cx="24" cy="24" r="18" stroke="#00ff88" strokeWidth="1.5" opacity="0.3" />
        <circle cx="24" cy="24" r="10" stroke="#00ff88" strokeWidth="1.5" opacity="0.6" />
        <circle cx="24" cy="24" r="3" fill="#00ff88" />
        <line x1="24" y1="6" x2="24" y2="14" stroke="#00ff88" strokeWidth="1.5" />
        <line x1="24" y1="34" x2="24" y2="42" stroke="#00ff88" strokeWidth="1.5" />
        <line x1="6" y1="24" x2="14" y2="24" stroke="#00ff88" strokeWidth="1.5" />
        <line x1="34" y1="24" x2="42" y2="24" stroke="#00ff88" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    tag: "MESH NETWORK",
    title: "Swarm Coordination",
    description:
      "Decentralized AI orchestration across 1000+ simultaneous units. Self-healing mesh topology ensures mission continuity under jamming.",
    color: "var(--lp-neon-cyan)",
    glow: "rgba(0, 240, 255, 0.15)",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <circle cx="24" cy="10" r="4" fill="rgba(0,240,255,0.2)" stroke="#00f0ff" strokeWidth="1.5" />
        <circle cx="10" cy="34" r="4" fill="rgba(0,240,255,0.2)" stroke="#00f0ff" strokeWidth="1.5" />
        <circle cx="38" cy="34" r="4" fill="rgba(0,240,255,0.2)" stroke="#00f0ff" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="5" fill="rgba(0,240,255,0.3)" stroke="#00f0ff" strokeWidth="1.5" />
        <line x1="24" y1="14" x2="24" y2="19" stroke="#00f0ff" strokeWidth="1" opacity="0.6" />
        <line x1="14" y1="32" x2="19" y2="27" stroke="#00f0ff" strokeWidth="1" opacity="0.6" />
        <line x1="34" y1="32" x2="29" y2="27" stroke="#00f0ff" strokeWidth="1" opacity="0.6" />
        <line x1="10" y1="30" x2="38" y2="30" stroke="#00f0ff" strokeWidth="1" opacity="0.3" strokeDasharray="3 3" />
        <line x1="11" y1="32" x2="23" y2="12" stroke="#00f0ff" strokeWidth="1" opacity="0.3" strokeDasharray="3 3" />
        <line x1="37" y1="32" x2="25" y2="12" stroke="#00f0ff" strokeWidth="1" opacity="0.3" strokeDasharray="3 3" />
      </svg>
    ),
  },
  {
    tag: "EDGE AI",
    title: "Mission Autonomy",
    description:
      "On-board neural processing for real-time decision making. No cloud dependency — full autonomous operation at the edge.",
    color: "var(--lp-neon-purple)",
    glow: "rgba(189, 0, 255, 0.15)",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <rect x="12" y="12" width="24" height="24" rx="2" stroke="#bd00ff" strokeWidth="1.5" fill="rgba(189,0,255,0.08)" />
        <circle cx="18" cy="18" r="2.5" fill="#bd00ff" opacity="0.8" />
        <circle cx="30" cy="18" r="2.5" fill="#bd00ff" opacity="0.8" />
        <circle cx="18" cy="30" r="2.5" fill="#bd00ff" opacity="0.8" />
        <circle cx="30" cy="30" r="2.5" fill="#bd00ff" opacity="0.8" />
        <circle cx="24" cy="24" r="3" fill="#bd00ff" />
        <line x1="18" y1="18" x2="24" y2="24" stroke="#bd00ff" strokeWidth="1" opacity="0.5" />
        <line x1="30" y1="18" x2="24" y2="24" stroke="#bd00ff" strokeWidth="1" opacity="0.5" />
        <line x1="18" y1="30" x2="24" y2="24" stroke="#bd00ff" strokeWidth="1" opacity="0.5" />
        <line x1="30" y1="30" x2="24" y2="24" stroke="#bd00ff" strokeWidth="1" opacity="0.5" />
        <line x1="12" y1="18" x2="8" y2="18" stroke="#bd00ff" strokeWidth="1" opacity="0.4" />
        <line x1="36" y1="18" x2="40" y2="18" stroke="#bd00ff" strokeWidth="1" opacity="0.4" />
        <line x1="12" y1="30" x2="8" y2="30" stroke="#bd00ff" strokeWidth="1" opacity="0.4" />
        <line x1="36" y1="30" x2="40" y2="30" stroke="#bd00ff" strokeWidth="1" opacity="0.4" />
      </svg>
    ),
  },
  {
    tag: "5G/SATCOM",
    title: "Live Telemetry",
    description:
      "250Hz sensor fusion with sub-millisecond latency. Complete situational awareness from every drone in the fleet simultaneously.",
    color: "var(--lp-neon-pink)",
    glow: "rgba(255, 45, 106, 0.15)",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <polyline points="6,32 14,20 20,26 28,14 34,22 42,10" stroke="#ff2d6a" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        <circle cx="42" cy="10" r="3" fill="#ff2d6a" />
        <line x1="6" y1="38" x2="42" y2="38" stroke="#ff2d6a" strokeWidth="1" opacity="0.3" />
        <line x1="6" y1="10" x2="6" y2="38" stroke="#ff2d6a" strokeWidth="1" opacity="0.3" />
      </svg>
    ),
  },
];

export function FeaturesSection() {
  const [visible, setVisible] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [glowPos, setGlowPos] = useState<{ mx: number; my: number }>({ mx: 0, my: 0 });
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const onCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, i: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlowPos({ mx: e.clientX - rect.left, my: e.clientY - rect.top });
    setActiveCardIndex(i);
  };

  const onCardMouseLeave = () => {
    setActiveCardIndex(null);
  };

  return (
    <section
      id="fleet"
      ref={sectionRef}
      className="box-border w-full"
      style={{ padding: "128px 40px", maxWidth: 1400, margin: "0 auto" }}
    >
      {/* Header */}
      <div className="text-center mb-20">
        <div
          className={cn(
            "font-display text-xs tracking-[0.3em] text-lp-neon-green mb-4 transition-opacity duration-500",
            visible ? "opacity-100" : "opacity-0"
          )}
        >
          // CAPABILITIES
        </div>
        <h2
          className={cn(
            "font-display font-black uppercase transition-[opacity,transform] duration-500 delay-100",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          )}
          style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
        >
          Fleet{" "}
          <span className="lp-gradient-text">Intelligence</span>
        </h2>
      </div>

      {/* Cards grid */}
      <div
        className="features-grid grid grid-cols-4 gap-6"
      >
        {FEATURES.map(({ tag, title, description, color, glow, icon }, i) => (
          <div
            key={title}
            onMouseMove={(e) => onCardMouseMove(e, i)}
            onMouseLeave={onCardMouseLeave}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = color;
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
            }}
            className={cn(
              "lp-card-clip relative bg-lp-bg-secondary border border-white/5 p-8 cursor-default overflow-hidden",
              "transition-[opacity,transform,border-color]"
            )}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(40px)",
              transition: `opacity 0.6s ${0.1 + i * 0.1}s, transform 0.6s ${0.1 + i * 0.1}s, border-color 0.3s`,
            }}
          >
            {/* Mouse glow */}
            <div
              className={cn(
                "card-glow absolute inset-0 pointer-events-none transition-opacity duration-300",
                activeCardIndex === i ? "opacity-100" : "opacity-0"
              )}
              style={{
                background: `radial-gradient(circle 120px at ${activeCardIndex === i ? glowPos.mx : "50%"}px ${activeCardIndex === i ? glowPos.my : "50%"}px, ${glow}, transparent)`,
              }}
            />
            {/* Icon */}
            <div className="mb-5">{icon}</div>
            {/* Tag */}
            <div
              className="font-display text-[9px] tracking-[0.2em] mb-2.5 uppercase"
              style={{ color }}
            >
              {tag}
            </div>
            {/* Title */}
            <h3 className="font-display text-base font-bold text-lp-text-primary mb-3 uppercase tracking-wider">
              {title}
            </h3>
            {/* Description */}
            <p className="text-lp-text-secondary text-sm leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
