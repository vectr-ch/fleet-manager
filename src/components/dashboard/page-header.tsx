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
        <div className="text-[15px] font-semibold text-foreground tracking-tight">
          {t("fleetOverview")}
        </div>
        {mission && (
          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
            {mission.id} · {mission.name} · {Math.round(mission.coverage)}% complete · {mission.baseId}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="bg-card border-input text-muted-foreground hover:border-muted hover:text-foreground font-sans text-xs">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="mr-1">
            <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          {t("newMission")}
        </Button>
        <Button size="sm" className="bg-foreground text-background border-foreground font-semibold hover:bg-foreground/80 font-sans text-xs">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="mr-1">
            <path d="M3 5.5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("preFlightCheck")}
        </Button>
      </div>
    </div>
  );
}
