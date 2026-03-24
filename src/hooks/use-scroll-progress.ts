"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function useScrollProgress() {
  const [scrollY, setScrollY] = useState(0);
  const ticking = useRef(false);

  const onScroll = useCallback(() => {
    if (!ticking.current) {
      ticking.current = true;
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking.current = false;
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return scrollY;
}

/** Compute normalized progress (0-1) for a scroll range */
export function progress(scrollY: number, start: number, end: number): number {
  return Math.max(0, Math.min(1, (scrollY - start) / (end - start)));
}
