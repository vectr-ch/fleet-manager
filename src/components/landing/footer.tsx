"use client";

const PRODUCT_LINKS = [
  { label: "Fleet OS", href: "#fleet" },
  { label: "Autonomy Engine", href: "#autonomy" },
  { label: "Command Center", href: "#network" },
  { label: "API Access", href: "#contact" },
];

const COMPANY_ITEMS = ["About", "Careers", "Press", "Security"];
const RESOURCE_ITEMS = ["Documentation", "SDK Reference", "Case Studies", "Status"];
const LEGAL_ITEMS = ["Privacy Policy", "Terms of Service", "Cookie Policy"];

export function Footer() {
  const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-lp-bg-secondary border-t border-lp-neon-green/10 px-10 pt-16 pb-10">
      <div className="max-w-[1400px] mx-auto">
        <div
          className="footer-grid grid grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-10"
        >
          {/* Brand */}
          <div>
            <div className="font-display text-2xl font-black lp-gradient-text mb-4">
              VECTR
            </div>
            <p className="text-lp-text-secondary text-sm leading-relaxed max-w-[280px]">
              Next-generation autonomous drone fleet management for defense,
              enterprise, and critical infrastructure.
            </p>
          </div>

          {/* Product — links to landing page sections */}
          <div>
            <h4 className="font-display text-xs tracking-[0.15em] text-lp-neon-green mb-5 uppercase">
              Product
            </h4>
            <ul className="list-none flex flex-col gap-3">
              {PRODUCT_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    onClick={(e) => handleScrollClick(e, href)}
                    className="text-lp-text-secondary hover:text-lp-text-primary transition-colors no-underline text-sm cursor-pointer"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company — static text, no links */}
          <div>
            <h4 className="font-display text-xs tracking-[0.15em] text-lp-neon-green mb-5 uppercase">
              Company
            </h4>
            <ul className="list-none flex flex-col gap-3">
              {COMPANY_ITEMS.map((item) => (
                <li key={item}>
                  <span className="text-lp-text-secondary text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources — static text, no links */}
          <div>
            <h4 className="font-display text-xs tracking-[0.15em] text-lp-neon-green mb-5 uppercase">
              Resources
            </h4>
            <ul className="list-none flex flex-col gap-3">
              {RESOURCE_ITEMS.map((item) => (
                <li key={item}>
                  <span className="text-lp-text-secondary text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex justify-between items-center flex-wrap gap-4">
          <p className="text-lp-text-muted text-sm">
            &copy; 2026 VECTR Technologies AG. All rights reserved.
          </p>
          <div className="flex gap-6">
            {LEGAL_ITEMS.map((item) => (
              <span
                key={item}
                className="text-lp-text-muted text-sm"
              >
                {item}
              </span>
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
