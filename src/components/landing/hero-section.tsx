"use client";

import { useEffect, useRef } from "react";
import { DroneVisual } from "./drone-visual";

const STATS = [
  { value: "10K+", label: "Drones Deployed" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<5ms", label: "Response Time" },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const visual = section.querySelector<HTMLElement>(".hero-drone-col");
      if (visual) {
        visual.style.transform = `translate(${x * 20}px, ${y * 10}px)`;
      }
    };
    const onMouseLeave = () => {
      const visual = section.querySelector<HTMLElement>(".hero-drone-col");
      if (visual) visual.style.transform = "translate(0,0)";
    };

    section.addEventListener("mousemove", onMouseMove);
    section.addEventListener("mouseleave", onMouseLeave);
    return () => {
      section.removeEventListener("mousemove", onMouseMove);
      section.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "120px 40px 80px",
        maxWidth: 1600,
        margin: "0 auto",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      <div
        className="hero-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Left: content */}
        <div style={{ animation: "lp-fade-in-up 0.8s ease forwards" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(0, 255, 136, 0.08)",
              border: "1px solid rgba(0, 255, 136, 0.3)",
              padding: "6px 16px",
              marginBottom: 32,
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--lp-neon-green)",
                boxShadow: "0 0 8px var(--lp-neon-green-glow)",
                display: "inline-block",
                animation: "lp-pulse 2s ease infinite",
              }}
            />
            <span
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: 10,
                letterSpacing: "0.2em",
                color: "var(--lp-neon-green)",
                textTransform: "uppercase",
              }}
            >
              Autonomous Fleet Intelligence
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "var(--lp-font-display)",
              fontSize: "clamp(36px, 5vw, 72px)",
              fontWeight: 900,
              lineHeight: 1.05,
              marginBottom: 12,
              textTransform: "uppercase",
            }}
          >
            COMMAND
            <br />
            <span className="lp-gradient-text">THE SWARM</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              color: "var(--lp-text-secondary)",
              fontSize: 17,
              lineHeight: 1.7,
              marginBottom: 40,
              maxWidth: 480,
            }}
          >
            Military-grade autonomous drone fleet management. Real-time telemetry,
            AI-powered coordination, and mission-critical reliability at scale.
          </p>

          {/* CTAs */}
          <div
            className="hero-ctas"
            style={{ display: "flex", gap: 16, marginBottom: 60, flexWrap: "wrap" }}
          >
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: 12,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--lp-bg-primary)",
                background: "var(--lp-neon-green)",
                padding: "14px 32px",
                textDecoration: "none",
                fontWeight: 700,
                clipPath:
                  "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                transition: "box-shadow 0.2s",
                display: "inline-block",
              }}
              onMouseOver={(e) =>
                ((e.currentTarget as HTMLElement).style.boxShadow =
                  "0 0 30px var(--lp-neon-green-glow)")
              }
              onMouseOut={(e) =>
                ((e.currentTarget as HTMLElement).style.boxShadow = "none")
              }
            >
              Request Access
            </a>
            <a
              href="#autonomy"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#autonomy")?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: 12,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--lp-neon-cyan)",
                background: "transparent",
                border: "1px solid rgba(0, 240, 255, 0.4)",
                padding: "14px 32px",
                textDecoration: "none",
                fontWeight: 700,
                clipPath:
                  "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                transition: "border-color 0.2s, box-shadow 0.2s",
                display: "inline-block",
              }}
              onMouseOver={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--lp-neon-cyan)";
                el.style.boxShadow = "0 0 20px rgba(0, 240, 255, 0.2)";
              }}
              onMouseOut={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(0, 240, 255, 0.4)";
                el.style.boxShadow = "none";
              }}
            >
              Watch Demo
            </a>
          </div>

          {/* Stats */}
          <div
            className="hero-stats"
            style={{
              display: "flex",
              gap: 40,
              paddingTop: 32,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              flexWrap: "wrap",
            }}
          >
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div
                  style={{
                    fontFamily: "var(--lp-font-display)",
                    fontSize: 28,
                    fontWeight: 900,
                    color: "var(--lp-neon-green)",
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--lp-text-muted)",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: drone */}
        <div
          className="hero-drone-col"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.1s ease-out",
          }}
        >
          <DroneVisual />
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 60px !important;
            text-align: center;
          }
          .hero-ctas { justify-content: center !important; }
          .hero-stats { justify-content: center !important; }
          .hero-drone-col { order: -1; }
        }
        @media (max-width: 480px) {
          .hero-ctas { flex-direction: column !important; }
          .hero-ctas a { width: 100%; text-align: center; }
          .hero-stats { flex-direction: column !important; gap: 20px !important; align-items: center; }
        }
      `}</style>
    </section>
  );
}
