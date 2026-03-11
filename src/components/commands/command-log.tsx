"use client";

import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import type { CommandState } from "@/lib/types";

const stateStyles: Record<CommandState, string> = {
  completed: "bg-fleet-green-dim text-fleet-green",
  executing: "bg-fleet-blue-dim text-fleet-blue",
  pending: "bg-fleet-amber-dim text-fleet-amber",
  failed: "bg-fleet-red-dim text-fleet-red",
};

const stateLabels: Record<CommandState, string> = {
  completed: "DONE",
  executing: "EXEC",
  pending: "PEND",
  failed: "FAIL",
};

export function CommandLog() {
  const t = useTranslations("commands");
  const { data: commands } = trpc.commands.log.useQuery(undefined, { refetchInterval: 3000 });

  if (!commands) return null;

  return (
    <div className="px-3.5 pb-2.5">
      <div className="font-mono text-[10px] tracking-widest text-subtle uppercase mb-2">
        {t("commandLog")}
      </div>
      <div className="flex flex-col gap-1">
        {commands.slice(0, 10).map((cmd) => (
          <div
            key={cmd.id}
            className="flex items-center gap-2 font-mono text-[10px] px-1.5 py-1 rounded-sm bg-bg border border-border"
          >
            <span className={cn("px-1.5 py-px rounded-sm text-[9px] font-semibold shrink-0", stateStyles[cmd.state])}>
              {stateLabels[cmd.state]}
            </span>
            <span className="text-text-dim flex-1">{cmd.type.toUpperCase().replace("_", " ")}</span>
            <span className="text-subtle">{cmd.target}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
