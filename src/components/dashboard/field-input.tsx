"use client";

import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface FieldInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  size?: "sm" | "md";
}

export function FieldInput({ label, className, size = "md", ...props }: FieldInputProps) {
  const sizeClasses = size === "sm"
    ? "px-2 py-1 text-[11px]"
    : "px-3 py-1.5 text-[12px]";

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-mono text-[10px] tracking-[.06em] text-[#555] uppercase">
          {label}
        </label>
      )}
      <input
        className={cn(
          "bg-[#080808] border border-[#252525] rounded-md font-mono text-foreground",
          "placeholder:text-[#3a3a3a]",
          "focus:outline-none focus:border-[#555] focus:ring-1 focus:ring-[#555]/25",
          "transition-all duration-150",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          sizeClasses,
          className,
        )}
        {...props}
      />
    </div>
  );
}
