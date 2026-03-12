"use client";

import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { NewMissionDialog } from "@/components/modals/new-mission-dialog";
import { PreflightCheckDialog } from "@/components/modals/preflight-check-dialog";

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
        <NewMissionDialog />
        <PreflightCheckDialog />
      </div>
    </div>
  );
}
