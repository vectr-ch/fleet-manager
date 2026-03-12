"use client";

import { MapPanel } from "@/components/map/map-panel";
import { useTranslations } from "next-intl";

export default function MapPage() {
  const t = useTranslations("mapPage");

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Minimal header */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-[15px] font-semibold text-foreground tracking-tight">{t("title")}</div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-fleet-green-dim border border-fleet-green/20">
            <span className="w-1.5 h-1.5 rounded-full bg-fleet-green animate-pulse" />
            <span className="font-mono text-[10px] tracking-wider text-fleet-green uppercase">Live</span>
          </div>
        </div>
      </div>
      {/* Full-screen map */}
      <div className="flex-1 min-h-0">
        <MapPanel />
      </div>
    </div>
  );
}
