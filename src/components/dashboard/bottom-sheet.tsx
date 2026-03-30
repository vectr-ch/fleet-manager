"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Max width for desktop centered modal (default: "max-w-md") */
  maxWidth?: string;
}

export function BottomSheet({ open, onClose, children, maxWidth = "max-w-md" }: BottomSheetProps) {
  const isMobile = useIsMobile();

  // Lock body scroll and handle Escape key when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", handleKey);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleKey);
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-[#252525] rounded-t-2xl animate-slide-up max-h-[85vh] overflow-y-auto">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-9 h-1 rounded-full bg-[#333]" />
          </div>
          {children}
        </div>
      </div>
    );
  }

  // Desktop: centered modal (same as existing pattern)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className={`bg-[#0f0f0f] border border-[#252525] rounded-lg p-6 ${maxWidth} w-full mx-4 shadow-2xl`}>
        {children}
      </div>
    </div>
  );
}
