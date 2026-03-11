"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";

export function PageHeader() {
  const t = useTranslations("dashboard");
  const { data: mission } = trpc.missions.active.useQuery(undefined, { refetchInterval: 2000 });

  return (
    <div className="px-5 pt-4 flex items-start justify-between shrink-0">
      <div>
        <div className="text-[15px] font-semibold text-text tracking-tight">
          {t("fleetOverview")}
        </div>
        {mission && (
          <div className="text-[11px] text-text-dim font-mono mt-0.5">
            {mission.id} · {mission.name} · {Math.round(mission.coverage)}% complete · {mission.baseId}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="bg-surface border-border2 text-text-dim hover:border-muted hover:text-text font-sans text-xs">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="mr-1">
            <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          {t("newMission")}
        </Button>
        <Button size="sm" className="bg-text text-bg border-text font-semibold hover:bg-text/80 font-sans text-xs">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="mr-1">
            <path d="M3 5.5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("preFlightCheck")}
        </Button>
      </div>
    </div>
  );
}
