"use client";

import { useEffect, useRef } from "react";

export function GlowCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      el.style.left = `${e.clientX - 150}px`;
      el.style.top = `${e.clientY - 150}px`;
      el.style.opacity = "1";
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };
    const onEnter = () => {
      el.style.opacity = "1";
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fixed w-[300px] h-[300px] rounded-full pointer-events-none z-50 opacity-0 transition-opacity duration-300 top-0 left-0"
      style={{
        background:
          "radial-gradient(circle, rgba(0, 255, 136, 0.06) 0%, transparent 70%)",
      }}
    />
  );
}
