"use client";

import type { TelemetryFrame } from "@/lib/nats/types";

interface StatsRowProps {
  frames: Map<string, TelemetryFrame>;
}

export function StatsRow({ frames }: StatsRowProps) {
  const drones = Array.from(frames.values());
  const active = drones.length;

  const avgBattery =
    active > 0
      ? drones.reduce((sum, d) => sum + d.batteryPercent, 0) / active
      : 0;

  const gpsLocks = drones.filter(
    (d) => d.gps && d.gps.fixType >= 2
  ).length;

  const armedCount = drones.filter((d) => d.armed).length;

  const stats = [
    {
      label: "Active Drones",
      value: String(active),
      meta: active > 0 ? "reporting" : "none reporting",
      color: active > 0 ? "text-fleet-green" : "text-neutral-500",
    },
    {
      label: "Avg Battery",
      value: active > 0 ? `${avgBattery.toFixed(0)}%` : "—",
      meta:
        avgBattery > 50
          ? "nominal"
          : avgBattery > 20
            ? "low"
            : active > 0
              ? "critical"
              : "",
      color:
        avgBattery > 50
          ? "text-fleet-green"
          : avgBattery > 20
            ? "text-fleet-amber"
            : active > 0
              ? "text-fleet-red"
              : "text-neutral-500",
    },
    {
      label: "GPS Lock",
      value: active > 0 ? `${gpsLocks}/${active}` : "—",
      meta: gpsLocks === active && active > 0 ? "all locked" : "partial",
      color:
        gpsLocks === active && active > 0
          ? "text-fleet-green"
          : "text-fleet-amber",
    },
    {
      label: "Armed",
      value: String(armedCount),
      meta: armedCount > 0 ? "in flight" : "grounded",
      color: armedCount > 0 ? "text-fleet-green" : "text-neutral-500",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-px bg-[#1a1a1a] border-y border-[#1a1a1a] shrink-0">
      {stats.map((s) => (
        <div key={s.label} className="bg-[#0f0f0f] px-4 py-3 flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">
            {s.label}
          </span>
          <span className="font-mono text-[22px] font-semibold text-neutral-200 leading-none tracking-tight">
            {s.value}
          </span>
          <span className={`text-[11px] ${s.color}`}>{s.meta}</span>
        </div>
      ))}
    </div>
  );
}
