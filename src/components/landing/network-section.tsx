"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { end: 47, suffix: "", label: "Countries Deployed", color: "var(--lp-neon-green)", textClass: "text-lp-neon-green" },
  { end: 2.4, suffix: "M", label: "Flight Hours Logged", color: "var(--lp-neon-cyan)", textClass: "text-lp-neon-cyan", decimals: 1 },
  { end: 850, suffix: "+", label: "Enterprise Clients", color: "var(--lp-neon-purple)", textClass: "text-lp-neon-purple" },
];

function useCounter(end: number, duration = 2000, started: boolean, decimals = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    const frame = (now: number) => {
      const elapsed = Math.min((now - startTime) / duration, 1);
      setValue(parseFloat((easeOutQuart(elapsed) * end).toFixed(decimals)));
      if (elapsed < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [end, duration, started, decimals]);
  return value;
}

function AnimatedStat({
  end,
  suffix,
  label,
  color,
  textClass,
  started,
  decimals = 0,
}: {
  end: number;
  suffix: string;
  label: string;
  color: string;
  textClass: string;
  started: boolean;
  decimals?: number;
}) {
  const value = useCounter(end, 2000, started, decimals);
  return (
    <div className="text-center">
      <div
        className={`font-display leading-none mb-3 font-black ${textClass}`}
        style={{
          fontSize: "clamp(40px, 6vw, 72px)",
          textShadow: `0 0 30px ${color}`,
        }}
      >
        {decimals ? value.toFixed(decimals) : Math.round(value)}
        {suffix}
      </div>
      <div className="font-display text-xs tracking-[0.2em] text-lp-text-secondary uppercase">
        {label}
      </div>
    </div>
  );
}

// Stable node positions to avoid hydration mismatch
const NODES = [
  { top: "15%", left: "10%", color: "var(--lp-neon-green)", delay: "0s" },
  { top: "30%", left: "80%", color: "var(--lp-neon-cyan)", delay: "0.5s" },
  { top: "70%", left: "15%", color: "var(--lp-neon-purple)", delay: "1s" },
  { top: "60%", left: "85%", color: "var(--lp-neon-green)", delay: "1.5s" },
  { top: "20%", left: "50%", color: "var(--lp-neon-cyan)", delay: "0.3s" },
  { top: "80%", left: "50%", color: "var(--lp-neon-pink)", delay: "0.8s" },
  { top: "45%", left: "5%", color: "var(--lp-neon-green)", delay: "1.2s" },
  { top: "45%", left: "92%", color: "var(--lp-neon-cyan)", delay: "0.6s" },
];

export function NetworkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="network"
      ref={sectionRef}
      className="bg-lp-bg-primary px-10 py-32 relative overflow-hidden"
    >
      {/* Animated background lines */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1400 600"
      >
        {/* horizontal lines */}
        {[100, 200, 300, 400, 500].map((y) => (
          <line key={y} x1="0" y1={y} x2="1400" y2={y} stroke="#00ff88" strokeWidth="0.5" />
        ))}
        {/* diagonal lines */}
        <line x1="0" y1="0" x2="1400" y2="600" stroke="#00f0ff" strokeWidth="0.5" />
        <line x1="1400" y1="0" x2="0" y2="600" stroke="#00f0ff" strokeWidth="0.5" />
        <line x1="700" y1="0" x2="0" y2="600" stroke="#bd00ff" strokeWidth="0.5" />
        <line x1="700" y1="0" x2="1400" y2="600" stroke="#bd00ff" strokeWidth="0.5" />
      </svg>

      {/* Pulsing nodes */}
      {NODES.map((node, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{
            top: node.top,
            left: node.left,
            background: node.color,
            animation: "lp-node-pulse 3s ease infinite",
            animationDelay: node.delay,
          }}
        />
      ))}

      {/* Content */}
      <div className="max-w-5xl mx-auto relative z-10 text-center">
        <div className="font-display text-xs tracking-[0.3em] text-lp-neon-green mb-4">
          // GLOBAL NETWORK
        </div>
        <h2
          className="font-display font-black uppercase mb-5"
          style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
        >
          Deployed{" "}
          <span className="lp-gradient-text">Worldwide</span>
        </h2>
        <p className="text-lp-text-secondary text-base leading-relaxed max-w-[600px] mx-auto mb-20">
          From arctic surveillance to urban security — VECTR operates across every
          terrain, climate, and jurisdiction on the planet.
        </p>

        {/* Stats */}
        <div
          className="network-stats grid grid-cols-3 gap-10 relative"
        >
          {/* Dividers */}
          <div
            aria-hidden
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: "33.33%",
              background: "linear-gradient(to bottom, transparent, rgba(0,255,136,0.2), transparent)",
            }}
          />
          <div
            aria-hidden
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: "66.66%",
              background: "linear-gradient(to bottom, transparent, rgba(0,255,136,0.2), transparent)",
            }}
          />

          {STATS.map((stat) => (
            <AnimatedStat key={stat.label} {...stat} started={started} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .network-stats {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
      `}</style>
    </section>
  );
}
