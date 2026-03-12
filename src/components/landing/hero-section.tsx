"use client";

import { useEffect, useRef, useState } from "react";
import { DroneVisual } from "./drone-visual";

const STATS = [
  { value: "10K+", label: "Drones Deployed" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<5ms", label: "Response Time" },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setParallax({ x: x * 20, y: y * 10 });
    };
    const onMouseLeave = () => {
      setParallax({ x: 0, y: 0 });
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
      className="w-full box-border"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "120px 40px 80px",
        maxWidth: 1600,
        margin: "0 auto",
      }}
    >
      <div
        className="hero-grid w-full"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "center",
        }}
      >
        {/* Left: content */}
        <div className="lp-animate-fade-in-up">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 mb-8"
            style={{
              background: "rgba(0, 255, 136, 0.08)",
              border: "1px solid rgba(0, 255, 136, 0.3)",
              padding: "6px 16px",
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
            }}
          >
            <span
              className="inline-block rounded-full"
              style={{
                width: 6,
                height: 6,
                background: "var(--lp-neon-green)",
                boxShadow: "0 0 8px var(--lp-neon-green-glow)",
                animation: "lp-pulse 2s ease infinite",
              }}
            />
            <span
              className="font-display text-[10px] tracking-[0.2em] text-lp-neon-green uppercase"
            >
              Autonomous Fleet Intelligence
            </span>
          </div>

          {/* Title */}
          <h1
            className="font-display font-black uppercase mb-3"
            style={{
              fontSize: "clamp(36px, 5vw, 72px)",
              lineHeight: 1.05,
            }}
          >
            COMMAND
            <br />
            <span className="lp-gradient-text">THE SWARM</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lp-text-secondary mb-10"
            style={{
              fontSize: 17,
              lineHeight: 1.7,
              maxWidth: 480,
            }}
          >
            Military-grade autonomous drone fleet management. Real-time telemetry,
            AI-powered coordination, and mission-critical reliability at scale.
          </p>

          {/* CTAs */}
          <div
            className="hero-ctas flex flex-wrap gap-4 mb-16"
          >
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="font-display font-bold uppercase inline-block text-lp-bg-primary bg-lp-neon-green"
              style={{
                fontSize: 12,
                letterSpacing: "0.15em",
                padding: "14px 32px",
                textDecoration: "none",
                clipPath:
                  "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                transition: "box-shadow 0.2s",
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
              className="font-display font-bold uppercase inline-block text-lp-neon-cyan bg-transparent"
              style={{
                fontSize: 12,
                letterSpacing: "0.15em",
                border: "1px solid rgba(0, 240, 255, 0.4)",
                padding: "14px 32px",
                textDecoration: "none",
                clipPath:
                  "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                transition: "border-color 0.2s, box-shadow 0.2s",
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
            className="hero-stats flex flex-wrap gap-10 pt-8 border-t border-white/5"
          >
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div
                  className="font-display font-black text-3xl text-lp-neon-green leading-none mb-1"
                >
                  {value}
                </div>
                <div
                  className="text-xs tracking-wider text-lp-text-muted uppercase"
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: drone */}
        <div
          ref={visualRef}
          className="hero-drone-col flex items-center justify-center"
          style={{
            transition: "transform 0.1s ease-out",
            transform: `translate(${parallax.x}px, ${parallax.y}px)`,
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
