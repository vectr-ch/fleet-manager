"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { MissionStatusBadge } from "@/components/missions/mission-status-badge";
import type { MissionStatus } from "@/lib/types";

const FILTER_TABS: { label: string; statuses: MissionStatus[] | null }[] = [
  { label: "All", statuses: null },
  { label: "Active", statuses: ["activating", "active", "completing", "aborting"] },
  { label: "Draft", statuses: ["draft", "planned", "approved"] },
  { label: "Completed", statuses: ["completed"] },
  { label: "Aborted", statuses: ["aborted", "canceled"] },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function missionTypeLabel(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function MissionsPage() {
  const [activeFilter, setActiveFilter] = useState(0);
  const { data: missions = [], isLoading } = trpc.missions.list.useQuery();
  const utils = trpc.useUtils();

  // Quick actions
  const submitMut = trpc.missions.submit.useMutation({
    onSuccess: () => utils.missions.list.invalidate(),
  });
  const approveMut = trpc.missions.approve.useMutation({
    onSuccess: () => utils.missions.list.invalidate(),
  });
  const abortMut = trpc.missions.abort.useMutation({
    onSuccess: () => utils.missions.list.invalidate(),
  });

  const filtered = FILTER_TABS[activeFilter].statuses
    ? missions.filter((m) => FILTER_TABS[activeFilter].statuses!.includes(m.status as MissionStatus))
    : missions;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-auto p-5 gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Missions</h1>
          <p className="font-mono text-[11px] text-neutral-400 mt-0.5">
            {isLoading ? "Loading…" : `${missions.length} mission${missions.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/missions/new"
          className="font-mono text-[11px] tracking-wider uppercase px-4 py-2 rounded-[5px] bg-blue-600 text-white hover:bg-blue-500 transition-colors"
        >
          + Create Mission
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1">
        {FILTER_TABS.map((tab, i) => {
          const count = tab.statuses
            ? missions.filter((m) => tab.statuses!.includes(m.status as MissionStatus)).length
            : missions.length;
          return (
            <button
              key={tab.label}
              onClick={() => setActiveFilter(i)}
              className={`font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] transition-colors ${
                activeFilter === i
                  ? "bg-neutral-800 text-white border border-neutral-700"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-1.5 text-neutral-500">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mission list */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] flex-1 flex flex-col overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_120px_120px_160px_100px] px-4 py-2.5 border-b border-neutral-800 shrink-0">
          <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Type</span>
          <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Status</span>
          <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Drones</span>
          <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Created</span>
          <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase text-right">Actions</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center flex-1 py-16">
            <span className="font-mono text-[11px] text-neutral-500">Loading…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-16 gap-2">
            <span className="font-mono text-[13px] text-neutral-400">No missions</span>
            <span className="font-mono text-[11px] text-neutral-600">
              {activeFilter === 0 ? "Create your first mission to get started" : "No missions match this filter"}
            </span>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {filtered.map((mission) => (
              <Link
                key={mission.id}
                href={`/missions/${mission.id}`}
                className="grid grid-cols-[1fr_120px_120px_160px_100px] items-center px-4 py-3 border-b border-neutral-800 last:border-0 hover:bg-neutral-800/50 transition-colors group"
              >
                {/* Type */}
                <div>
                  <div className="font-mono text-[12px] font-semibold text-white">
                    {missionTypeLabel(mission.type)}
                  </div>
                  <div className="font-mono text-[10px] text-neutral-600 mt-0.5">
                    {mission.id.slice(0, 8)}…
                  </div>
                </div>

                {/* Status */}
                <div>
                  <MissionStatusBadge status={mission.status as MissionStatus} />
                </div>

                {/* Drones */}
                <div className="font-mono text-[11px] text-neutral-400">
                  {mission.drone_count ?? 1}
                </div>

                {/* Created */}
                <div className="font-mono text-[10px] text-neutral-500">
                  {formatDate(mission.created_at)}
                </div>

                {/* Quick actions */}
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.preventDefault()}>
                  {mission.status === "draft" && (
                    <button
                      onClick={() => submitMut.mutate({ id: mission.id })}
                      disabled={submitMut.isPending}
                      className="font-mono text-[9px] tracking-wider uppercase px-2 py-1 rounded bg-blue-600/80 text-white hover:bg-blue-500"
                    >
                      Submit
                    </button>
                  )}
                  {mission.status === "planned" && (
                    <button
                      onClick={() => approveMut.mutate({ id: mission.id })}
                      disabled={approveMut.isPending}
                      className="font-mono text-[9px] tracking-wider uppercase px-2 py-1 rounded bg-blue-600/80 text-white hover:bg-blue-500"
                    >
                      Approve
                    </button>
                  )}
                  {mission.status === "active" && (
                    <button
                      onClick={() => abortMut.mutate({ id: mission.id })}
                      disabled={abortMut.isPending}
                      className="font-mono text-[9px] tracking-wider uppercase px-2 py-1 rounded bg-red-600/80 text-white hover:bg-red-500"
                    >
                      Abort
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
