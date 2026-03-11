"use client";

import { useTranslations } from "next-intl";
import type { Mission } from "@/lib/types";

interface MapOverlaysProps {
  mission: Mission | null;
}

export function MapOverlays({ mission }: MapOverlaysProps) {
  const t = useTranslations("map");

  return (
    <>
      {/* Top-left info chips */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-[1000]">
        <div className="flex items-center gap-1.5 bg-[#0a0a0acc] border border-input rounded px-2 py-1.5 font-mono text-[10px] text-muted-foreground backdrop-blur-sm">
          <span>{t("wind")}</span>
          <span className="text-foreground font-medium">12 kt NNE</span>
          <span className="text-fleet-green">●</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#0a0a0acc] border border-input rounded px-2 py-1.5 font-mono text-[10px] text-muted-foreground backdrop-blur-sm">
          <span>{t("alt")}</span>
          <span className="text-foreground font-medium">120 m AGL</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#0a0a0acc] border border-input rounded px-2 py-1.5 font-mono text-[10px] text-muted-foreground backdrop-blur-sm">
          <span>{t("gps")}</span>
          <span className="text-foreground text-fleet-green font-medium">8/8 locked</span>
        </div>
      </div>

      {/* Mission progress bar (bottom-left) */}
      {mission && (
        <div className="absolute bottom-3 left-3 flex items-center gap-2.5 bg-[#0a0a0aee] border border-input rounded-[5px] px-3 py-2 font-mono text-[10px] z-[1000] backdrop-blur-lg">
          <span className="text-foreground font-medium text-[11px]">{mission.id}</span>
          <span className="text-border2">·</span>
          <span className="text-muted-foreground">{mission.name}</span>
          <span className="text-border2">·</span>
          <div className="w-20 h-[3px] bg-secondary rounded-sm overflow-hidden">
            <div
              className="h-full bg-fleet-green rounded-sm relative overflow-hidden"
              style={{ width: `${mission.coverage}%` }}
            >
              <div className="absolute top-0 left-[-100%] right-0 bottom-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
          </div>
          <span className="text-fleet-green font-semibold">{Math.round(mission.coverage)}%</span>
          <span className="text-border2">·</span>
          <span className="text-muted-foreground">{mission.eta}m ETA</span>
        </div>
      )}
    </>
  );
}
