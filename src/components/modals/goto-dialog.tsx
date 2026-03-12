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

interface GotoDialogProps {
  onConfirm: () => void;
}

export function GotoDialog({ onConfirm }: GotoDialogProps) {
  const t = useTranslations("commands");
  const [lat, setLat] = useState("32.255");
  const [lng, setLng] = useState("-110.915");

  const inputClass =
    "w-full bg-background border border-input rounded-[5px] px-2.5 py-1.5 font-mono text-[11px] text-foreground focus:outline-none focus:border-muted";

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className="px-2.5 py-2 bg-background border border-input rounded-[5px] font-mono text-[10px] text-muted-foreground text-left tracking-wide hover:border-muted hover:text-foreground hover:bg-border transition-colors flex items-center gap-1.5"
      >
        ⊕ {t("goTo")}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-card border-input max-w-xs">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground text-sm">{t("gotoTitle")}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-xs">{t("gotoDesc")}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3">
          <div>
            <label className="font-mono text-[10px] tracking-wider text-subtle uppercase block mb-1">{t("latitude")}</label>
            <input type="number" step="0.001" value={lat} onChange={(e) => setLat(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-wider text-subtle uppercase block mb-1">{t("longitude")}</label>
            <input type="number" step="0.001" value={lng} onChange={(e) => setLng(e.target.value)} className={inputClass} />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-foreground text-background hover:bg-foreground/80"
          >
            {t("sendCommand")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
