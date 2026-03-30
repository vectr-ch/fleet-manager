"use client";

import { trpc } from "@/lib/trpc/client";

export default function MissionsPage() {
  const { data: missions = [], isLoading } = trpc.missions.list.useQuery();

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-auto p-(--page-padding) gap-(--page-gap)">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Missions</h1>
          <p className="font-mono text-[11px] text-neutral-400 mt-0.5">
            {isLoading ? "Loading…" : `${missions.length} mission${missions.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          disabled
          title="Coming soon"
          className="font-mono text-[11px] tracking-wider uppercase px-4 py-2 rounded-[5px] bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed"
        >
          Create Mission
        </button>
      </div>

      {/* Mission list */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-800 shrink-0">
          <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Mission History</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center flex-1 py-16">
            <span className="font-mono text-[11px] text-neutral-500">Loading…</span>
          </div>
        ) : missions.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-16 gap-2">
            <span className="font-mono text-[13px] text-neutral-400">No missions yet</span>
            <span className="font-mono text-[11px] text-neutral-600">Missions will appear here once created</span>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {missions.map((mission) => (
              <div
                key={mission.id}
                className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 last:border-0 hover:bg-neutral-800/50 transition-colors"
              >
                <div>
                  <div className="font-mono text-sm font-semibold text-white">{mission.name}</div>
                  <div className="font-mono text-[11px] text-neutral-500 mt-0.5">{mission.id}</div>
                </div>
                <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                  {mission.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
