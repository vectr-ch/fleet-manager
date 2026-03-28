"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className={cn("inline-flex items-center gap-2 cursor-pointer select-none", disabled && "opacity-50 pointer-events-none")}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-4 w-7 shrink-0 items-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#555]/50",
          checked
            ? "bg-fleet-amber/25 border-fleet-amber/40"
            : "bg-[#1a1a1a] border-[#252525]",
        )}
      >
        <span
          className={cn(
            "pointer-events-none block size-2.5 rounded-full transition-all duration-200",
            checked
              ? "translate-x-3 bg-fleet-amber"
              : "translate-x-0.5 bg-[#555]",
          )}
        />
      </button>
      {label && (
        <span className={cn("font-mono text-[10px]", checked ? "text-fleet-amber" : "text-[#555]")}>
          {label}
        </span>
      )}
    </label>
  );
}
