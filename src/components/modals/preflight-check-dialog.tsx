"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type CheckStatus = "pending" | "running" | "pass" | "fail";

interface CheckItem {
  key: string;
  status: CheckStatus;
}

export function PreflightCheckDialog() {
  const t = useTranslations("dashboard");
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [running, setRunning] = useState(false);

  const { data: drones } = trpc.drones.list.useQuery();
  const { data: baseStations } = trpc.baseStations.useQuery();
  const { data: meshLinks } = trpc.meshLinks.useQuery();

  const initialChecks: CheckItem[] = [
    { key: "Battery", status: "pending" },
    { key: "Mesh", status: "pending" },
    { key: "Gps", status: "pending" },
    { key: "Base", status: "pending" },
    { key: "Weather", status: "pending" },
    { key: "Comms", status: "pending" },
  ];

  const runChecks = useCallback(() => {
    setRunning(true);
    setChecks(initialChecks.map((c) => ({ ...c, status: "pending" })));

    // Simulate sequential checks with real data
    const results: CheckStatus[] = [
      // Battery: pass if all drones above 15%
      drones?.every((d) => d.battery > 15) ? "pass" : "fail",
      // Mesh: pass if links exist
      (meshLinks?.length ?? 0) > 0 ? "pass" : "fail",
      // GPS: always pass (simulated)
      "pass",
      // Base station: pass if any online
      baseStations?.some((b) => b.status === "online") ? "pass" : "fail",
      // Weather: always pass (simulated)
      "pass",
      // Comms: always pass (simulated)
      "pass",
    ];

    results.forEach((result, i) => {
      setTimeout(() => {
        setChecks((prev) =>
          prev.map((c, j) =>
            j === i ? { ...c, status: "running" } : c
          )
        );
        setTimeout(() => {
          setChecks((prev) =>
            prev.map((c, j) =>
              j === i ? { ...c, status: result } : c
            )
          );
          if (i === results.length - 1) setRunning(false);
        }, 300 + Math.random() * 200);
      }, i * 500);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drones, meshLinks, baseStations]);

  const handleOpen = (open: boolean) => {
    if (open) {
      setChecks(initialChecks);
      setTimeout(runChecks, 400);
    }
  };

  const allDone = checks.length > 0 && checks.every((c) => c.status === "pass" || c.status === "fail");
  const allPassed = allDone && checks.every((c) => c.status === "pass");

  const checkLabels: Record<string, { label: string; desc: string }> = {
    Battery: { label: t("checkBattery"), desc: t("checkBatteryDesc") },
    Mesh: { label: t("checkMesh"), desc: t("checkMeshDesc") },
    Gps: { label: t("checkGps"), desc: t("checkGpsDesc") },
    Base: { label: t("checkBase"), desc: t("checkBaseDesc") },
    Weather: { label: t("checkWeather"), desc: t("checkWeatherDesc") },
    Comms: { label: t("checkComms"), desc: t("checkCommsDesc") },
  };

  return (
    <AlertDialog onOpenChange={handleOpen}>
      <AlertDialogTrigger
        render={
          <Button size="sm" className="bg-foreground text-background border-foreground font-semibold hover:bg-foreground/80 font-sans text-xs">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="mr-1">
              <path d="M3 5.5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t("preFlightCheck")}
          </Button>
        }
      />
      <AlertDialogContent className="bg-card border-input max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground text-sm">{t("preFlightTitle")}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-xs">{t("preFlightDesc")}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-1">
          {checks.map((check) => {
            const info = checkLabels[check.key];
            return (
              <div
                key={check.key}
                className="flex items-center gap-3 px-3 py-2 rounded-[5px] bg-background border border-border"
              >
                {/* Status indicator */}
                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                  {check.status === "pending" && (
                    <div className="w-2 h-2 rounded-full bg-subtle" />
                  )}
                  {check.status === "running" && (
                    <div className="w-3 h-3 rounded-full border-2 border-fleet-blue border-t-transparent animate-spin" />
                  )}
                  {check.status === "pass" && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" fill="#22c55e20" stroke="#22c55e" strokeWidth="1.2" />
                      <path d="M4.5 7l1.5 1.5 3.5-3.5" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {check.status === "fail" && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" fill="#ef444420" stroke="#ef4444" strokeWidth="1.2" />
                      <path d="M5 5l4 4M9 5l-4 4" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                {/* Label */}
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[11px] text-foreground">{info?.label}</div>
                  <div className="font-mono text-[10px] text-subtle">{info?.desc}</div>
                </div>
                {/* Status badge */}
                {(check.status === "pass" || check.status === "fail") && (
                  <span
                    className={cn(
                      "font-mono text-[9px] tracking-wider uppercase font-semibold px-1.5 py-0.5 rounded",
                      check.status === "pass"
                        ? "text-fleet-green bg-fleet-green-dim"
                        : "text-fleet-red bg-fleet-red-dim"
                    )}
                  >
                    {check.status === "pass" ? t("checkPassed") : t("checkFailed")}
                  </span>
                )}
                {check.status === "running" && (
                  <span className="font-mono text-[9px] tracking-wider text-fleet-blue">{t("checkRunning")}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {allDone && (
          <div
            className={cn(
              "px-3 py-2 rounded-[5px] border font-mono text-[10px]",
              allPassed
                ? "bg-fleet-green-dim border-fleet-green/20 text-fleet-green"
                : "bg-fleet-red-dim border-fleet-red/20 text-fleet-red"
            )}
          >
            {allPassed ? t("allChecksPassed") : t("checksHaveFailed")}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>{t("close")}</AlertDialogCancel>
          {allPassed && (
            <AlertDialogCancel
              variant="default"
              className="bg-fleet-green text-white hover:bg-fleet-green/80 border-fleet-green"
            >
              {t("deployMission")}
            </AlertDialogCancel>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
