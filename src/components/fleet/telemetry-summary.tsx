"use client";

import { useTranslations } from "next-intl";
import type { Drone } from "@/lib/types";

export function TelemetrySummary({ drones }: { drones: Drone[] }) {
  const t = useTranslations("fleet");

  const avgBattery = drones.length
    ? Math.round(drones.reduce((sum, d) => sum + d.battery, 0) / drones.length)
    : 0;

  return (
    <div className="grid grid-cols-3 gap-1.5 px-3.5 pb-2.5">
      <div className="bg-bg border border-border rounded px-2 py-1.5">
        <div className="font-mono text-[9px] text-subtle uppercase tracking-wider">{t("avgBat")}</div>
        <div className="font-mono text-sm font-semibold text-text mt-0.5">
          {avgBattery}<span className="text-[9px] text-subtle font-normal">%</span>
        </div>
      </div>
      <div className="bg-bg border border-border rounded px-2 py-1.5">
        <div className="font-mono text-[9px] text-subtle uppercase tracking-wider">{t("meshRtt")}</div>
        <div className="font-mono text-sm font-semibold text-text mt-0.5">
          14<span className="text-[9px] text-subtle font-normal">ms</span>
        </div>
      </div>
      <div className="bg-bg border border-border rounded px-2 py-1.5">
        <div className="font-mono text-[9px] text-subtle uppercase tracking-wider">{t("uplink")}</div>
        <div className="font-mono text-sm font-semibold text-fleet-green mt-0.5">OK</div>
      </div>
    </div>
  );
}
