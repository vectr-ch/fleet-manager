"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc/client";
import { FleetPanel } from "@/components/fleet/fleet-panel";
import { AlertList } from "@/components/alerts/alert-list";
import { CommandGrid } from "@/components/commands/command-grid";
import { CommandLog } from "@/components/commands/command-log";

export function RightPanel() {
  const tf = useTranslations("fleet");
  const ta = useTranslations("alerts");
  const tc = useTranslations("commands");
  const ts = useTranslations("swarmHealth");

  const { data: alerts } = trpc.alerts.list.useQuery(undefined, { refetchInterval: 5000 });
  const { data: baseStations } = trpc.baseStations.useQuery(undefined, { refetchInterval: 5000 });

  const alertCount = alerts?.filter((a) => a.severity !== "info").length ?? 0;
  const baseLatency = baseStations?.[0]?.uplinkLatency ?? 0;

  return (
    <div className="bg-card flex flex-col overflow-hidden h-full">
      <Tabs defaultValue="fleet" className="flex flex-col flex-1 overflow-hidden gap-0">
        <TabsList variant="line" className="flex w-full border-b border-border shrink-0 bg-transparent rounded-none h-auto p-0">
          <TabsTrigger
            value="fleet"
            className="flex-1 py-2.5 text-center font-mono text-[10px] tracking-wider text-subtle uppercase rounded-none border-none bg-transparent data-active:bg-transparent data-active:text-foreground data-active:border-none data-active:shadow-none"
          >
            {tf("title")}
          </TabsTrigger>
          <TabsTrigger
            value="alerts"
            className="flex-1 py-2.5 text-center font-mono text-[10px] tracking-wider text-subtle uppercase rounded-none border-none bg-transparent data-active:bg-transparent data-active:text-foreground data-active:border-none data-active:shadow-none"
          >
            {ta("title")}
          </TabsTrigger>
          <TabsTrigger
            value="commands"
            className="flex-1 py-2.5 text-center font-mono text-[10px] tracking-wider text-subtle uppercase rounded-none border-none bg-transparent data-active:bg-transparent data-active:text-foreground data-active:border-none data-active:shadow-none"
          >
            {tc("title")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="flex-1 flex flex-col overflow-hidden mt-0">
          <FleetPanel />
        </TabsContent>

        <TabsContent value="alerts" className="flex-1 overflow-y-auto mt-0 scrollbar-thin">
          <AlertList />
        </TabsContent>

        <TabsContent value="commands" className="flex-1 overflow-y-auto mt-0 scrollbar-thin">
          <CommandGrid />
          <CommandLog />
        </TabsContent>
      </Tabs>

      {/* Swarm health footer */}
      <div className="grid grid-cols-4 gap-px bg-border border-t border-border shrink-0 mt-auto">
        {[
          { label: ts("swarm"), value: "Nominal", color: "text-fleet-green" },
          { label: ts("baseLink"), value: `${baseLatency}ms`, color: "text-fleet-green" },
          { label: ts("cloud"), value: "Online", color: "text-fleet-green" },
          { label: ts("alerts"), value: `${alertCount} active`, color: alertCount > 0 ? "text-fleet-amber" : "text-fleet-green" },
        ].map((cell) => (
          <div key={cell.label} className="bg-card px-3.5 py-2 flex flex-col gap-1">
            <div className="font-mono text-[9px] text-subtle uppercase tracking-wider">{cell.label}</div>
            <div className={`font-mono text-[13px] font-semibold tracking-tight ${cell.color}`}>{cell.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
