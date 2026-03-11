"use client";

import { useEffect, useRef, useState } from "react";

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
      style={{
        padding: "120px 40px",
        background: "var(--lp-bg-secondary)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div
        className="cmd-grid"
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: 80,
          alignItems: "center",
        }}
      >
        {/* Left: text content */}
        <div>
          <div
            style={{
              fontFamily: "var(--lp-font-display)",
              fontSize: 11,
              letterSpacing: "0.3em",
              color: "var(--lp-neon-cyan)",
              marginBottom: 16,
            }}
          >
            // COMMAND CENTER
          </div>
          <h2
            style={{
              fontFamily: "var(--lp-font-display)",
              fontSize: "clamp(26px, 3.5vw, 46px)",
              fontWeight: 900,
              textTransform: "uppercase",
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            Total Mission{" "}
            <span
              style={{
                background: "var(--lp-gradient-accent)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Autonomy
            </span>
          </h2>
          <p
            style={{
              color: "var(--lp-text-secondary)",
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 36,
            }}
          >
            Deploy, coordinate, and recall entire fleets with a single command. Our
            autonomous engine handles the complexity — you focus on the mission.
          </p>

          {/* Checklist */}
          <ul style={{ listStyle: "none", padding: 0, marginBottom: 40, display: "flex", flexDirection: "column", gap: 14 }}>
            {CHECKLIST.map((item) => (
              <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 3,
                    background: "rgba(0,255,136,0.1)",
                    border: "1px solid rgba(0,255,136,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <polyline points="1,4 3.5,6.5 9,1" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span style={{ color: "var(--lp-text-secondary)", fontSize: 14, lineHeight: 1.5 }}>{item}</span>
              </li>
            ))}
          </ul>

          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              fontFamily: "var(--lp-font-display)",
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--lp-bg-primary)",
              background: "var(--lp-neon-cyan)",
              padding: "12px 28px",
              textDecoration: "none",
              fontWeight: 700,
              clipPath:
                "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
              transition: "box-shadow 0.2s",
              display: "inline-block",
            }}
            onMouseOver={(e) =>
              ((e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 25px var(--lp-neon-cyan-glow)")
            }
            onMouseOut={(e) =>
              ((e.currentTarget as HTMLElement).style.boxShadow = "none")
            }
          >
            Request Demo
          </a>
        </div>

        {/* Right: terminal */}
        <div
          className="cmd-terminal-wrap"
          style={{
            perspective: "1000px",
          }}
        >
          <div
            className="cmd-terminal"
            style={{
              background: "#0d0d14",
              border: "1px solid rgba(0, 255, 136, 0.2)",
              borderRadius: 4,
              overflow: "hidden",
              transform: "rotateY(-5deg) rotateX(5deg)",
              transition: "transform 0.4s ease",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,255,136,0.05)",
            }}
            onMouseOver={(e) =>
              ((e.currentTarget as HTMLElement).style.transform = "rotateY(0deg) rotateX(0deg)")
            }
            onMouseOut={(e) =>
              ((e.currentTarget as HTMLElement).style.transform = "rotateY(-5deg) rotateX(5deg)")
            }
          >
            {/* Terminal header */}
            <div
              style={{
                background: "rgba(0,255,136,0.05)",
                borderBottom: "1px solid rgba(0,255,136,0.15)",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
              <span
                style={{
                  marginLeft: 12,
                  fontFamily: "var(--lp-font-display)",
                  fontSize: 10,
                  color: "var(--lp-text-muted)",
                  letterSpacing: "0.1em",
                }}
              >
                vectr_command_v2.4.1
              </span>
            </div>
            {/* Terminal body */}
            <div
              style={{
                padding: "20px 20px 24px",
                fontFamily: "'Geist Mono', monospace",
                fontSize: 13,
                lineHeight: 1.7,
                minHeight: 320,
              }}
            >
              {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 8,
                    color: line.color ?? "var(--lp-text-primary)",
                    animation: "lp-fade-in-up 0.3s ease forwards",
                  }}
                >
                  {line.prompt && (
                    <span style={{ color: "var(--lp-neon-green)", userSelect: "none" }}>$</span>
                  )}
                  <span style={{ color: line.prompt ? "var(--lp-neon-cyan)" : line.color }}>
                    {line.text}
                  </span>
                </div>
              ))}
              {visibleLines >= TERMINAL_LINES.length && (
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <span style={{ color: "var(--lp-neon-green)" }}>$</span>
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 14,
                      background: "var(--lp-neon-green)",
                      animation: "lp-blink 1s step-end infinite",
                      verticalAlign: "middle",
                    }}
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
