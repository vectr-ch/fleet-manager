"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ── SummaryCard ───────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: string | number;
  unit?: string;
  valueColor?: string;
  meta?: React.ReactNode;
}

export function SummaryCard({ label, value, unit, valueColor, meta }: SummaryCardProps) {
  return (
    <div className="bg-card px-4 py-3 flex flex-col gap-1">
      <div className="font-mono text-[10px] tracking-wider text-subtle uppercase">{label}</div>
      <div className={cn("font-mono text-[22px] font-semibold leading-none tracking-tight", valueColor ?? "text-foreground")}>
        {value}
        {unit && <span className="text-sm text-subtle ml-0.5">{unit}</span>}
      </div>
      {meta && (
        <div className="text-[11px] text-muted-foreground flex items-center gap-1">{meta}</div>
      )}
    </div>
  );
}

// ── SummaryCardGrid ───────────────────────────────────────────────────────────

interface SummaryCardGridProps {
  columns?: number;
  children: React.ReactNode;
}

export function SummaryCardGrid({ columns, children }: SummaryCardGridProps) {
  const cols = columns ?? React.Children.count(children);
  return (
    <div
      className="grid gap-px bg-border border-y border-border shrink-0"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
}
