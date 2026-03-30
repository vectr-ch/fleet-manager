"use client";

import { useState, useMemo } from "react";
import {
  getBaseEditDefaults,
  validateBaseEditCoordinates,
  validateBaseEditName,
} from "@/lib/base-edit";
import { trpc } from "@/lib/trpc/client";
import { friendlyError } from "@/lib/error-messages";
import {
  MapPin,
  Shield,
  ShieldCheck,
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
} from "lucide-react";
import { ActionButton, ConfirmModal, FieldInput, LocationPickerModal, Toggle } from "@/components/dashboard";
import { BottomSheet } from "@/components/dashboard/bottom-sheet";

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
    if (diffMs < 60_000) return "just now";
    if (diffMs < 3600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
    if (diffMs < 86400_000) return `${Math.floor(diffMs / 3600_000)}h ago`;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
      " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function formatCoords(lat?: number, lng?: number) {
  if (lat == null || lng == null) return null;
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}\u00B0${latDir}, ${Math.abs(lng).toFixed(4)}\u00B0${lngDir}`;
}

function certExpiryDays(certExpiresAt?: string): { days: number; color: string } | null {
  if (!certExpiresAt) return null;
  const diff = new Date(certExpiresAt).getTime() - Date.now();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const color = days < 3 ? "text-red-400" : days < 14 ? "text-fleet-amber" : "text-foreground";
  return { days, color };
}

function latencyColor(ms: number): string {
  if (ms > 200) return "text-red-400";
  if (ms >= 50) return "text-fleet-amber";
  return "text-fleet-green";
}

function connectionStatus(lastSeenAt?: string | null): "active" | "delayed" | "offline" | "unknown" {
  if (!lastSeenAt) return "unknown";
  const diffMs = Date.now() - new Date(lastSeenAt).getTime();
  if (diffMs < 60_000) return "active";       // < 1 min
  if (diffMs < 600_000) return "delayed";      // < 10 min
  return "offline";
}

type DeviceStatusResult = { label: string; color: string; dot: "green-pulse" | "green" | "amber-pulse" | "amber-dim" | "red" | "grey" };

function deviceStatus(device: { cert_serial?: string | null; enrolled_at?: string | null; decommissioned_at?: string | null }): DeviceStatusResult {
  if (device.decommissioned_at) return { label: "Decommissioned", color: "text-[#555]", dot: "grey" };
  if (device.enrolled_at && device.cert_serial) return { label: "Enrolled", color: "text-fleet-green", dot: "green-pulse" };
  if (device.enrolled_at && !device.cert_serial) return { label: "Revoked", color: "text-red-400", dot: "red" };
  if (device.cert_serial && !device.enrolled_at) return { label: "Awaiting Connection", color: "text-fleet-amber", dot: "amber-pulse" };
  return { label: "Awaiting Certificate", color: "text-fleet-amber/60", dot: "amber-dim" };
}

function StatusDotElement({ dot, title, lastSeenAt }: { dot: DeviceStatusResult["dot"]; title: string; lastSeenAt?: string | null }) {
  // For enrolled devices, refine the dot based on connection status
  if (dot === "green-pulse" && lastSeenAt) {
    const conn = connectionStatus(lastSeenAt);
    if (conn === "active") {
      return <span className="size-1.5 rounded-full bg-fleet-green shadow-[0_0_4px_#22c55e88] animate-status-pulse" title="Active" />;
    }
    if (conn === "delayed") {
      return <span className="size-1.5 rounded-full bg-fleet-amber shadow-[0_0_4px_#f59e0b88]" title="Delayed" />;
    }
    if (conn === "offline") {
      return <span className="size-1.5 rounded-full bg-[#555]" title="Offline" />;
    }
  }
  if (dot === "green-pulse" || dot === "green") return <span className="size-1.5 rounded-full bg-fleet-green shadow-[0_0_4px_#22c55e88] animate-status-pulse" title={title} />;
  if (dot === "amber-pulse") return <span className="size-1.5 rounded-full bg-fleet-amber shadow-[0_0_4px_#f59e0b88] animate-status-pulse" title={title} />;
  if (dot === "amber-dim") return <span className="size-1.5 rounded-full bg-fleet-amber/40" title={title} />;
  if (dot === "red") return <span className="size-1.5 rounded-full bg-red-400 shadow-[0_0_4px_#f8717188]" title={title} />;
  return <span className="size-1.5 rounded-full bg-[#555]" title={title} />;
}

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
  baseName,
  onConfirm,
  onCancel,
  isPending,
}: {
  baseName: string;
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
          Revoke the certificate for <span className="text-foreground font-medium">{baseName}</span>?
          The base will return to pending status and require re-enrollment.
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

// ── (Confirmation modals use ConfirmModal from @/components/dashboard) ────────

// ── Create Base Modal ────────────────────────────────────────────────────────

function CreateBaseModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const createMutation = trpc.bases.create.useMutation({
    onSuccess: () => {
      utils.bases.list.invalidate();
      onClose();
    },
    onError: (e) => setError(friendlyError(e)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate({
      name: name.trim(),
      lat: lat !== "" ? parseFloat(lat) : undefined,
      lng: lng !== "" ? parseFloat(lng) : undefined,
    });
  };

  return (
    <BottomSheet open onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 md:p-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plus className="size-3.5 text-foreground" />
            <span className="font-mono text-[10px] tracking-[.08em] text-foreground uppercase font-medium">Create Base</span>
          </div>
          <button type="button" onClick={onClose} className="text-[#555] hover:text-foreground transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="font-mono text-[10px] tracking-[.06em] text-[#555] uppercase block mb-1.5">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Base Alpha"
              required
              className="w-full bg-[#080808] border border-[#252525] rounded-md px-3 py-2 font-mono text-[12px] text-foreground placeholder:text-[#3a3a3a] focus:outline-none focus:border-[#3a3a3a] transition-colors"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-mono text-[10px] tracking-[.06em] text-[#555] uppercase">Location</label>
              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                className="inline-flex items-center gap-1 font-mono text-[10px] text-[#555] hover:text-foreground transition-colors"
              >
                <MapPin className="size-3" />
                Choose on Map
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldInput type="number" step="any" value={lat} onChange={(e) => setLat(e.currentTarget.value)} placeholder="Latitude" />
              <FieldInput type="number" step="any" value={lng} onChange={(e) => setLng(e.currentTarget.value)} placeholder="Longitude" />
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
            {createMutation.isPending ? "Creating..." : "Create Base"}
          </button>
        </div>
      </form>
      {showMapPicker && (
        <LocationPickerModal
          initialLat={lat !== "" ? parseFloat(lat) : undefined}
          initialLng={lng !== "" ? parseFloat(lng) : undefined}
          onConfirm={(newLat, newLng) => {
            setLat(newLat.toFixed(6));
            setLng(newLng.toFixed(6));
            setShowMapPicker(false);
          }}
          onCancel={() => setShowMapPicker(false)}
        />
      )}
    </BottomSheet>
  );
}

// ── Status Chip ──────────────────────────────────────────────────────────────

function StatusChip({ device }: { device: { cert_serial?: string | null; enrolled_at?: string | null; decommissioned_at?: string | null; last_seen_at?: string | null } }) {
  const status = deviceStatus(device);
  const isEnrolled = status.label === "Enrolled";
  const conn = connectionStatus(device.last_seen_at);

  const connMap: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: "Active", color: "text-fleet-green", bg: "bg-fleet-green-dim border border-fleet-green/15" },
    delayed: { label: "Delayed", color: "text-fleet-amber", bg: "bg-fleet-amber-dim border border-fleet-amber/15" },
    offline: { label: "Offline", color: "text-[#555]", bg: "bg-[#252525]" },
    unknown: { label: "Enrolled", color: "text-fleet-green", bg: "bg-fleet-green-dim border border-fleet-green/15" },
  };

  const bgMap: Record<string, string> = {
    "Decommissioned": "bg-[#252525]",
    "Enrolled": "bg-fleet-green-dim border border-fleet-green/15",
    "Revoked": "bg-red-500/10 border border-red-500/15",
    "Awaiting Connection": "bg-fleet-amber-dim border border-fleet-amber/15",
    "Awaiting Certificate": "bg-fleet-amber/5 border border-fleet-amber/10",
  };

  const chipLabel = isEnrolled ? (connMap[conn]?.label ?? status.label) : status.label;
  const chipColor = isEnrolled ? (connMap[conn]?.color ?? status.color) : status.color;
  const chipBg = isEnrolled ? (connMap[conn]?.bg ?? bgMap[status.label]) : bgMap[status.label];

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[.04em] uppercase px-2 py-0.5 rounded-full ${chipBg ?? ""} ${chipColor}`}>
      <StatusDotElement dot={status.dot} title={chipLabel} lastSeenAt={device.last_seen_at} />
      {chipLabel}
    </span>
  );
}

