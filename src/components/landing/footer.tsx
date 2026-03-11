"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        background: "var(--lp-bg-secondary)",
        borderTop: "1px solid rgba(0, 255, 136, 0.1)",
        padding: "60px 40px 40px",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 40,
            marginBottom: 40,
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <div
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: 24,
                fontWeight: 900,
                background: "var(--lp-gradient-main)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: 16,
              }}
            >
              VECTR
            </div>
            <p
              style={{
                color: "var(--lp-text-secondary)",
                fontSize: 14,
                lineHeight: 1.7,
                maxWidth: 280,
              }}
            >
              Next-generation autonomous drone fleet management for defense,
              enterprise, and critical infrastructure.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: 11,
                letterSpacing: "0.15em",
                color: "var(--lp-neon-green)",
                marginBottom: 20,
                textTransform: "uppercase",
              }}
            >
              Product
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {["Fleet OS", "Autonomy Engine", "Command Center", "API Access"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    style={{
                      color: "var(--lp-text-secondary)",
                      textDecoration: "none",
                      fontSize: 14,
                      transition: "color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      ((e.target as HTMLElement).style.color = "var(--lp-text-primary)")
                    }
                    onMouseOut={(e) =>
                      ((e.target as HTMLElement).style.color = "var(--lp-text-secondary)")
                    }
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: 11,
                letterSpacing: "0.15em",
                color: "var(--lp-neon-green)",
                marginBottom: 20,
                textTransform: "uppercase",
              }}
            >
              Company
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {["About", "Careers", "Press", "Security"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    style={{
                      color: "var(--lp-text-secondary)",
                      textDecoration: "none",
                      fontSize: 14,
                      transition: "color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      ((e.target as HTMLElement).style.color = "var(--lp-text-primary)")
                    }
                    onMouseOut={(e) =>
                      ((e.target as HTMLElement).style.color = "var(--lp-text-secondary)")
                    }
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: 11,
                letterSpacing: "0.15em",
                color: "var(--lp-neon-green)",
                marginBottom: 20,
                textTransform: "uppercase",
              }}
            >
              Resources
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {["Documentation", "SDK Reference", "Case Studies", "Status"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    style={{
                      color: "var(--lp-text-secondary)",
                      textDecoration: "none",
                      fontSize: 14,
                      transition: "color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      ((e.target as HTMLElement).style.color = "var(--lp-text-primary)")
                    }
                    onMouseOut={(e) =>
                      ((e.target as HTMLElement).style.color = "var(--lp-text-secondary)")
                    }
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <p style={{ color: "var(--lp-text-muted)", fontSize: 13 }}>
            &copy; 2026 VECTR Technologies AG. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <Link
                key={item}
                href="#"
                style={{
                  color: "var(--lp-text-muted)",
                  textDecoration: "none",
                  fontSize: 13,
                  transition: "color 0.2s",
                }}
                onMouseOver={(e) =>
                  ((e.target as HTMLElement).style.color = "var(--lp-text-secondary)")
                }
                onMouseOut={(e) =>
                  ((e.target as HTMLElement).style.color = "var(--lp-text-muted)")
                }
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
