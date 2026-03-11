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
      style={{
        padding: "140px 40px",
        background: "var(--lp-bg-secondary)",
        borderTop: "1px solid rgba(0, 255, 136, 0.08)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
        <div
          style={{
            fontFamily: "var(--lp-font-display)",
            fontSize: 11,
            letterSpacing: "0.3em",
            color: "var(--lp-neon-green)",
            marginBottom: 20,
          }}
        >
          // GET EARLY ACCESS
        </div>
        <h2
          style={{
            fontFamily: "var(--lp-font-display)",
            fontSize: "clamp(28px, 4.5vw, 56px)",
            fontWeight: 900,
            textTransform: "uppercase",
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          Ready to{" "}
          <span className="lp-gradient-text">Dominate</span>
          <br />
          the Sky?
        </h2>
        <p
          style={{
            color: "var(--lp-text-secondary)",
            fontSize: 16,
            lineHeight: 1.7,
            marginBottom: 48,
          }}
        >
          Join 850+ enterprise clients who trust VECTR for mission-critical
          operations. Secure early access and get a personalized fleet demo.
        </p>

        {status === "success" ? (
          <div
            style={{
              padding: "24px 40px",
              background: "rgba(0,255,136,0.08)",
              border: "1px solid rgba(0,255,136,0.3)",
              clipPath:
                "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              display: "inline-block",
            }}
          >
            <div
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: 14,
                color: "var(--lp-neon-green)",
                letterSpacing: "0.1em",
              }}
            >
              ACCESS REQUEST RECEIVED
            </div>
            <div style={{ color: "var(--lp-text-secondary)", fontSize: 14, marginTop: 8 }}>
              Our team will contact you within 24 hours.
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="cta-form"
            style={{
              display: "flex",
              gap: 0,
              maxWidth: 520,
              margin: "0 auto",
              animation: shake ? "lp-shake 0.4s ease" : "none",
            }}
          >
            <input
              type="email"
              placeholder="your@organization.mil"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(0,255,136,0.3)",
                borderRight: "none",
                padding: "14px 20px",
                color: "var(--lp-text-primary)",
                fontFamily: "var(--lp-font-body)",
                fontSize: 15,
                outline: "none",
                clipPath:
                  "polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(0,255,136,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(0,255,136,0.3)")}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--lp-bg-primary)",
                background: status === "loading" ? "rgba(0,255,136,0.6)" : "var(--lp-neon-green)",
                border: "none",
                padding: "14px 28px",
                cursor: status === "loading" ? "not-allowed" : "pointer",
                fontWeight: 700,
                clipPath:
                  "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                transition: "box-shadow 0.2s, background 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseOver={(e) => {
                if (status !== "loading")
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 0 25px var(--lp-neon-green-glow)";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {status === "loading" ? "Sending..." : "Get Early Access"}
            </button>
          </form>
        )}

        <p
          style={{
            color: "var(--lp-text-muted)",
            fontSize: 13,
            marginTop: 20,
          }}
        >
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
