"use client";

import { useRef, useEffect } from "react";

interface SparklineChartProps {
  data: number[];
  label: string;
  unit: string;
  color: string;
  decimals?: number;
}

export function SparklineChart({
  data,
  label,
  unit,
  color,
  decimals = 1,
}: SparklineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const currentValue = data.length > 0 ? data[data.length - 1] : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;

    function draw() {
      const ctx = canvas!.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const W = canvas!.offsetWidth;
      const H = canvas!.offsetHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      ctx.scale(dpr, dpr);

      const min = Math.min(...data) - 1;
      const max = Math.max(...data) + 1;
      const range = max - min || 1;

      ctx.clearRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 1;
      for (const f of [0.25, 0.5, 0.75]) {
        ctx.beginPath();
        ctx.moveTo(0, H * f);
        ctx.lineTo(W, H * f);
        ctx.stroke();
      }

      // Gradient fill
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, color + "30");
      grad.addColorStop(1, color + "02");

      ctx.beginPath();
      data.forEach((v, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = H - ((v - min) / range) * H;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.lineJoin = "round";
      data.forEach((v, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = H - ((v - min) / range) * H;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Current value dot
      const lastVal = data[data.length - 1];
      const lx = W;
      const ly = H - ((lastVal - min) / range) * H;
      ctx.beginPath();
      ctx.arc(lx, ly, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [data, color]);

  return (
    <div className="bg-[#0f0f0f] flex flex-col overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#1a1a1a] flex justify-between items-center shrink-0">
        <span className="font-mono text-[11px] text-neutral-200 font-medium">
          {label}
        </span>
        <div>
          <span className="font-mono text-lg font-semibold text-neutral-200 tracking-tight">
            {currentValue !== null ? currentValue.toFixed(decimals) : "—"}
          </span>
          <span className="font-mono text-[11px] text-neutral-500 ml-1">
            {unit}
          </span>
        </div>
      </div>
      <div className="flex-1 px-4 py-2.5 relative min-h-[120px]">
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute bottom-2.5 left-4 right-4 flex justify-between font-mono text-[9px] text-neutral-600">
          <span>60s ago</span>
          <span>45s</span>
          <span>30s</span>
          <span>15s</span>
          <span>now</span>
        </div>
      </div>
    </div>
  );
}
