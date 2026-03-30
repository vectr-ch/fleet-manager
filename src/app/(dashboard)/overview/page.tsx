"use client";

import { trpc } from "@/lib/trpc/client";

export default function OverviewPage() {
  const { data: stats, isLoading: statsLoading } = trpc.overview.stats.useQuery();
  const { data: activity, isLoading: activityLoading } = trpc.overview.recentActivity.useQuery();

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-auto p-(--page-padding) gap-(--page-gap)">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight">Overview</h1>
        <p className="font-mono text-[11px] text-neutral-400 mt-0.5">Fleet status and recent activity</p>
      </div>

      {/* Stats cards */}
      {statsLoading ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-4">
          <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-2">Overview Metrics</div>
          <div className="font-mono text-[12px] text-neutral-400">Loading…</div>
        </div>
      ) : stats ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-4">
          <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-2">Overview Metrics</div>
          <pre className="overflow-auto font-mono text-[11px] text-neutral-300">
            {JSON.stringify(stats, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-4">
          <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-2">Overview Metrics</div>
          <div className="font-mono text-[12px] text-neutral-400">
            Live overview metrics are not wired yet.
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-800 shrink-0">
          <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Recent Activity</span>
        </div>

        {activityLoading ? (
          <div className="flex items-center justify-center flex-1 py-16">
            <span className="font-mono text-[11px] text-neutral-500">Loading…</span>
          </div>
        ) : !activity || activity.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-16 gap-2">
            <span className="font-mono text-[13px] text-neutral-400">No data available</span>
            <span className="font-mono text-[11px] text-neutral-600">Activity will appear here once operations begin</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
