"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/overview", key: "overview" },
  { href: "/missions", key: "missions" },
  { href: "/fleet", key: "fleet" },
  { href: "/bases", key: "bases" },
  { href: "/telemetry", key: "telemetry" },
  { href: "/audit", key: "audit" },
] as const;

const TEAMS = [
  { id: "bravo", label: "Bravo Team", color: "bg-fleet-blue" },
  { id: "alpha", label: "Alpha Team", color: "bg-fleet-green" },
  { id: "delta", label: "Delta Team", color: "bg-fleet-amber" },
];

export function Topbar() {
  const pathname = usePathname();
  const t = useTranslations("topbar");
  const tc = useTranslations("common");
  const [teamOpen, setTeamOpen] = useState(false);
  const [activeTeam, setActiveTeam] = useState(TEAMS[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTeamOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-11 border-b border-border bg-card flex items-center px-4 shrink-0">
      {/* Logo */}
      <div className="font-mono text-[13px] font-semibold tracking-wider text-foreground uppercase pr-5 border-r border-input mr-5">
        {tc("appName")} <span className="text-subtle font-light">/ {tc("appSuffix")}</span>
      </div>

      {/* Org selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setTeamOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1 border border-input rounded-[5px] font-mono hover:border-muted hover:text-foreground transition-colors"
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", activeTeam.color)} />
          {activeTeam.label}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={cn("transition-transform", teamOpen && "rotate-180")}>
            <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
        {teamOpen && (
          <div className="absolute top-full left-0 mt-1 w-44 bg-card border border-input rounded-[5px] shadow-lg z-50 py-1">
            {TEAMS.map((team) => (
              <button
                key={team.id}
                onClick={() => { setActiveTeam(team); setTeamOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-xs font-mono transition-colors",
                  team.id === activeTeam.id
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-border hover:text-foreground"
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", team.color)} />
                {team.label}
                {team.id === activeTeam.id && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="ml-auto">
                    <path d="M2 5L4.5 7.5L8 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex gap-0.5 ml-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "text-xs text-muted-foreground px-2.5 py-1 rounded font-mono tracking-wide transition-colors",
                isActive && "text-foreground bg-secondary",
                !isActive && "hover:text-foreground hover:bg-border"
              )}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-fleet-green px-2 py-0.5 bg-fleet-green-dim border border-fleet-green/15 rounded-full">
          <span className="w-[5px] h-[5px] rounded-full bg-fleet-green animate-pulse" />
          BASE-01 {tc("online")}
        </div>
        <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-[#1e3a5f] to-fleet-blue border border-input flex items-center justify-center text-[10px] font-semibold text-white cursor-pointer">
          DK
        </div>
      </div>
    </header>
  );
}
