"use client";

import { useRef, useEffect } from "react";

interface CompassRoseProps {
  headingDeg: number;
  size?: number;
}

export function CompassRose({ headingDeg, size = 110 }: CompassRoseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 4;

    ctx.clearRect(0, 0, size, size);

    // Outer ring
    ctx.strokeStyle = "#252525";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Background
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();
    ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((-headingDeg * Math.PI) / 180);

    // Cardinal ticks and labels
    const dirs: { a: number; l: string; c: string }[] = [
      { a: 0, l: "N", c: "#ef4444" },
      { a: 90, l: "E", c: "#888" },
      { a: 180, l: "S", c: "#888" },
      { a: 270, l: "W", c: "#888" },
    ];

    for (const d of dirs) {
      ctx.save();
      ctx.rotate((d.a * Math.PI) / 180);
      ctx.strokeStyle = d.c;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -r + 4);
      ctx.lineTo(0, -r + 14);
      ctx.stroke();
      ctx.fillStyle = d.c;
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(d.l, 0, -r + 26);
      ctx.restore();
    }

    // Minor ticks
    for (let i = 0; i < 360; i += 30) {
      if (i % 90 === 0) continue;
      ctx.save();
      ctx.rotate((i * Math.PI) / 180);
      ctx.strokeStyle = "#3a3a3a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -r + 4);
      ctx.lineTo(0, -r + 11);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    // Fixed heading pointer (triangle at top)
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.moveTo(cx, cy - r + 1);
    ctx.lineTo(cx - 5, cy - r - 8);
    ctx.lineTo(cx + 5, cy - r - 8);
    ctx.closePath();
    ctx.fill();

    // Center dot
    ctx.fillStyle = "#555";
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  }, [headingDeg, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
    />
  );
}
