"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import type { Mission, MissionNode, MissionEvent, MissionStatus, PreFlightReport } from "@/lib/types";
import { MissionStatusBadge } from "./mission-status-badge";
import { PreFlightReportDisplay } from "./preflight-report";
import { statusActions, cancelableStatuses, abortActionLabels } from "@/lib/mission-types";

interface MissionDetailPanelProps {
  mission: Mission;
  nodes: MissionNode[];
  events: MissionEvent[];
  onBack: () => void;
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function MissionDetailPanel({ mission, nodes, events, onBack }: MissionDetailPanelProps) {
  const utils = trpc.useUtils();
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [preFlightReport, setPreFlightReport] = useState<PreFlightReport | null>(null);

  const invalidate = () => utils.missions.getById.invalidate({ id: mission.id });

  const submitMut = trpc.missions.submit.useMutation({ onSuccess: invalidate, onError: (e) => setError(e.message) });
  const approveMut = trpc.missions.approve.useMutation({ onSuccess: invalidate, onError: (e) => setError(e.message) });
  const rejectMut = trpc.missions.reject.useMutation({
    onSuccess: () => { invalidate(); setShowRejectInput(false); setRejectReason(""); },
    onError: (e) => setError(e.message),
  });
  const activateMut = trpc.missions.activate.useMutation({
    onSuccess: (data) => {
      if (data.preflight_report) {
        setPreFlightReport(data.preflight_report);
      }
      invalidate();
    },
    onError: (e) => setError(e.message),
  });
  const completeMut = trpc.missions.complete.useMutation({ onSuccess: invalidate, onError: (e) => setError(e.message) });
  const abortMut = trpc.missions.abort.useMutation({ onSuccess: invalidate, onError: (e) => setError(e.message) });
  const cancelMut = trpc.missions.cancel.useMutation({ onSuccess: invalidate, onError: (e) => setError(e.message) });

  const handleAction = (action: string) => {
    setError(null);
    switch (action) {
      case "submit": submitMut.mutate({ id: mission.id }); break;
      case "approve": approveMut.mutate({ id: mission.id }); break;
      case "reject": setShowRejectInput(true); break;
      case "activate": activateMut.mutate({ id: mission.id }); break;
      case "complete": completeMut.mutate({ id: mission.id }); break;
      case "abort": abortMut.mutate({ id: mission.id }); break;
    }
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      rejectMut.mutate({ id: mission.id, reason: rejectReason.trim() });
    }
  };

  const handleCancel = () => {
    setError(null);
    cancelMut.mutate({ id: mission.id });
  };

  const isPending = submitMut.isPending || approveMut.isPending || rejectMut.isPending ||
    activateMut.isPending || completeMut.isPending || abortMut.isPending || cancelMut.isPending;

  const actions = statusActions[mission.status] ?? [];
  const canCancel = cancelableStatuses.includes(mission.status);

  // Parse abort action for display
  const abortAction = (() => {
    try {
      const aa = mission.abort_action as { action?: string };
      return aa?.action ? abortActionLabels[aa.action] ?? aa.action : "—";
    } catch { return "—"; }
  })();

