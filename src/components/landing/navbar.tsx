"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Fleet OS", href: "#fleet" },
  { label: "Autonomy", href: "#autonomy" },
  { label: "Network", href: "#network" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: "0 40px",
        height: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled
          ? "rgba(10, 10, 15, 0.95)"
          : "rgba(10, 10, 15, 0.6)",
        backdropFilter: "blur(20px)",
        borderBottom: scrolled
          ? "1px solid rgba(0, 255, 136, 0.15)"
          : "1px solid transparent",
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: "var(--lp-font-display)",
          fontSize: 22,
          fontWeight: 900,
          letterSpacing: "0.1em",
          background: "var(--lp-gradient-main)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          cursor: "default",
        }}
      >
        VECTR
      </div>

      {/* Nav links — hidden on mobile */}
      <ul
        className="lp-nav-links"
        style={{
          display: "flex",
          listStyle: "none",
          gap: 40,
          margin: 0,
          padding: 0,
        }}
      >
        {NAV_LINKS.map(({ label, href }) => (
          <li key={href}>
            <a
              href={href}
              onClick={(e) => handleNavClick(e, href)}
              style={{
                color: "var(--lp-text-secondary)",
                textDecoration: "none",
                fontFamily: "var(--lp-font-display)",
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) =>
                ((e.target as HTMLElement).style.color = "var(--lp-neon-green)")
              }
              onMouseOut={(e) =>
                ((e.target as HTMLElement).style.color = "var(--lp-text-secondary)")
              }
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href="/overview"
        style={{
          fontFamily: "var(--lp-font-display)",
          fontSize: 11,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--lp-bg-primary)",
          background: "var(--lp-neon-green)",
          padding: "10px 24px",
          textDecoration: "none",
          fontWeight: 700,
          clipPath:
            "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
          transition: "box-shadow 0.2s, background 0.2s",
        }}
        onMouseOver={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 0 20px var(--lp-neon-green-glow)";
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        Launch Console
      </Link>

      <style>{`
        @media (max-width: 768px) {
          .lp-nav-links { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
