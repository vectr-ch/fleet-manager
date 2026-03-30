"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const drawerItems = [
  {
    key: "overview",
    href: "/overview",
    icon: (
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="1" y="1" width="12" height="12" rx="1.5" />
        <path d="M4 7h6M7 4v6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "missions",
    href: "/missions",
    icon: (
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="7" cy="7" r="5.5" />
        <circle cx="7" cy="7" r="2.5" />
        <circle cx="7" cy="7" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "telemetry",
    href: "/telemetry",
    icon: (
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path d="M1 10l3-4 2.5 2L9 5l4 5" />
      </svg>
    ),
  },
  {
    key: "auditLog",
    href: "/audit",
    icon: (
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="2" y="1" width="10" height="12" rx="1.5" />
        <path d="M5 4.5h4M5 7h4M5 9.5h2.5" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

interface MoreDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MoreDrawer({ open, onClose }: MoreDrawerProps) {
  const pathname = usePathname();
  const t = useTranslations("mobileNav");

  useEffect(() => {
    if (open) {
      const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-[#252525] rounded-t-2xl animate-slide-up max-h-[70%] overflow-y-auto">
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-9 h-1 rounded-full bg-[#333]" />
        </div>
        <div className="font-mono text-[9px] tracking-[.08em] text-[#555] uppercase px-5 pt-2 pb-1.5">
          {t("pages")}
        </div>
        {drawerItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-5 py-3 text-[13px] transition-colors active:bg-[#ffffff06]",
                isActive ? "text-foreground" : "text-[#888]",
              )}
            >
              <span className={cn("w-3.5 h-3.5 shrink-0", isActive ? "opacity-100" : "opacity-50")}>
                {item.icon}
              </span>
              {t(item.key)}
            </Link>
          );
        })}
        <div className="h-px bg-[#1a1a1a] mx-5 my-1" />
        <Link
          href="/settings"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-5 py-3 text-[13px] transition-colors active:bg-[#ffffff06]",
            pathname.startsWith("/settings") ? "text-foreground" : "text-[#888]",
          )}
        >
          <span className={cn("w-3.5 h-3.5 shrink-0", pathname.startsWith("/settings") ? "opacity-100" : "opacity-50")}>
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="7" cy="7" r="2.5" />
              <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.75 2.75l1.06 1.06M10.19 10.19l1.06 1.06M11.25 2.75l-1.06 1.06M3.81 10.19l-1.06 1.06" strokeLinecap="round" />
            </svg>
          </span>
          {t("settings")}
        </Link>
        <div className="h-px bg-[#1a1a1a] mx-5 my-1" />
        <div className="flex items-center justify-between px-5 py-3 pb-8">
          <span className="font-mono text-[10px] text-[#444]">{t("firmware")}</span>
          <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-fleet-green-dim text-fleet-green border border-fleet-green/15">
            v1.0
          </span>
        </div>
      </div>
    </div>
  );
}
