"use client";

import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
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
import { GotoDialog } from "@/components/modals/goto-dialog";
import { OrbitDialog } from "@/components/modals/orbit-dialog";

export function CommandGrid() {
  const t = useTranslations("commands");
  const utils = trpc.useUtils();
  const dispatch = trpc.commands.dispatch.useMutation({
    onSuccess: () => {
      utils.commands.log.invalidate();
      utils.drones.list.invalidate();
      utils.missions.active.invalidate();
    },
  });

  const send = (type: string, target = "ALL") => {
    dispatch.mutate({ type: type as "pause" | "resume" | "rtb" | "goto" | "orbit" | "abort", target });
  };

  return (
    <div className="px-3.5 py-2.5">
      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={() => send("pause")}
          className="px-2.5 py-2 bg-background border border-input rounded-[5px] font-mono text-[10px] text-muted-foreground text-left tracking-wide hover:border-muted hover:text-foreground hover:bg-border transition-colors flex items-center gap-1.5"
        >
          ⏸ {t("pause")}
        </button>
        <button
          onClick={() => send("rtb")}
          className="px-2.5 py-2 bg-background border border-input rounded-[5px] font-mono text-[10px] text-muted-foreground text-left tracking-wide hover:border-muted hover:text-foreground hover:bg-border transition-colors flex items-center gap-1.5"
        >
          ↩ {t("rtbAll")}
        </button>

        {/* Go-To with coordinate dialog */}
        <GotoDialog onConfirm={() => send("goto")} />

        {/* Orbit with parameter dialog */}
        <OrbitDialog onConfirm={() => send("orbit")} />

        {/* Abort with confirmation */}
        <AlertDialog>
          <AlertDialogTrigger
            className="col-span-2 px-2.5 py-2.5 border border-fleet-red/20 rounded-[5px] font-mono text-[11px] font-semibold text-fleet-red bg-fleet-red-dim tracking-widest hover:bg-fleet-red/15 hover:border-fleet-red/40 transition-colors text-center"
          >
            ⬡ {t("abortMission")}
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-input">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">{t("confirmAbortTitle")}</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                {t("confirmAbort")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => send("abort")}
                className="bg-fleet-red text-white hover:bg-fleet-red/80"
              >
                Abort
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
