"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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

interface OrbitDialogProps {
  onConfirm: () => void;
}

export function OrbitDialog({ onConfirm }: OrbitDialogProps) {
  const t = useTranslations("commands");
  const [radius, setRadius] = useState("50");
  const [altitude, setAltitude] = useState("45");
  const [laps, setLaps] = useState("3");

  const inputClass =
    "w-full bg-background border border-input rounded-[5px] px-2.5 py-1.5 font-mono text-[11px] text-foreground focus:outline-none focus:border-muted";

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className="px-2.5 py-2 bg-background border border-input rounded-[5px] font-mono text-[10px] text-muted-foreground text-left tracking-wide hover:border-muted hover:text-foreground hover:bg-border transition-colors flex items-center gap-1.5"
      >
        ⊙ {t("orbit")}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-card border-input max-w-xs">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground text-sm">{t("orbitTitle")}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-xs">{t("orbitDesc")}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3">
          <div>
            <label className="font-mono text-[10px] tracking-wider text-subtle uppercase block mb-1">{t("radius")}</label>
            <input type="number" min={10} max={500} value={radius} onChange={(e) => setRadius(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-wider text-subtle uppercase block mb-1">{t("altitude")}</label>
            <input type="number" min={10} max={120} value={altitude} onChange={(e) => setAltitude(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-wider text-subtle uppercase block mb-1">{t("laps")}</label>
            <input type="number" min={1} max={20} value={laps} onChange={(e) => setLaps(e.target.value)} className={inputClass} />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-foreground text-background hover:bg-foreground/80"
          >
            {t("beginOrbit")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
