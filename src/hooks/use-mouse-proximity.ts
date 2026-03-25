"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface MousePosition {
  x: number;
  y: number;
  isNear: boolean;
}

export function useMouseProximity(radius: number = 150) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0, isNear: false });

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const isNear = x >= -radius && x <= rect.width + radius
                && y >= -radius && y <= rect.height + radius;
    setPosition({ x, y, isNear });
  }, [radius]);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

  return { ref, ...position };
}
