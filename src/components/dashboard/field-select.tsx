"use client";

import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

interface FieldSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  size?: "sm" | "md";
}

export function FieldSelect({ label, className, size = "md", children, ...props }: FieldSelectProps) {
  const sizeClasses = size === "sm"
    ? "px-2 py-1.5 md:py-1 text-[11px]"
    : "px-3 py-2.5 md:py-1.5 text-[12px]";

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-mono text-[10px] tracking-[.06em] text-[#555] uppercase">
          {label}
        </label>
      )}
      <select
        className={cn(
          "bg-[#080808] border border-[#252525] rounded-md font-mono text-foreground",
          "focus:outline-none focus:border-[#555] focus:ring-1 focus:ring-[#555]/25",
          "transition-all duration-150",
          "[&>option]:bg-[#0f0f0f]",
          sizeClasses,
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
