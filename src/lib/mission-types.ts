import type { MissionStatus } from "./types";

export const missionStatusConfig: Record<MissionStatus, { label: string; color: string; bgColor: string }> = {
  draft:      { label: "Draft",      color: "text-neutral-400", bgColor: "bg-neutral-800" },
  planned:    { label: "Planned",    color: "text-blue-400",    bgColor: "bg-blue-900/30" },
  approved:   { label: "Approved",   color: "text-blue-300",    bgColor: "bg-blue-900/40" },
  activating: { label: "Activating", color: "text-amber-400",   bgColor: "bg-amber-900/30" },
  active:     { label: "Active",     color: "text-green-400",   bgColor: "bg-green-900/30" },
  completing: { label: "Completing", color: "text-green-300",   bgColor: "bg-green-900/20" },
  completed:  { label: "Completed",  color: "text-green-500",   bgColor: "bg-green-900/40" },
  aborting:   { label: "Aborting",   color: "text-red-400",     bgColor: "bg-red-900/30" },
  aborted:    { label: "Aborted",    color: "text-red-500",     bgColor: "bg-red-900/40" },
  canceled:   { label: "Canceled",   color: "text-neutral-500", bgColor: "bg-neutral-800/50" },
};

export const abortActionLabels: Record<string, string> = {
  return_to_base: "Return to Base",
  emergency_land: "Emergency Land",
  hover: "Hover in Place",
};

export const missionTypeIcons: Record<string, string> = {
  surveillance: "scan",
  search_rescue: "search",
  payload_delivery: "package",
};

export const statusActions: Record<string, { label: string; action: string; variant: "default" | "destructive" | "outline" }[]> = {
  draft:    [{ label: "Submit for Approval", action: "submit", variant: "default" }],
  planned:  [
    { label: "Approve", action: "approve", variant: "default" },
    { label: "Reject", action: "reject", variant: "outline" },
  ],
  approved: [{ label: "Activate Mission", action: "activate", variant: "default" }],
  active:   [
    { label: "Complete", action: "complete", variant: "default" },
    { label: "Abort", action: "abort", variant: "destructive" },
  ],
};

export const cancelableStatuses = ["draft", "planned", "approved"];