// ── Stat Cell ────────────────────────────────────────────────────────────────

function StatCell({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-[#0f0f0f] px-4 py-3 flex flex-col gap-1">
      <span className="font-mono text-[9px] tracking-[.08em] text-[#555] uppercase">{label}</span>
      <span className={`font-mono text-[20px] font-semibold tracking-tight leading-none ${color ?? "text-foreground"}`}>{value}</span>
    </div>
  );
}

// ── Base Card ────────────────────────────────────────────────────────────────

interface ConnectedDrone {
  id: string;
  name: string;
  enrolled_at?: string;
  cert_serial?: string | null;
  last_seen_at?: string | null;
  decommissioned_at?: string;
}

interface BaseCardProps {
  base: {
    id: string;
    name: string;
    status: string;
    lat?: number;
    lng?: number;
    maintenance_mode: boolean;
    cert_serial?: string | null;
    enrolled_at?: string;
    last_seen_at?: string | null;
    firmware_version?: string | null;
    latency_ms?: number | null;
    cert_expires_at?: string;
    decommissioned_at?: string;
    created_at: string;
  };
  connectedDrones: ConnectedDrone[];
}

function droneTagStyle(drone: ConnectedDrone): { className: string; suffix: string } {
  const status = deviceStatus(drone);
  if (status.label === "Decommissioned") return { className: "bg-[#252525] text-[#555]", suffix: "" };
  if (status.label !== "Enrolled") return { className: "bg-[#1a1a1a] text-[#555]", suffix: "" };
  const conn = connectionStatus(drone.last_seen_at);
  if (conn === "active") return { className: "bg-fleet-green/10 text-fleet-green border border-fleet-green/15", suffix: "" };
  if (conn === "delayed") return { className: "bg-fleet-amber/10 text-fleet-amber border border-fleet-amber/15", suffix: " \u26A1" };
  return { className: "bg-[#252525] text-[#555]", suffix: "" };
}

function BaseCard({ base, connectedDrones }: BaseCardProps) {
  const utils = trpc.useUtils();
  const initialEditState = getBaseEditDefaults(base);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(initialEditState.name);
  const [editLat, setEditLat] = useState(initialEditState.lat);
  const [editLng, setEditLng] = useState(initialEditState.lng);
  const [editLatInvalid, setEditLatInvalid] = useState(false);
  const [editLngInvalid, setEditLngInvalid] = useState(false);
  const [editMaintenance, setEditMaintenance] = useState(initialEditState.maintenance);
  const [error, setError] = useState<string | null>(null);
  const [showRevoke, setShowRevoke] = useState(false);
  const [showIssueCert, setShowIssueCert] = useState(false);
  const [showDecommission, setShowDecommission] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const status = deviceStatus(base);
  const isEnrolled = status.label === "Enrolled";
  const isPending = status.label === "Awaiting Certificate" || status.label === "Awaiting Connection";
  const isRevoked = status.label === "Revoked";
  const isDecommissioned = !!base.decommissioned_at;
  const coords = formatCoords(base.lat, base.lng);

  const updateMutation = trpc.bases.update.useMutation({
    onSuccess: () => {
      utils.bases.list.invalidate();
      setEditing(false);
      setError(null);
    },
    onError: (e) => setError(friendlyError(e)),
  });

  const revokeMutation = trpc.bases.revokeCert.useMutation({
    onSuccess: () => {
      utils.bases.list.invalidate();
      setShowRevoke(false);
    },
    onError: (e) => setError(friendlyError(e)),
  });

  const decommissionMutation = trpc.bases.decommission.useMutation({
    onSuccess: () => { utils.bases.list.invalidate(); setShowDecommission(false); },
    onError: (e) => { setShowDecommission(false); setError(friendlyError(e)); },
  });
  const recommissionMutation = trpc.bases.recommission.useMutation({
    onSuccess: () => { utils.bases.list.invalidate(); },
    onError: (e) => setError(friendlyError(e)),
  });

  const issueCertMutation = trpc.bases.issueCert.useMutation({
    onSuccess: (data) => {
      utils.bases.list.invalidate();
      setShowIssueCert(false);
      downloadJsonBundle(data);
      setTimeout(() => issueCertMutation.reset(), 0);
    },
    onError: (e) => { setShowIssueCert(false); setError(friendlyError(e)); },
  });

  const handleSave = () => {
    const trimmedName = editName.trim();
    const validationError = validateBaseEditName(trimmedName);
    if (validationError) {
      setError(validationError);
      return;
    }

    const coordinateError = validateBaseEditCoordinates({
      lat: editLat,
      lng: editLng,
      hadCoordinates: base.lat != null || base.lng != null,
      hasInvalidInput: editLatInvalid || editLngInvalid,
    });
    if (coordinateError) {
      setError(coordinateError);
      return;
    }

    setError(null);
    updateMutation.mutate({
      id: base.id,
      name: trimmedName,
      lat: editLat !== "" ? parseFloat(editLat) : undefined,
      lng: editLng !== "" ? parseFloat(editLng) : undefined,
      maintenance_mode: editMaintenance,
    });
  };

  const resetEditState = () => {
    const next = getBaseEditDefaults(base);
    setEditName(next.name);
    setEditLat(next.lat);
    setEditLng(next.lng);
    setEditLatInvalid(false);
    setEditLngInvalid(false);
    setEditMaintenance(next.maintenance);
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

  return (
    <>
      <div className={`bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg overflow-hidden transition-all hover:border-[#252525] ${isDecommissioned ? "opacity-50" : ""}`}>
        {/* Card header */}
        <div className="px-(--page-padding) pt-4 pb-3 flex items-start justify-between">
          <div className="min-w-0">
            {editing ? (
              <FieldInput
                value={editName}
                onChange={(e) => setEditName(e.currentTarget.value)}
                className="w-48 -ml-1 !font-sans !text-[14px] !font-semibold"
                size="sm"
              />
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-semibold text-foreground tracking-[-0.01em]">{base.name}</h3>
                {isEnrolled && <StatusDotElement dot={status.dot} title={status.label} lastSeenAt={base.last_seen_at} />}
              </div>
            )}
            {editing ? (
              <div className="flex items-center gap-1.5 mt-1.5">
                <MapPin className="size-3 text-[#3a3a3a] shrink-0 mt-0.5" />
                <FieldInput
                  type="number"
                  step="any"
                  value={editLat}
                  onChange={(e) => {
                    setEditLat(e.currentTarget.value);
                    setEditLatInvalid(e.currentTarget.validity.badInput);
                  }}
                  placeholder="Lat"
                  size="sm"
                  className="w-24"
                />
                <FieldInput
                  type="number"
                  step="any"
                  value={editLng}
                  onChange={(e) => {
                    setEditLng(e.currentTarget.value);
                    setEditLngInvalid(e.currentTarget.validity.badInput);
                  }}
                  placeholder="Lng"
                  size="sm"
                  className="w-24"
                />
                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="inline-flex items-center justify-center size-7 rounded-md border border-[#252525] text-[#555] hover:text-foreground hover:border-[#3a3a3a] transition-colors"
                  title="Choose on Map"
                >
                  <MapPin className="size-3" />
                </button>
              </div>
            ) : coords ? (
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="size-3 text-[#3a3a3a]" />
                <span className="font-mono text-[11px] text-[#555]">{coords}</span>
              </div>
            ) : null}
          </div>
          <StatusChip device={base} />
        </div>

        {/* Header metrics grid — enrollment & maintenance */}
        <div className="px-(--page-padding) pb-3">
          <div className="grid grid-cols-3 gap-px border-t border-[#1a1a1a] pt-3">
            {/* Enrolled */}
            <div className="bg-[#080808] border border-[#1a1a1a] rounded p-2">
              <div className="font-mono text-[9px] uppercase tracking-[.08em] text-[#555]">Enrolled</div>
              <div className="font-mono text-[15px] font-semibold mt-0.5 text-foreground">
                {base.enrolled_at ? formatDateTime(base.enrolled_at) : <span className="text-[#3a3a3a]">Pending</span>}
              </div>
              {isRevoked && (
                <div className="font-mono text-[9px] text-red-400/70 mt-0.5">certificate revoked</div>
              )}
            </div>
            {/* Maintenance */}
            <div className="bg-[#080808] border border-[#1a1a1a] rounded p-2">
              <div className="font-mono text-[9px] uppercase tracking-[.08em] text-[#555]">Maintenance</div>
              {editing ? (
                <div className="mt-1">
                  <Toggle checked={editMaintenance} onChange={setEditMaintenance} label={editMaintenance ? "On" : "Off"} />
                </div>
              ) : (
                <div className={`font-mono text-[15px] font-semibold mt-0.5 ${base.maintenance_mode ? "text-fleet-amber" : "text-foreground"}`}>
                  {base.maintenance_mode ? "Active" : "Off"}
                </div>
              )}
            </div>
            {/* Created */}
            <div className="bg-[#080808] border border-[#1a1a1a] rounded p-2">
              <div className="font-mono text-[9px] uppercase tracking-[.08em] text-[#555]">Created</div>
              <div className="font-mono text-[15px] font-semibold mt-0.5 text-foreground">{formatDate(base.created_at)}</div>
            </div>
          </div>
        </div>

        {/* Telemetry metrics grid — only for enrolled bases */}
        {isEnrolled && (() => {
          const expiry = certExpiryDays(base.cert_expires_at);
          return (
            <div className="px-(--page-padding) pb-3">
              <div className="grid grid-cols-3 gap-px">
                {/* Latency */}
                <div className="bg-[#080808] border border-[#1a1a1a] rounded p-2">
                  <div className="font-mono text-[9px] uppercase tracking-[.08em] text-[#555]">Latency</div>
                  <div className={`font-mono text-[15px] font-semibold mt-0.5 ${base.latency_ms != null && base.latency_ms > 0 ? latencyColor(base.latency_ms) : "text-[#3a3a3a]"}`}>
                    {base.latency_ms != null && base.latency_ms > 0 ? `${base.latency_ms}ms` : "—"}
                  </div>
                </div>
                {/* Firmware */}
                <div className="bg-[#080808] border border-[#1a1a1a] rounded p-2">
                  <div className="font-mono text-[9px] uppercase tracking-[.08em] text-[#555]">Firmware</div>
                  <div className="font-mono text-[15px] font-semibold mt-0.5 text-foreground">
                    {base.firmware_version ?? <span className="text-[#3a3a3a]">—</span>}
                  </div>
                </div>
                {/* Cert Expiry */}
                <div className="bg-[#080808] border border-[#1a1a1a] rounded p-2">
                  <div className="font-mono text-[9px] uppercase tracking-[.08em] text-[#555]">Cert Expiry</div>
                  <div className={`font-mono text-[15px] font-semibold mt-0.5 ${expiry?.color ?? "text-[#3a3a3a]"}`}>
                    {expiry ? `${expiry.days} days` : "—"}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Connected Drones */}
        {isEnrolled && connectedDrones.length > 0 && (
          <div className="px-(--page-padding) pb-3">
            <div className="font-mono text-[9px] uppercase tracking-[.08em] text-[#555] mb-1.5">Connected Drones</div>
            <div className="flex flex-wrap gap-1.5">
              {connectedDrones.map((drone) => {
                const tag = droneTagStyle(drone);
                return (
                  <span key={drone.id} className={`font-mono text-[10px] px-2 py-0.5 rounded ${tag.className}`}>
                    {drone.name}{tag.suffix}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="px-(--page-padding) pb-2">
            <div className="flex items-center gap-2 text-[11px] text-red-400">
              <AlertTriangle className="size-3 shrink-0" />
              {error}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-4 py-3 border-t border-[#1a1a1a] bg-[#0a0a0a] flex flex-wrap items-center gap-1.5">
          {editing ? (
            <>
              <ActionButton variant="primary" icon={<Check className="size-3" />} onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save"}
              </ActionButton>
              <ActionButton icon={<X className="size-3" />} onClick={handleCancel}>Cancel</ActionButton>
            </>
          ) : (
            <>
              {!isDecommissioned && (
                <>
                  <ActionButton icon={<Pencil className="size-3" />} onClick={handleStartEdit}>Edit</ActionButton>
                  {(isPending || isRevoked) && (
                    <ActionButton variant="green" icon={<Download className="size-3" />} onClick={() => setShowIssueCert(true)}>Download Certificate Bundle</ActionButton>
                  )}
                  {isEnrolled && (
                    <ActionButton variant="danger" icon={<ShieldAlert className="size-3" />} onClick={() => setShowRevoke(true)}>Revoke</ActionButton>
                  )}
                  <ActionButton variant="danger" icon={<PowerOff className="size-3" />} onClick={() => setShowDecommission(true)} className="ml-auto">Decommission</ActionButton>
                </>
              )}
              {isDecommissioned && (
                <ActionButton variant="green" icon={<Power className="size-3" />} onClick={() => recommissionMutation.mutate({ id: base.id })} disabled={recommissionMutation.isPending}>
                  {recommissionMutation.isPending ? "..." : "Recommission"}
                </ActionButton>
              )}
            </>
          )}
        </div>
      </div>

      {showRevoke && (
        <RevokeModal
          baseName={base.name}
          onConfirm={(reason) => revokeMutation.mutate({ id: base.id, reason: reason || undefined })}
          onCancel={() => setShowRevoke(false)}
          isPending={revokeMutation.isPending}
        />
      )}
      {showIssueCert && (
        <ConfirmModal
          icon={<ShieldCheck className="size-3.5 text-fleet-green" />}
          title="Download Provisioning Bundle"
          confirmVariant="green"
          confirmLabel="Download Certificate Bundle"
          confirmingLabel="Issuing..."
          confirmIcon={<Download className="size-3" />}
          onConfirm={() => issueCertMutation.mutate({ id: base.id })}
          onCancel={() => setShowIssueCert(false)}
          isPending={issueCertMutation.isPending}
        >
          <p className="text-[12px] text-[#888] mb-2 leading-relaxed">
            Issue a certificate and download the provisioning bundle for <span className="text-foreground font-medium">{base.name}</span>?
          </p>
          <p className="text-[11px] text-[#555] leading-relaxed">
            This will mark the base as enrolled and download a JSON bundle containing the TLS certificate, private key, and gateway address. Only proceed if the base is ready to authenticate.
          </p>
        </ConfirmModal>
      )}
      {showDecommission && (
        <ConfirmModal
          icon={<PowerOff className="size-3.5 text-red-400" />}
          title="Decommission Base"
          confirmVariant="danger"
          confirmLabel="Decommission"
          confirmingLabel="Decommissioning..."
          confirmIcon={<PowerOff className="size-3" />}
          onConfirm={() => decommissionMutation.mutate({ id: base.id })}
          onCancel={() => setShowDecommission(false)}
          isPending={decommissionMutation.isPending}
        >
          <p className="text-[12px] text-[#888] mb-2 leading-relaxed">
            Decommission <span className="text-foreground font-medium">{base.name}</span>?
          </p>
          <p className="text-[11px] text-[#555] leading-relaxed">
            This will take the base offline and revoke its certificate if one is active. The base can be recommissioned later, but will require re-enrollment.
          </p>
        </ConfirmModal>
      )}
      {showMapPicker && (
        <LocationPickerModal
          initialLat={editLat !== "" ? parseFloat(editLat) : base.lat}
          initialLng={editLng !== "" ? parseFloat(editLng) : base.lng}
          onConfirm={(newLat, newLng) => {
            setEditLat(newLat.toFixed(6));
            setEditLng(newLng.toFixed(6));
            setEditLatInvalid(false);
            setEditLngInvalid(false);
            setShowMapPicker(false);
          }}
          onCancel={() => setShowMapPicker(false)}
        />
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BasesPage() {
  const [showDecommissioned, setShowDecommissioned] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: bases, isLoading } = trpc.bases.list.useQuery({ includeDecommissioned: showDecommissioned }, { refetchInterval: 15_000 });
  const { data: nodes } = trpc.nodes.list.useQuery(undefined, { refetchInterval: 15_000 });
  const [showCreate, setShowCreate] = useState(false);

  const nodesByBase = useMemo(() => {
    const map = new Map<string, ConnectedDrone[]>();
    if (!nodes) return map;
    for (const node of nodes) {
      if (!node.base_id) continue;
      const list = map.get(node.base_id) ?? [];
      list.push(node);
      map.set(node.base_id, list);
    }
    return map;
  }, [nodes]);

  const stats = useMemo(() => {
    if (!bases) return { total: 0, enrolled: 0, pending: 0, maintenance: 0 };
    return {
      total: bases.length,
      enrolled: bases.filter((b) => b.status === "enrolled").length,
      pending: bases.filter((b) => b.status === "pending").length,
      maintenance: bases.filter((b) => b.maintenance_mode).length,
    };
  }, [bases]);

  const filteredBases = useMemo(() => {
    if (!bases || !searchQuery.trim()) return bases;
    const q = searchQuery.toLowerCase();
    return bases.filter((b) => b.name.toLowerCase().includes(q));
  }, [bases, searchQuery]);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Page header */}
      <div className="px-(--page-padding) pt-4 pb-0 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[15px] font-semibold text-foreground tracking-[-0.01em]">Base Stations</h1>
            <p className="text-[11px] text-[#555] font-mono mt-0.5">
              {isLoading ? "Loading..." : `${bases?.length ?? 0} base${(bases?.length ?? 0) === 1 ? "" : "s"} registered`}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide px-3.5 py-2 rounded-md bg-foreground text-background font-medium hover:bg-foreground/80 transition-colors"
          >
            <Plus className="size-3.5" />
            Create Base
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1a1a1a] border-y border-[#1a1a1a]">
        <StatCell label="Total" value={stats.total} />
        <StatCell label="Enrolled" value={stats.enrolled} color="text-fleet-green" />
        <StatCell label="Pending" value={stats.pending} color={stats.pending > 0 ? "text-fleet-amber" : "text-foreground"} />
        <StatCell label="Maintenance" value={stats.maintenance} color={stats.maintenance > 0 ? "text-fleet-amber" : "text-foreground"} />
      </div>

      {/* Filter bar */}
      <div className="shrink-0 px-(--page-padding) py-3 border-b border-[#1a1a1a] flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#3a3a3a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bases..."
            className="w-full bg-[#080808] border border-[#1a1a1a] rounded-md pl-8 pr-3 py-1.5 font-mono text-[11px] text-foreground placeholder:text-[#3a3a3a] focus:outline-none focus:border-[#252525] transition-colors"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={showDecommissioned}
            onChange={(e) => setShowDecommissioned(e.target.checked)}
            className="accent-[#555] size-3"
          />
          <span className="font-mono text-[10px] text-[#555]">Show decommissioned</span>
        </label>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-(--page-padding)">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="size-5 border-2 border-[#252525] border-t-[#666] rounded-full animate-spin" />
            <span className="font-mono text-[11px] text-[#555]">Loading bases...</span>
          </div>
        ) : !filteredBases || filteredBases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="size-10 rounded-full bg-[#0f0f0f] border border-[#1a1a1a] flex items-center justify-center">
              <Shield className="size-4 text-[#3a3a3a]" />
            </div>
            <div className="text-center">
              <div className="font-mono text-[12px] text-[#555]">
                {searchQuery ? "No bases match your search" : "No bases yet"}
              </div>
              <div className="font-mono text-[10px] text-[#3a3a3a] mt-1">
                {searchQuery ? "Try a different search term" : "Create a base to get started"}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {filteredBases.map((base) => (
              <BaseCard
                key={base.id}
                base={base}
                connectedDrones={nodesByBase.get(base.id) ?? []}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateBaseModal
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
