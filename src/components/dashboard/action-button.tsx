"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ActionButtonVariant = "default" | "primary" | "green" | "amber" | "danger" | "ghost";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionButtonVariant;
  icon?: ReactNode;
  iconOnly?: boolean;
}

const variantClasses: Record<ActionButtonVariant, string> = {
  default:
    "border border-[#252525] text-[#666] hover:text-foreground hover:border-[#3a3a3a] hover:bg-[#ffffff06]",
  primary:
    "bg-foreground text-background font-medium hover:bg-foreground/80",
  green:
    "bg-fleet-green-dim text-fleet-green border border-fleet-green/15 hover:bg-fleet-green/15 hover:border-fleet-green/25",
  amber:
    "bg-fleet-amber-dim text-fleet-amber border border-fleet-amber/15 hover:bg-fleet-amber/15 hover:border-fleet-amber/25",
  danger:
    "border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30",
  ghost:
    "text-[#555] hover:text-foreground hover:bg-[#ffffff06]",
};

export function ActionButton({
  variant = "default",
  icon,
  iconOnly = false,
  className,
  children,
  ...props
}: ActionButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-mono text-[10px] tracking-wide",
        "disabled:opacity-50 disabled:pointer-events-none",
        "transition-all duration-150 active:scale-[0.97]",
        iconOnly ? "size-7" : "px-2.5 py-1.5",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {!iconOnly && children}
    </button>
  );
}
