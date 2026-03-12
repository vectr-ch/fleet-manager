"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const TERMINAL_LINES = [
  { prompt: true, text: "vectr init --fleet-size=1000 --mode=autonomous" },
  { prompt: false, text: "Initializing VECTR Fleet OS v2.4.1...", color: "var(--lp-text-secondary)" },
  { prompt: false, text: "✓ Neural mesh established [1000/1000 nodes]", color: "var(--lp-neon-green)" },
  { prompt: false, text: "✓ GPS constellation locked [32 satellites]", color: "var(--lp-neon-green)" },
  { prompt: true, text: "vectr mission deploy --target=grid-alpha --rules=ROE_7" },
  { prompt: false, text: "Deploying to GRID-ALPHA sector...", color: "var(--lp-text-secondary)" },
  { prompt: false, text: "✓ Swarm formation: DELTA-V pattern", color: "var(--lp-neon-cyan)" },
  { prompt: false, text: "✓ Mission uploaded to 1000 units", color: "var(--lp-neon-cyan)" },
  { prompt: true, text: "vectr status --live" },
  { prompt: false, text: "FLEET STATUS: OPERATIONAL", color: "var(--lp-neon-green)" },
  { prompt: false, text: "Active: 998 | Charging: 2 | Uptime: 99.8%", color: "var(--lp-text-secondary)" },
];

const CHECKLIST = [
  "AI-driven obstacle avoidance at 120mph",
  "Encrypted comms with zero-knowledge auth",
  "Self-organizing mesh survives 40% node loss",
  "Sub-10ms command relay across 50km range",
];

export function CommandSection() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let i = 0;
          const tick = () => {
            setVisibleLines((v) => v + 1);
            i++;
            if (i < TERMINAL_LINES.length) {
              setTimeout(tick, 180 + Math.random() * 120);
            }
          };
          setTimeout(tick, 400);
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="autonomy"
      ref={sectionRef}
      className="py-32 px-10 bg-lp-bg-secondary border-t border-white/5 border-b"
    >
      <div
        className="cmd-grid max-w-[1400px] mx-auto grid grid-cols-[1fr_1.2fr] items-center gap-20"
      >
        {/* Left: text content */}
        <div>
          <div className="font-display text-xs tracking-[0.3em] text-lp-neon-cyan mb-4">
            // COMMAND CENTER
          </div>
          <h2
            className="font-display font-black uppercase leading-[1.1] mb-5"
            style={{ fontSize: "clamp(26px, 3.5vw, 46px)" }}
          >
            Total Mission{" "}
            <span className="lp-gradient-text">Autonomy</span>
          </h2>
          <p className="text-lp-text-secondary text-sm leading-relaxed mb-9">
            Deploy, coordinate, and recall entire fleets with a single command. Our
            autonomous engine handles the complexity — you focus on the mission.
          </p>

          {/* Checklist */}
          <ul className="list-none p-0 mb-10 flex flex-col gap-3.5">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded bg-lp-neon-green/10 border border-lp-neon-green/40 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <polyline points="1,4 3.5,6.5 9,1" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-lp-text-secondary text-sm leading-[1.5]">{item}</span>
              </li>
            ))}
          </ul>

          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            className={cn(
              "lp-btn-clip font-display text-xs tracking-[0.15em] uppercase",
              "text-lp-bg-primary bg-lp-neon-cyan px-7 py-3 no-underline font-bold",
              "inline-block transition-shadow duration-200",
              "hover:shadow-[0_0_25px_var(--lp-neon-cyan-glow)]"
            )}
          >
            Request Demo
          </a>
        </div>

        {/* Right: terminal */}
        <div className="cmd-terminal-wrap [perspective:1000px]">
          <div
            className="cmd-terminal border rounded overflow-hidden transition-transform duration-300"
            style={{
              background: "#0d0d14",
              border: "1px solid rgba(0, 255, 136, 0.2)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,255,136,0.05)",
              transform: isHovered ? "rotateY(0deg) rotateX(0deg)" : "rotateY(-5deg) rotateX(5deg)",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Terminal header */}
            <div className="bg-lp-neon-green/5 border-b border-lp-neon-green/15 px-4 py-2.5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840] inline-block" />
              <span className="ml-3 font-display text-[10px] text-lp-text-muted tracking-widest">
                vectr_command_v2.4.1
              </span>
            </div>
            {/* Terminal body */}
            <div className="p-5 pb-6 font-mono text-sm leading-relaxed min-h-80">
              {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
                <div
                  key={i}
                  className="flex gap-2"
                  style={{
                    color: line.color ?? "var(--lp-text-primary)",
                    animation: "lp-fade-in-up 0.3s ease forwards",
                  }}
                >
                  {line.prompt && (
                    <span className="text-lp-neon-green select-none">$</span>
                  )}
                  <span style={{ color: line.prompt ? "var(--lp-neon-cyan)" : line.color }}>
                    {line.text}
                  </span>
                </div>
              ))}
              {visibleLines >= TERMINAL_LINES.length && (
                <div className="flex gap-2 mt-1">
                  <span className="text-lp-neon-green">$</span>
                  <span
                    className="inline-block w-2 h-3.5 bg-lp-neon-green align-middle lp-animate-blink"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .cmd-grid { grid-template-columns: 1fr !important; gap: 60px !important; }
          .cmd-terminal { transform: none !important; }
          .cmd-terminal:hover { transform: none !important; }
        }
      `}</style>
    </section>
  );
}
