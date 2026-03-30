"use client";

import { trpc } from "@/lib/trpc/client";

function formatTimestamp(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(dateStr));
}

export default function AuditPage() {
  const query = trpc.audit.list.useQuery();
  const entries = query.data ?? [];
  const isLoading = query.isLoading;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-(--page-padding) py-3 border-b border-neutral-800 bg-neutral-950 shrink-0">
        <div>
          <h1 className="text-[15px] font-semibold text-white tracking-tight">Audit Log</h1>
          <div className="font-mono text-[11px] text-neutral-400 mt-0.5">
            {isLoading ? "Loading…" : `${entries.length} event${entries.length !== 1 ? "s" : ""}`}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 px-(--page-padding) pt-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-4">
          <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-1">Total Events</div>
          <div className="font-mono text-2xl font-semibold text-neutral-300">{isLoading ? "—" : entries.length}</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-4">
          <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-1">Last 24h</div>
          <div className="font-mono text-2xl font-semibold text-neutral-300">
            {isLoading ? "—" : entries.filter((e) => query.dataUpdatedAt - new Date(e.created_at).getTime() < 86_400_000).length}
          </div>
        </div>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto min-h-0 px-(--page-padding) pb-5 pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <span className="font-mono text-[11px] text-neutral-500">Loading…</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-center bg-neutral-900 border border-neutral-800 rounded-[5px]">
            <span className="font-mono text-[13px] text-neutral-400">No audit entries</span>
            <span className="font-mono text-[11px] text-neutral-600">System events and actions will be logged here</span>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800 bg-neutral-900 border border-neutral-800 rounded-[5px] overflow-hidden">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-4 px-5 py-3 hover:bg-neutral-800/50 transition-colors">
                <div className="font-mono text-[11px] text-neutral-500 w-20 md:w-36 shrink-0 pt-0.5 tabular-nums">
                  {formatTimestamp(entry.created_at)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm font-semibold text-white">{entry.action}</div>
                  <div className="font-mono text-[11px] text-neutral-500 mt-0.5">{entry.resource}</div>
                </div>
                <div className="hidden md:block font-mono text-[11px] text-neutral-500 shrink-0">
                  <span className="text-neutral-600">user</span>{" "}
                  <span className="text-neutral-400">{entry.user_id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
