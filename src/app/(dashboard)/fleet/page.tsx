"use client";

import { useState, useMemo } from "react";
import { friendlyError } from "@/lib/error-messages";
import { getNodeEditDefaults, validateNodeEditBaseId, validateNodeEditName } from "@/lib/node-edit";
import { trpc } from "@/lib/trpc/client";
import {
  ShieldAlert,
  Plus,
  Power,
  PowerOff,
  Pencil,
  X,
  Check,
  Download,
  AlertTriangle,
  Search,
  Cpu,
  Server,
} from "lucide-react";
import { InlineEditActions } from "@/components/dashboard/inline-edit-actions";
import { ConfirmModal } from "@/components/dashboard";
import { BottomSheet } from "@/components/dashboard/bottom-sheet";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { ExpandableCard, useExpandedCard } from "@/components/dashboard/expandable-card";
import { ActionButton } from "@/components/dashboard/action-button";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatDateTime(iso: string) {
  try {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    // If within the last 24h, show relative time
    if (diffMs < 60_000) return "just now";
    if (diffMs < 3600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
    if (diffMs < 86400_000) return `${Math.floor(diffMs / 3600_000)}h ago`;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
      " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function connectionStatus(lastSeenAt?: string | null): "active" | "delayed" | "offline" | "unknown" {
  if (!lastSeenAt) return "unknown";
  const diffMs = Date.now() - new Date(lastSeenAt).getTime();
  if (diffMs < 60_000) return "active";       // < 1 min
  if (diffMs < 600_000) return "delayed";      // < 10 min
  return "offline";
}

// ── Credential Bundle Modal ──────────────────────────────────────────────────

// ── Helpers ── Bundle Download ────────────────────────────────────────────────

function downloadJsonBundle(data: { device_id: string; device_type: string; [key: string]: unknown }) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.device_type}-${data.device_id.slice(0, 8)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Revoke Confirmation Modal ────────────────────────────────────────────────

function RevokeModal({
  nodeName,
  onConfirm,
  onCancel,
  isPending,
}: {
  nodeName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <BottomSheet open onClose={onCancel}>
      <div className="p-6 md:p-0">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="size-3.5 text-red-400" />
          <span className="font-mono text-[10px] tracking-[.08em] text-red-400 uppercase font-medium">Revoke Certificate</span>
        </div>
        <p className="text-[12px] text-[#888] mb-4 mt-2 leading-relaxed">
          Revoke the certificate for <span className="text-foreground font-medium">{nodeName}</span>?
          The drone will return to pending status and require re-enrollment.
        </p>
        <div className="mb-4">
          <label className="font-mono text-[10px] text-[#555] block mb-1.5">Reason (optional)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. device compromised"
            className="w-full bg-[#080808] border border-[#252525] rounded-md px-3 py-2 font-mono text-[11px] text-foreground placeholder:text-[#3a3a3a] focus:outline-none focus:border-[#3a3a3a] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onConfirm(reason)}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide px-3.5 py-2 rounded-md bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 hover:border-red-500/35 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Revoking..." : "Revoke Certificate"}
          </button>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide px-3.5 py-2 rounded-md border border-[#252525] text-[#888] hover:text-foreground hover:border-[#3a3a3a] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

// ── Device Status ────────────────────────────────────────────────────────────

type DeviceStatusResult = { label: string; color: string; dot: "green-pulse" | "green" | "amber-pulse" | "amber-dim" | "red" | "grey" };

function deviceStatus(device: { cert_serial?: string | null; enrolled_at?: string | null; decommissioned_at?: string | null }): DeviceStatusResult {
  if (device.decommissioned_at) return { label: "Decommissioned", color: "text-[#555]", dot: "grey" };
  if (device.enrolled_at && device.cert_serial) return { label: "Enrolled", color: "text-fleet-green", dot: "green-pulse" };
  if (device.enrolled_at && !device.cert_serial) return { label: "Revoked", color: "text-red-400", dot: "red" };
  if (device.cert_serial && !device.enrolled_at) return { label: "Awaiting Connection", color: "text-fleet-amber", dot: "amber-pulse" };
  return { label: "Awaiting Certificate", color: "text-fleet-amber/60", dot: "amber-dim" };
}

function StatusDot({ cert_serial, enrolled_at, decommissioned_at, last_seen_at }: { cert_serial?: string | null; enrolled_at?: string; decommissioned_at?: string; last_seen_at?: string | null }) {
  const status = deviceStatus({ cert_serial, enrolled_at, decommissioned_at });

  // For enrolled devices, refine the dot based on connection status
  if (status.dot === "green-pulse" && last_seen_at) {
    const conn = connectionStatus(last_seen_at);
    if (conn === "active") {
      return <span className="size-2.5 rounded-full bg-fleet-green shadow-[0_0_6px_#22c55e88] animate-status-pulse" title="Active" />;
    }
    if (conn === "delayed") {
      return <span className="size-2.5 rounded-full bg-fleet-amber shadow-[0_0_6px_#f59e0b88]" title="Delayed" />;
    }
    if (conn === "offline") {
      return <span className="size-2.5 rounded-full bg-[#555]" title="Offline" />;
    }
  }

  if (status.dot === "green-pulse" || status.dot === "green") return <span className="size-2.5 rounded-full bg-fleet-green shadow-[0_0_6px_#22c55e88] animate-status-pulse" title={status.label} />;
  if (status.dot === "amber-pulse") return <span className="size-2.5 rounded-full bg-fleet-amber shadow-[0_0_6px_#f59e0b88] animate-status-pulse" title={status.label} />;
  if (status.dot === "amber-dim") return <span className="size-2.5 rounded-full bg-fleet-amber/40" title={status.label} />;
  if (status.dot === "red") return <span className="size-2.5 rounded-full bg-red-400 shadow-[0_0_6px_#f8717188]" title={status.label} />;
  return <span className="size-2.5 rounded-full bg-[#3a3a3a]" title={status.label} />;
}

function StatusLabel({ cert_serial, enrolled_at, decommissioned_at }: { cert_serial?: string | null; enrolled_at?: string; decommissioned_at?: string }) {
  const status = deviceStatus({ cert_serial, enrolled_at, decommissioned_at });
  return <span className={`font-mono text-[10px] tracking-[.04em] uppercase ${status.color}`}>{status.label}</span>;
}

// ── Stat Cell ────────────────────────────────────────────────────────────────

function StatCell({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="bg-[#0f0f0f] px-4 py-3 flex flex-col gap-1">
      <span className="font-mono text-[9px] tracking-[.08em] text-[#555] uppercase">{label}</span>
      <span className={`font-mono text-[20px] font-semibold tracking-tight leading-none ${color ?? "text-foreground"}`}>{value}</span>
    </div>
  );
}

// ── Create Node Modal ────────────────────────────────────────────────────────

function CreateNodeModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [serial, setSerial] = useState("");
  const [baseId, setBaseId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: bases } = trpc.bases.list.useQuery();

  const createMutation = trpc.nodes.create.useMutation({
    onSuccess: () => {
      utils.nodes.list.invalidate();
      onClose();
    },
    onError: (e) => setError(friendlyError(e)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const nameError = validateNodeEditName(trimmedName);
    if (nameError) {
      setError(nameError);
      return;
    }

    setError(null);
    createMutation.mutate({
      name: trimmedName,
      serial: serial.trim() || undefined,
      base_id: baseId.trim() || undefined,
    });
  };

  const inputClass = "w-full bg-[#080808] border border-[#252525] rounded-md px-3 py-2 font-mono text-[12px] text-foreground placeholder:text-[#3a3a3a] focus:outline-none focus:border-[#3a3a3a] transition-colors";

  return (
    <BottomSheet open onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 md:p-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plus className="size-3.5 text-foreground" />
            <span className="font-mono text-[10px] tracking-[.08em] text-foreground uppercase font-medium">Register Drone</span>
          </div>
          <button type="button" onClick={onClose} className="text-[#555] hover:text-foreground transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="font-mono text-[10px] tracking-[.06em] text-[#555] uppercase block mb-1.5">Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Drone-01" required className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[10px] tracking-[.06em] text-[#555] uppercase block mb-1.5">Serial</label>
              <input type="text" value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="SN-XXXXXX" className={inputClass} />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-[.06em] text-[#555] uppercase block mb-1.5">Base</label>
              <select value={baseId} onChange={(e) => setBaseId(e.target.value)} className={inputClass}>
                <option value="">{"—"} None {"—"}</option>
                {bases?.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-3 text-[11px] text-red-400">
            <AlertTriangle className="size-3 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-[#1a1a1a]">
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] tracking-wide px-3.5 py-2 rounded-md border border-[#252525] text-[#888] hover:text-foreground hover:border-[#3a3a3a] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide px-3.5 py-2 rounded-md bg-foreground text-background font-medium hover:bg-foreground/80 disabled:opacity-50 transition-colors"
          >
            {createMutation.isPending ? "Creating..." : "Register Drone"}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}

// ── Node Table Row ───────────────────────────────────────────────────────────

interface NodeRowProps {
  node: {
    id: string;
    name: string;
    serial?: string;
    base_id?: string;
    firmware_version?: string;
    cert_serial?: string | null;
    enrolled_at?: string;
    last_seen_at?: string | null;
    cert_expires_at?: string;
    decommissioned_at?: string;
    created_at: string;
  };
  bases: { id: string; name: string }[];
}

function NodeRow({ node, bases }: NodeRowProps) {
  const utils = trpc.useUtils();
  const initialEditState = getNodeEditDefaults(node);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(initialEditState.name);
  const [editSerial, setEditSerial] = useState(initialEditState.serial);
  const [editBaseId, setEditBaseId] = useState(initialEditState.baseId);
  const [error, setError] = useState<string | null>(null);
  const [showRevoke, setShowRevoke] = useState(false);
  const [showDecommission, setShowDecommission] = useState(false);

  const status = deviceStatus(node);
  const isEnrolled = status.label === "Enrolled";
  const isPending = status.label === "Awaiting Certificate" || status.label === "Awaiting Connection";
  const isRevoked = status.label === "Revoked";
  const isDecommissioned = !!node.decommissioned_at;

  const updateMutation = trpc.nodes.update.useMutation({
    onSuccess: () => {
      utils.nodes.list.invalidate();
      setEditing(false);
      setError(null);
    },
    onError: (e) => setError(friendlyError(e)),
  });

  const revokeMutation = trpc.nodes.revokeCert.useMutation({
    onSuccess: () => {
      utils.nodes.list.invalidate();
      setShowRevoke(false);
    },
    onError: (e) => setError(friendlyError(e)),
  });

  const decommissionMutation = trpc.nodes.decommission.useMutation({
    onSuccess: () => { utils.nodes.list.invalidate(); setShowDecommission(false); },
    onError: (e) => { setShowDecommission(false); setError(friendlyError(e)); },
  });
  const recommissionMutation = trpc.nodes.recommission.useMutation({
    onSuccess: () => { utils.nodes.list.invalidate(); },
    onError: (e) => setError(friendlyError(e)),
  });

  const issueCertMutation = trpc.nodes.issueCert.useMutation({
    onSuccess: (data) => {
      utils.nodes.list.invalidate();
      downloadJsonBundle(data);
      setTimeout(() => issueCertMutation.reset(), 0);
    },
    onError: (e) => setError(friendlyError(e)),
  });

  const handleSave = () => {
    const trimmedName = editName.trim();
    const nameError = validateNodeEditName(trimmedName);
    if (nameError) {
      setError(nameError);
      return;
    }

    const baseError = validateNodeEditBaseId({
      baseId: editBaseId,
      hadBase: !!node.base_id,
    });
    if (baseError) {
      setError(baseError);
      return;
    }

    setError(null);
    updateMutation.mutate({
      id: node.id,
      name: trimmedName,
      serial: editSerial.trim() || undefined,
      base_id: editBaseId.trim() || undefined,
    });
  };

  const resetEditState = () => {
    const next = getNodeEditDefaults(node);
    setEditName(next.name);
    setEditSerial(next.serial);
    setEditBaseId(next.baseId);
  };

  const handleStartEdit = () => {
    resetEditState();
    setEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    resetEditState();
    setEditing(false);
    setError(null);
  };

  const baseName = bases.find((b) => b.id === node.base_id)?.name;

  const editInputClass = "bg-[#080808] border border-[#252525] rounded-md px-2 py-1 font-mono text-[11px] text-foreground focus:outline-none focus:border-[#3a3a3a] transition-colors";

  if (editing) {
    return (
      <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <td className="pl-4 pr-2 py-2.5"><StatusDot cert_serial={node.cert_serial} enrolled_at={node.enrolled_at} decommissioned_at={node.decommissioned_at} last_seen_at={node.last_seen_at} /></td>
        <td className="px-3 py-2.5">
          <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={`${editInputClass} w-32`} />
        </td>
        <td className="px-3 py-2.5">
          <input type="text" value={editSerial} onChange={(e) => setEditSerial(e.target.value)} placeholder="—" className={`${editInputClass} w-28`} />
        </td>
        <td className="px-3 py-2.5">
          <select value={editBaseId} onChange={(e) => setEditBaseId(e.target.value)} className={`${editInputClass} w-32`}>
            <option value="">{"—"}</option>
            {bases.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
          </select>
        </td>
        <td className="px-3 py-2.5"><StatusLabel cert_serial={node.cert_serial} enrolled_at={node.enrolled_at} decommissioned_at={node.decommissioned_at} /></td>
        <td className="px-3 py-2.5 font-mono text-[11px] text-[#555]">{node.firmware_version ?? "—"}</td>
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            {error && <span className="text-[10px] text-red-400 mr-1">{error}</span>}
            <InlineEditActions
              isPending={updateMutation.isPending}
              saveLabel={updateMutation.isPending ? "Saving..." : "Save"}
              onSave={handleSave}
              onClose={handleCancel}
              saveIcon={<Check className="size-3" />}
              closeIcon={<X className="size-3" />}
            />
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr className={`border-b border-[#1a1a1a] hover:bg-[#0f0f0f] transition-colors group ${isDecommissioned ? "opacity-40" : ""}`}>
        <td className="pl-4 pr-2 py-3">
          <StatusDot cert_serial={node.cert_serial} enrolled_at={node.enrolled_at} decommissioned_at={node.decommissioned_at} last_seen_at={node.last_seen_at} />
        </td>
        <td className="px-3 py-3">
          <div>
            <div className="font-mono text-[12px] font-medium text-foreground">{node.name}</div>
            {isEnrolled && node.cert_expires_at && (
              <div className="font-mono text-[10px] text-[#3a3a3a] mt-0.5">expires {formatDate(node.cert_expires_at)}</div>
            )}
            {isRevoked && (
              <div className="font-mono text-[10px] text-red-400/50 mt-0.5">certificate revoked</div>
            )}
          </div>
        </td>
        <td className="px-3 py-3 font-mono text-[11px] text-[#555]">{node.serial ?? "—"}</td>
        <td className="px-3 py-3">
          {baseName ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#888]">
              <Server className="size-3 text-[#3a3a3a]" />
              {baseName}
            </span>
          ) : (
            <span className="font-mono text-[11px] text-[#3a3a3a]">{"—"}</span>
          )}
        </td>
        <td className="px-3 py-3">
          <StatusLabel cert_serial={node.cert_serial} enrolled_at={node.enrolled_at} decommissioned_at={node.decommissioned_at} />
        </td>
        <td className="px-3 py-3 font-mono text-[11px] text-[#555]">{node.firmware_version ?? "—"}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isDecommissioned && (
              <>
                <button
                  onClick={handleStartEdit}
                  className="inline-flex items-center justify-center size-7 rounded-md border border-[#252525] text-[#555] hover:text-foreground hover:border-[#3a3a3a] transition-colors"
                  title="Edit"
                >
                  <Pencil className="size-3" />
                </button>
                {(isPending || isRevoked) && (
                  <button
                    onClick={() => issueCertMutation.mutate({ id: node.id })}
                    disabled={issueCertMutation.isPending}
                    className="inline-flex items-center justify-center size-7 rounded-md bg-fleet-green-dim text-fleet-green border border-fleet-green/15 hover:bg-fleet-green/15 disabled:opacity-50 transition-colors"
                    title="Download Certificate Bundle"
                  >
                    <Download className="size-3" />
                  </button>
                )}
                {isEnrolled && (
                  <button
                    onClick={() => setShowRevoke(true)}
                    className="inline-flex items-center justify-center size-7 rounded-md border border-red-500/20 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Revoke Certificate"
                  >
                    <ShieldAlert className="size-3" />
                  </button>
                )}
                <button
                  onClick={() => setShowDecommission(true)}
                  className="inline-flex items-center justify-center size-7 rounded-md border border-red-500/20 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Decommission"
                >
                  <PowerOff className="size-3" />
                </button>
              </>
            )}
            {isDecommissioned && (
              <button
                onClick={() => recommissionMutation.mutate({ id: node.id })}
                disabled={recommissionMutation.isPending}
                className="inline-flex items-center gap-1 font-mono text-[10px] tracking-wide px-2.5 py-1.5 rounded-md bg-fleet-green-dim text-fleet-green border border-fleet-green/15 hover:bg-fleet-green/15 disabled:opacity-50 transition-colors"
              >
                <Power className="size-3" />
                Recommission
              </button>
            )}
          </div>
          {error && <div className="text-[10px] text-red-400 mt-1">{error}</div>}
        </td>
      </tr>
      {showRevoke && (
        <RevokeModal
          nodeName={node.name}
          onConfirm={(reason) => revokeMutation.mutate({ id: node.id, reason: reason || undefined })}
          onCancel={() => setShowRevoke(false)}
          isPending={revokeMutation.isPending}
        />
      )}
      {showDecommission && (
        <ConfirmModal
          icon={<PowerOff className="size-3.5 text-red-400" />}
          title="Decommission Drone"
          confirmVariant="danger"
          confirmLabel="Decommission"
          confirmingLabel="Decommissioning..."
          confirmIcon={<PowerOff className="size-3" />}
          onConfirm={() => decommissionMutation.mutate({ id: node.id })}
          onCancel={() => setShowDecommission(false)}
          isPending={decommissionMutation.isPending}
        >
          <p className="text-[12px] text-[#888] mb-2 leading-relaxed">
            Decommission <span className="text-foreground font-medium">{node.name}</span>?
          </p>
          <p className="text-[11px] text-[#555] leading-relaxed">
            This will take the drone offline and revoke its certificate if one is active. The drone can be recommissioned later, but will require re-enrollment.
          </p>
        </ConfirmModal>
      )}
    </>
  );
}

// ── Node Mobile Card ─────────────────────────────────────────────────────────

function NodeCard({
  node,
  bases,
  expanded,
  onToggle,
}: {
  node: NodeRowProps["node"];
  bases: NodeRowProps["bases"];
  expanded: boolean;
  onToggle: () => void;
}) {
  const utils = trpc.useUtils();
  const [showRevoke, setShowRevoke] = useState(false);
  const [showDecommission, setShowDecommission] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = deviceStatus(node);
  const isEnrolled = status.label === "Enrolled";
  const isPending = status.label === "Awaiting Certificate" || status.label === "Awaiting Connection";
  const isRevoked = status.label === "Revoked";
  const isDecommissioned = !!node.decommissioned_at;

  const revokeMutation = trpc.nodes.revokeCert.useMutation({
    onSuccess: () => { utils.nodes.list.invalidate(); setShowRevoke(false); },
    onError: (e) => setError(friendlyError(e)),
  });

  const decommissionMutation = trpc.nodes.decommission.useMutation({
    onSuccess: () => { utils.nodes.list.invalidate(); setShowDecommission(false); },
    onError: (e) => setError(friendlyError(e)),
  });

  const recommissionMutation = trpc.nodes.recommission.useMutation({
    onSuccess: () => utils.nodes.list.invalidate(),
    onError: (e) => setError(friendlyError(e)),
  });

  const issueCertMutation = trpc.nodes.issueCert.useMutation({
    onSuccess: (data) => {
      utils.nodes.list.invalidate();
      downloadJsonBundle(data);
      setTimeout(() => issueCertMutation.reset(), 0);
    },
    onError: (e) => setError(friendlyError(e)),
  });

  const baseName = bases.find((b) => b.id === node.base_id)?.name;

  const statusPillColors: Record<string, string> = {
    Enrolled: "text-fleet-green bg-fleet-green-dim",
    "Awaiting Certificate": "text-fleet-amber/60 bg-fleet-amber-dim",
    "Awaiting Connection": "text-fleet-amber bg-fleet-amber-dim",
    Revoked: "text-red-400 bg-fleet-red-dim",
    Decommissioned: "text-[#555] bg-[#55555515]",
  };

  const connStatusMap: Record<string, { label: string; colors: string }> = {
    active: { label: "Active", colors: "text-fleet-green bg-fleet-green-dim" },
    delayed: { label: "Delayed", colors: "text-fleet-amber bg-fleet-amber-dim" },
    offline: { label: "Offline", colors: "text-[#555] bg-[#55555515]" },
    unknown: { label: "Enrolled", colors: "text-fleet-green bg-fleet-green-dim" },
  };

  const conn = connectionStatus(node.last_seen_at);
  const pillLabel = isEnrolled ? (connStatusMap[conn]?.label ?? status.label) : status.label;
  const pillColors = isEnrolled ? (connStatusMap[conn]?.colors ?? statusPillColors[status.label]) : statusPillColors[status.label];

  const details = [
    { label: "Serial", value: node.serial ?? "—" },
    { label: "Base", value: baseName ?? "Unassigned" },
    { label: "Firmware", value: node.firmware_version ?? "—" },
    ...(node.enrolled_at ? [{ label: "Enrolled", value: formatDateTime(node.enrolled_at) }] : []),
    ...(node.last_seen_at ? [{ label: "Last seen", value: formatDateTime(node.last_seen_at) }] : []),
    ...(isEnrolled && node.cert_expires_at
      ? [{ label: "Cert expires", value: formatDate(node.cert_expires_at) }]
      : []),
    { label: "Created", value: formatDate(node.created_at) },
  ];

  return (
    <>
      <ExpandableCard
        statusDot={
          <StatusDot
            cert_serial={node.cert_serial}
            enrolled_at={node.enrolled_at}
            decommissioned_at={node.decommissioned_at}
            last_seen_at={node.last_seen_at}
          />
        }
        name={node.name}
        statusPill={
          <span className={`font-mono text-[9px] tracking-[.04em] uppercase px-1.5 py-0.5 rounded-full ${pillColors ?? "text-[#555] bg-[#55555515]"}`}>
            {pillLabel}
          </span>
        }
        meta={
          <>
            <span>SN: {node.serial ?? "—"}</span>
            <span>Base: {baseName ?? "—"}</span>
          </>
        }
        details={details}
        expanded={expanded}
        onToggle={onToggle}
        className={isDecommissioned ? "opacity-40" : ""}
        actions={
          <>
            {!isDecommissioned && (
              <>
                <ActionButton variant="default" iconOnly icon={<Pencil className="size-3" />} />
                {(isPending || isRevoked) && (
                  <ActionButton
                    variant="green"
                    icon={<Download className="size-3" />}
                    onClick={() => issueCertMutation.mutate({ id: node.id })}
                    disabled={issueCertMutation.isPending}
                  >
                    Cert
                  </ActionButton>
                )}
                {isEnrolled && (
                  <ActionButton
                    variant="danger"
                    icon={<ShieldAlert className="size-3" />}
                    onClick={() => setShowRevoke(true)}
                  >
                    Revoke
                  </ActionButton>
                )}
                <ActionButton
                  variant="danger"
                  icon={<PowerOff className="size-3" />}
                  onClick={() => setShowDecommission(true)}
                >
                  Decom.
                </ActionButton>
              </>
            )}
            {isDecommissioned && (
              <ActionButton
                variant="green"
                icon={<Power className="size-3" />}
                onClick={() => recommissionMutation.mutate({ id: node.id })}
                disabled={recommissionMutation.isPending}
              >
                Recommission
              </ActionButton>
            )}
          </>
        }
      />
      {error && <div className="text-[10px] text-red-400 px-1">{error}</div>}
      {showRevoke && (
        <RevokeModal
          nodeName={node.name}
          onConfirm={(reason) => revokeMutation.mutate({ id: node.id, reason: reason || undefined })}
          onCancel={() => setShowRevoke(false)}
          isPending={revokeMutation.isPending}
        />
      )}
      {showDecommission && (
        <ConfirmModal
          icon={<PowerOff className="size-3.5 text-red-400" />}
          title="Decommission Drone"
          confirmVariant="danger"
          confirmLabel="Decommission"
          confirmingLabel="Decommissioning..."
          confirmIcon={<PowerOff className="size-3" />}
          onConfirm={() => decommissionMutation.mutate({ id: node.id })}
          onCancel={() => setShowDecommission(false)}
          isPending={decommissionMutation.isPending}
        >
          <p className="text-[12px] text-[#888] mb-2 leading-relaxed">
            Decommission <span className="text-foreground font-medium">{node.name}</span>?
          </p>
          <p className="text-[11px] text-[#555] leading-relaxed">
            This will take the drone offline and revoke its certificate.
          </p>
        </ConfirmModal>
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FleetPage() {
  const [showDecommissioned, setShowDecommissioned] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBase, setFilterBase] = useState("");
  const { data: nodes, isLoading } = trpc.nodes.list.useQuery({ includeDecommissioned: showDecommissioned }, { refetchInterval: 15_000 });
  const { data: bases = [] } = trpc.bases.list.useQuery();
  const [showCreate, setShowCreate] = useState(false);
  const isMobile = useIsMobile();
  const [expandedId, toggleExpanded] = useExpandedCard();

  const stats = useMemo(() => {
    if (!nodes) return { total: 0, enrolled: 0, pending: 0, withBase: 0 };
    return {
      total: nodes.length,
      enrolled: nodes.filter((n) => !!n.enrolled_at && !n.decommissioned_at).length,
      pending: nodes.filter((n) => !n.enrolled_at && !n.decommissioned_at).length,
      withBase: nodes.filter((n) => !!n.base_id).length,
    };
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    if (!nodes) return nodes;
    let result = nodes;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((n) =>
        n.name.toLowerCase().includes(q) ||
        (n.serial && n.serial.toLowerCase().includes(q))
      );
    }
    if (filterBase) {
      result = result.filter((n) => n.base_id === filterBase);
    }
    return result;
  }, [nodes, searchQuery, filterBase]);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Page header */}
      <div className="px-(--page-padding) pt-4 pb-0 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[15px] font-semibold text-foreground tracking-[-0.01em]">Fleet</h1>
            <p className="text-[11px] text-[#555] font-mono mt-0.5">
              {isLoading ? "Loading..." : `${nodes?.length ?? 0} drone${(nodes?.length ?? 0) === 1 ? "" : "s"} registered`}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide px-3.5 py-2 rounded-md bg-foreground text-background font-medium hover:bg-foreground/80 transition-colors"
          >
            <Plus className="size-3.5" />
            Register Drone
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1a1a1a] border-y border-[#1a1a1a]">
        <StatCell label="Total" value={stats.total} />
        <StatCell label="Enrolled" value={stats.enrolled} color="text-fleet-green" />
        <StatCell label="Pending" value={stats.pending} color={stats.pending > 0 ? "text-fleet-amber" : "text-foreground"} />
        <StatCell label="Assigned to Base" value={stats.withBase} />
      </div>

      {/* Filter bar */}
      <div className="shrink-0 px-(--page-padding) py-3 border-b border-[#1a1a1a] flex items-center gap-3 bg-[#0f0f0f]">
        <div className="relative flex-1 md:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#3a3a3a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or serial..."
            className="w-full bg-[#080808] border border-[#1a1a1a] rounded-md pl-8 pr-3 py-1.5 font-mono text-[11px] text-foreground placeholder:text-[#3a3a3a] focus:outline-none focus:border-[#252525] transition-colors"
          />
        </div>
        {!isMobile && bases.length > 0 && (
          <select
            value={filterBase}
            onChange={(e) => setFilterBase(e.target.value)}
            className="bg-[#080808] border border-[#1a1a1a] rounded-md px-2.5 py-1.5 font-mono text-[11px] text-foreground focus:outline-none focus:border-[#252525] transition-colors"
          >
            <option value="">All Bases</option>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}
        {!isMobile && (
          <label className="flex items-center gap-2 cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={showDecommissioned}
              onChange={(e) => setShowDecommissioned(e.target.checked)}
              className="accent-[#555] size-3"
            />
            <span className="font-mono text-[10px] text-[#555]">Show decommissioned</span>
          </label>
        )}
      </div>

      {/* Table / Cards */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="size-5 border-2 border-[#252525] border-t-[#666] rounded-full animate-spin" />
            <span className="font-mono text-[11px] text-[#555]">Loading drones...</span>
          </div>
        ) : !filteredNodes || filteredNodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="size-10 rounded-full bg-[#0f0f0f] border border-[#1a1a1a] flex items-center justify-center">
              <Cpu className="size-4 text-[#3a3a3a]" />
            </div>
            <div className="text-center">
              <div className="font-mono text-[12px] text-[#555]">
                {searchQuery || filterBase ? "No drones match your filters" : "No drones registered yet"}
              </div>
              <div className="font-mono text-[10px] text-[#3a3a3a] mt-1">
                {searchQuery || filterBase ? "Try different search criteria" : "Register a drone to get started"}
              </div>
            </div>
          </div>
        ) : isMobile ? (
          <div className="flex flex-col gap-2 p-(--page-padding) pb-24">
            {filteredNodes.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                bases={bases}
                expanded={expandedId === node.id}
                onToggle={() => toggleExpanded(node.id)}
              />
            ))}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a] sticky top-0 z-10">
                <th className="pl-4 pr-2 py-2.5 w-8" />
                <th className="px-3 py-2.5 text-left">
                  <span className="font-mono text-[9px] tracking-[.08em] text-[#555] uppercase">Name</span>
                </th>
                <th className="px-3 py-2.5 text-left">
                  <span className="font-mono text-[9px] tracking-[.08em] text-[#555] uppercase">Serial</span>
                </th>
                <th className="px-3 py-2.5 text-left">
                  <span className="font-mono text-[9px] tracking-[.08em] text-[#555] uppercase">Base</span>
                </th>
                <th className="px-3 py-2.5 text-left">
                  <span className="font-mono text-[9px] tracking-[.08em] text-[#555] uppercase">Status</span>
                </th>
                <th className="px-3 py-2.5 text-left">
                  <span className="font-mono text-[9px] tracking-[.08em] text-[#555] uppercase">Firmware</span>
                </th>
                <th className="px-4 py-2.5 w-48" />
              </tr>
            </thead>
            <tbody>
              {filteredNodes.map((node) => (
                <NodeRow
                  key={node.id}
                  node={node}
                  bases={bases}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateNodeModal
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
