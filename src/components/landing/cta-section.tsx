"use client";

import { useState } from "react";

export function CtaSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setStatus("loading");
    // Simulate async submission
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("success");
  };

  return (
    <section
      id="contact"
      className="bg-lp-bg-secondary border-t border-lp-neon-green/10 text-center relative overflow-hidden px-10 py-36"
    >
      {/* Background glow */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="font-display text-xs tracking-[0.3em] text-lp-neon-green mb-5">
          {/* // */} GET EARLY ACCESS
        </div>
        <h2
          className="font-display font-black uppercase leading-[1.1] mb-5"
          style={{ fontSize: "clamp(28px, 4.5vw, 56px)" }}
        >
          Ready to{" "}
          <span className="lp-gradient-text">Dominate</span>
          <br />
          the Sky?
        </h2>
        <p className="text-lp-text-secondary text-base leading-relaxed mb-12">
          Join 850+ enterprise clients who trust VECTR for mission-critical
          operations. Secure early access and get a personalized fleet demo.
        </p>

        {status === "success" ? (
          <div
            className="py-6 px-10 bg-lp-neon-green/10 border border-lp-neon-green/30 inline-block"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
            }}
          >
            <div className="font-display text-sm text-lp-neon-green tracking-widest">
              ACCESS REQUEST RECEIVED
            </div>
            <div className="text-lp-text-secondary text-sm mt-2">
              Our team will contact you within 24 hours.
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="cta-form flex max-w-lg mx-auto"
            style={{
              animation: shake ? "lp-shake 0.4s ease" : "none",
            }}
          >
            <input
              type="email"
              placeholder="your@organization.mil"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              className="flex-1 bg-white/5 border border-lp-neon-green/30 border-r-0 px-5 py-3.5 text-lp-text-primary font-body text-sm outline-none transition-[border-color] duration-200 focus:border-lp-neon-green/60"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
              }}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="font-display text-xs tracking-[0.15em] uppercase text-lp-bg-primary font-bold px-7 py-3.5 border-none whitespace-nowrap transition-[box-shadow,background] duration-200 hover:shadow-[0_0_25px_var(--lp-neon-green-glow)] disabled:cursor-not-allowed"
              style={{
                background: status === "loading" ? "rgba(0,255,136,0.6)" : "var(--lp-neon-green)",
                clipPath:
                  "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
              }}
            >
              {status === "loading" ? "Sending..." : "Get Early Access"}
            </button>
          </form>
        )}

        <p className="text-lp-text-muted text-sm mt-5">
          No credit card required. Enterprise pricing available. ITAR compliant.
        </p>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .cta-form {
            flex-direction: column !important;
          }
          .cta-form input {
            border-right: 1px solid rgba(0,255,136,0.3) !important;
            clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)) !important;
          }
        }
      `}</style>
    </section>
  );
}
