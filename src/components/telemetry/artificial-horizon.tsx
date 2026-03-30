"use client";

import { useRef, useEffect } from "react";

interface ArtificialHorizonProps {
  rollDeg: number;
  pitchDeg: number;
  size?: number;
}

export function ArtificialHorizon({ rollDeg, pitchDeg, size = 110 }: ArtificialHorizonProps) {
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

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    const roll = (rollDeg * Math.PI) / 180;
    const pitchOffset = (pitchDeg / 30) * r;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-roll);

    // Sky
    ctx.fillStyle = "#1e3a5f";
    ctx.fillRect(-r * 2, -r * 2, r * 4, r * 2 + pitchOffset);

    // Ground
    ctx.fillStyle = "#5c3a1a";
    ctx.fillRect(-r * 2, pitchOffset, r * 4, r * 2);

    // Horizon line
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 2, pitchOffset);
    ctx.lineTo(r * 2, pitchOffset);
    ctx.stroke();

    // Pitch ladder
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    for (const deg of [-10, 10]) {
      const y = pitchOffset - (deg / 30) * r;
      ctx.beginPath();
      ctx.moveTo(-18, y);
      ctx.lineTo(18, y);
      ctx.stroke();
    }

    ctx.restore();

    // Center reference (aircraft symbol)
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    // Left wing
    ctx.beginPath();
    ctx.moveTo(cx - 28, cy);
    ctx.lineTo(cx - 12, cy);
    ctx.lineTo(cx - 12, cy + 4);
    ctx.stroke();
    // Right wing
    ctx.beginPath();
    ctx.moveTo(cx + 28, cy);
    ctx.lineTo(cx + 12, cy);
    ctx.lineTo(cx + 12, cy + 4);
    ctx.stroke();
    // Center dot
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Outer ring
    ctx.strokeStyle = "#252525";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }, [rollDeg, pitchDeg, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
    />
  );
}
