"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function NewMissionDialog() {
  const t = useTranslations("dashboard");
  const [name, setName] = useState("");
  const [formation, setFormation] = useState("grid");
  const [altitude, setAltitude] = useState("45");
  const [droneCount, setDroneCount] = useState("8");
  const [scanPattern, setScanPattern] = useState("boustrophedon");
  const [status, setStatus] = useState<"idle" | "creating" | "created">("idle");

  const inputClass =
    "w-full bg-background border border-input rounded-[5px] px-2.5 py-1.5 font-mono text-[11px] text-foreground focus:outline-none focus:border-muted";

  const handleCreate = () => {
    setStatus("creating");
    setTimeout(() => setStatus("created"), 1200);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset on close
      setTimeout(() => {
        setName("");
        setFormation("grid");
        setAltitude("45");
        setDroneCount("8");
        setScanPattern("boustrophedon");
        setStatus("idle");
      }, 200);
    }
  };

  return (
    <AlertDialog onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm" className="bg-card border-input text-muted-foreground hover:border-muted hover:text-foreground font-sans text-xs">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="mr-1">
              <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            {t("newMission")}
          </Button>
        }
      />
      <AlertDialogContent className="bg-card border-input max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground text-sm">
            {status === "created" ? t("missionCreated") : t("newMissionTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-xs">
            {status === "created" ? t("missionCreatedDesc") : t("newMissionDesc")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {status === "created" ? (
          <div className="flex items-center gap-2 py-3 px-3 bg-fleet-green-dim border border-fleet-green/20 rounded-[5px]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#22c55e" strokeWidth="1.5" />
              <path d="M5 8l2 2 4-4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <div className="font-mono text-[11px] font-semibold text-fleet-green">{name || "Untitled Mission"}</div>
              <div className="font-mono text-[10px] text-muted-foreground">
                {formation.toUpperCase()} · {droneCount} drones · {altitude}m AGL
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <label className="font-mono text-[10px] tracking-wider text-subtle uppercase block mb-1">{t("missionName")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("missionNamePlaceholder")}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] tracking-wider text-subtle uppercase block mb-1">{t("formationType")}</label>
                <select value={formation} onChange={(e) => setFormation(e.target.value)} className={inputClass}>
                  <option value="grid">Grid</option>
                  <option value="line">Line</option>
                  <option value="orbit">Orbit</option>
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-wider text-subtle uppercase block mb-1">{t("scanPattern")}</label>
                <select value={scanPattern} onChange={(e) => setScanPattern(e.target.value)} className={inputClass}>
                  <option value="boustrophedon">{t("patternBoustrophedon")}</option>
                  <option value="spiral">{t("patternSpiral")}</option>
                  <option value="grid">{t("patternGrid")}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] tracking-wider text-subtle uppercase block mb-1">{t("altitude")}</label>
                <input type="number" value={altitude} onChange={(e) => setAltitude(e.target.value)} min={10} max={120} className={inputClass} />
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-wider text-subtle uppercase block mb-1">{t("droneCount")}</label>
                <input type="number" value={droneCount} onChange={(e) => setDroneCount(e.target.value)} min={1} max={100} className={inputClass} />
              </div>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>{status === "created" ? t("close") : "Cancel"}</AlertDialogCancel>
          {status !== "created" && (
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              disabled={status === "creating"}
              className={cn("bg-foreground text-background hover:bg-foreground/80")}
            >
              {status === "creating" ? t("creating") : t("createMission")}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
