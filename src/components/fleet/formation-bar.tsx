"use client";

import { useTranslations } from "next-intl";
import type { Mission } from "@/lib/types";

export function FormationBar({ mission }: { mission: Mission }) {
  const t = useTranslations("fleet");

  return (
    <div className="px-3.5 py-2.5 border-b border-border">
      <div className="flex justify-between items-center mb-1.5">
        <div className="font-mono text-[10px] tracking-wider text-subtle uppercase">
          {t("formationIntegrity")}
        </div>
        <div className="font-mono text-[13px] font-semibold text-fleet-green">
          {mission.formationIntegrity}%
        </div>
      </div>
      <div className="h-1 bg-border2 rounded-sm overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-fleet-green to-green-300 rounded-sm"
          style={{ width: `${mission.formationIntegrity}%` }}
        />
      </div>
    </div>
  );
}
