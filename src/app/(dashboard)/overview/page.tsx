"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatsRow } from "@/components/dashboard/stats-row";
import { MapPanel } from "@/components/map/map-panel";
import { RightPanel } from "@/components/dashboard/right-panel";

export default function OverviewPage() {
  return (
    <>
      <PageHeader />
      <StatsRow />
      <div className="grid grid-cols-[1fr_320px] grid-rows-[1fr] gap-px bg-border flex-1 min-h-0 overflow-hidden mt-px">
        <MapPanel />
        <RightPanel />
      </div>
    </>
  );
}
