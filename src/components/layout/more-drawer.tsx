"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const drawerItems = [
  { key: "overview", href: "/overview" },
  { key: "missions", href: "/missions" },
  { key: "telemetry", href: "/telemetry" },
  { key: "auditLog", href: "/audit" },
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
              <span className={cn("w-4 h-4 rounded bg-[#1a1a1a] shrink-0", isActive && "bg-[#252525]")} />
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
          <span className={cn("w-4 h-4 rounded bg-[#1a1a1a] shrink-0", pathname.startsWith("/settings") && "bg-[#252525]")} />
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