  // Parse params for display
  const params = mission.params as Record<string, unknown> | undefined;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-800">
        <div className="flex items-center gap-2 mb-1">
          <button onClick={onBack} className="font-mono text-[11px] text-neutral-500 hover:text-white">
            ← Back
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-wider uppercase text-neutral-400">{mission.type.replace("_", " ")}</span>
          <MissionStatusBadge status={mission.status as MissionStatus} size="md" />
        </div>
        <div className="font-mono text-[10px] text-neutral-600 mt-1">{mission.id}</div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Info */}
        <div>
          <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-2">Details</div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] divide-y divide-neutral-800">
            {[
              { label: "Mode", value: mission.mode },
              { label: "Base", value: mission.base_id ?? "Not assigned" },
              { label: "Drones", value: `${mission.drone_count ?? 1}` },
              { label: "Abort Action", value: abortAction },
              { label: "Created", value: formatTime(mission.created_at) },
              ...(mission.activated_at ? [{ label: "Activated", value: formatTime(mission.activated_at) }] : []),
              ...(mission.completed_at ? [{ label: "Completed", value: formatTime(mission.completed_at) }] : []),
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between px-3 py-2">
                <span className="font-mono text-[10px] text-neutral-500">{row.label}</span>
                <span className="font-mono text-[11px] text-white truncate max-w-[200px]">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Surveillance params */}
        {mission.type === "surveillance" && params && (
          <div>
            <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-2">Parameters</div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] divide-y divide-neutral-800">
              {[
                { label: "Spacing", value: `${params.spacing_m ?? "—"}m` },
                { label: "Altitude", value: `${params.altitude_m ?? "—"}m AGL` },
                { label: "Speed", value: `${params.speed_ms ?? "—"} m/s` },
                { label: "Loop", value: params.loop ? "Yes" : "No" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-3 py-2">
                  <span className="font-mono text-[10px] text-neutral-500">{row.label}</span>
                  <span className="font-mono text-[11px] text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assigned nodes */}
        <div>
          <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-2">
            Assigned Nodes ({nodes.length})
          </div>
          {nodes.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-3 font-mono text-[11px] text-neutral-500">
              No nodes assigned
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] divide-y divide-neutral-800">
              {nodes.map((node) => (
                <div key={node.node_id} className="flex items-center justify-between px-3 py-2">
                  <span className="font-mono text-[11px] text-white truncate">{node.node_id}</span>
                  {node.role && (
                    <span className="font-mono text-[10px] text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded">
                      {node.role}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pre-flight report */}
        {preFlightReport && <PreFlightReportDisplay report={preFlightReport} />}

        {/* Event timeline */}
        <div>
          <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-2">
            Event Timeline ({events.length})
          </div>
          {events.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-3 font-mono text-[11px] text-neutral-500">
              No events yet
            </div>
          ) : (
            <div className="space-y-1">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-2 font-mono text-[10px]">
                  <span className="text-neutral-600 whitespace-nowrap">{formatTime(event.created_at)}</span>
                  <span className="text-neutral-400">
                    {event.from_status ? `${event.from_status} → ` : ""}{event.to_status}
                  </span>
                  {event.note && <span className="text-neutral-600 italic">&quot;{event.note}&quot;</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-5 py-2 bg-red-900/20 border-t border-red-900/50">
          <span className="font-mono text-[11px] text-red-400">{error}</span>
        </div>
      )}

      {/* Reject input */}
      {showRejectInput && (
        <div className="px-5 py-3 border-t border-neutral-800 space-y-2">
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Rejection reason…"
            className="bg-neutral-900 border border-neutral-700 rounded-[5px] px-2.5 py-1.5 font-mono text-[11px] text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 w-full"
          />
          <div className="flex gap-2">
            <button onClick={handleReject} disabled={!rejectReason.trim() || rejectMut.isPending}
              className="font-mono text-[11px] px-3 py-1.5 rounded-[5px] bg-red-600 text-white hover:bg-red-500 disabled:bg-neutral-800 disabled:text-neutral-500">
              {rejectMut.isPending ? "Rejecting…" : "Confirm Reject"}
            </button>
            <button onClick={() => setShowRejectInput(false)}
              className="font-mono text-[11px] px-3 py-1.5 rounded-[5px] border border-neutral-700 text-neutral-400 hover:text-white">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {(actions.length > 0 || canCancel) && (
        <div className="px-5 py-4 border-t border-neutral-800 flex gap-2 flex-wrap">
          {actions.map((a) => (
            <button
              key={a.action}
              onClick={() => handleAction(a.action)}
              disabled={isPending}
              className={`font-mono text-[11px] tracking-wider uppercase px-4 py-2 rounded-[5px] transition-colors disabled:opacity-50 ${
                a.variant === "destructive"
                  ? "bg-red-600 text-white hover:bg-red-500"
                  : a.variant === "outline"
                    ? "border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500"
                    : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
            >
              {a.label}
            </button>
          ))}
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="font-mono text-[11px] tracking-wider uppercase px-4 py-2 rounded-[5px] border border-neutral-700 text-neutral-500 hover:text-red-400 hover:border-red-800 transition-colors disabled:opacity-50 ml-auto"
            >
              Cancel Mission
            </button>
          )}
        </div>
      )}
    </div>
  );
}
