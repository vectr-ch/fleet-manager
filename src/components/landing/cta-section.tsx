"use client";

import { useState } from "react";

export function CtaSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      setError(true);
      return;
    }
    setError(false);
    setSubmitted(true);
  }

  return (
    <section
      style={{
        padding: "80px clamp(40px, 10vw, 140px)",
        borderTop: "1px solid var(--lp-border-subtle)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--lp-font-mono)",
          fontSize: "10px",
          color: "var(--lp-text-faint)",
          letterSpacing: "4px",
          textTransform: "uppercase",
          marginBottom: "24px",
        }}
      >
        STAY IN THE LOOP
      </div>
      <p
        style={{
          fontSize: "15px",
          color: "var(--lp-text-muted)",
          lineHeight: 1.8,
          maxWidth: "520px",
          margin: 0,
        }}
      >
        We&apos;re early. If this resonates, leave your email — we&apos;ll reach out when
        there&apos;s something to show.
      </p>

      {submitted ? (
        <p
          style={{
            marginTop: "24px",
            fontSize: "13px",
            color: "var(--lp-text-secondary)",
            fontFamily: "var(--lp-font-mono)",
            letterSpacing: "1px",
          }}
        >
          Thanks — we&apos;ll be in touch.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "24px",
            maxWidth: "400px",
          }}
        >
          <input
            type="text"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(false);
            }}
            placeholder="your@email.com"
            style={{
              flex: 1,
              padding: "10px 16px",
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${error ? "rgba(255,100,100,0.4)" : "var(--lp-bg-tertiary)"}`,
              color: "var(--lp-text-secondary)",
              fontSize: "13px",
              outline: "none",
              borderRadius: "2px",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 24px",
              background: "transparent",
              border: "1px solid var(--lp-bg-tertiary)",
              color: "var(--lp-text-muted)",
              fontSize: "12px",
              letterSpacing: "1px",
              cursor: "pointer",
              borderRadius: "2px",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--lp-text-muted)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--lp-text-secondary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--lp-bg-tertiary)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--lp-text-muted)";
            }}
          >
            Notify me
          </button>
        </form>
      )}
    </section>
  );
}
