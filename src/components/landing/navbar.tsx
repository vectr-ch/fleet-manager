"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
      className="fixed top-0 left-0 right-0 z-50 px-10 h-18 flex items-center justify-between backdrop-blur-xl"
      style={{
        background: scrolled
          ? "rgba(10, 10, 15, 0.95)"
          : "rgba(10, 10, 15, 0.6)",
        borderBottom: scrolled
          ? "1px solid rgba(0, 255, 136, 0.15)"
          : "1px solid transparent",
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      {/* Logo */}
      <div className="font-display text-xl font-black tracking-widest cursor-default lp-gradient-text">
        VECTR
      </div>

      {/* Nav links — hidden on mobile */}
      <ul className="lp-nav-links flex list-none gap-10 m-0 p-0">
        {NAV_LINKS.map(({ label, href }) => (
          <li key={href}>
            <a
              href={href}
              onClick={(e) => handleNavClick(e, href)}
              className="text-lp-text-secondary no-underline font-display text-xs tracking-[0.15em] uppercase transition-colors duration-200 hover:text-lp-neon-green"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href="/overview"
        className="font-display text-xs tracking-[0.15em] uppercase text-lp-bg-primary bg-lp-neon-green px-6 py-2.5 no-underline font-bold transition-[box-shadow] duration-200 hover:[box-shadow:0_0_20px_var(--lp-neon-green-glow)] lp-btn-clip"
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
