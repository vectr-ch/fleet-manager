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
          className="px-2.5 py-2 bg-bg border border-border2 rounded-[5px] font-mono text-[10px] text-text-dim text-left tracking-wide hover:border-muted hover:text-text hover:bg-border transition-colors flex items-center gap-1.5"
        >
          ⏸ {t("pause")}
        </button>
        <button
          onClick={() => send("rtb")}
          className="px-2.5 py-2 bg-bg border border-border2 rounded-[5px] font-mono text-[10px] text-text-dim text-left tracking-wide hover:border-muted hover:text-text hover:bg-border transition-colors flex items-center gap-1.5"
        >
          ↩ {t("rtbAll")}
        </button>
        <button
          onClick={() => send("goto")}
          className="px-2.5 py-2 bg-bg border border-border2 rounded-[5px] font-mono text-[10px] text-text-dim text-left tracking-wide hover:border-muted hover:text-text hover:bg-border transition-colors flex items-center gap-1.5"
        >
          ⊕ {t("goTo")}
        </button>
        <button
          onClick={() => send("orbit")}
          className="px-2.5 py-2 bg-bg border border-border2 rounded-[5px] font-mono text-[10px] text-text-dim text-left tracking-wide hover:border-muted hover:text-text hover:bg-border transition-colors flex items-center gap-1.5"
        >
          ⊙ {t("orbit")}
        </button>

        {/* Abort with confirmation */}
        <AlertDialog>
          <AlertDialogTrigger
            className="col-span-2 px-2.5 py-2.5 border border-fleet-red/20 rounded-[5px] font-mono text-[11px] font-semibold text-fleet-red bg-fleet-red-dim tracking-widest hover:bg-fleet-red/15 hover:border-fleet-red/40 transition-colors text-center"
          >
            ⬡ {t("abortMission")}
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-surface border-border2">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-text">{t("confirmAbortTitle")}</AlertDialogTitle>
              <AlertDialogDescription className="text-text-dim">
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
