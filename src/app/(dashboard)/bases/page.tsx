"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  MapPin,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Wrench,
  Plus,
  RotateCcw,
  KeyRound,
  FileKey,
  FileLock2,
  Power,
  PowerOff,
  Pencil,
  X,
  Check,
  Copy,
  Download,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Search,
} from "lucide-react";
import { ActionButton, ConfirmModal, FieldInput, Toggle } from "@/components/dashboard";

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

function formatCoords(lat?: number, lng?: number) {
  if (lat == null || lng == null) return null;
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}\u00B0${latDir}, ${Math.abs(lng).toFixed(4)}\u00B0${lngDir}`;
}

// ── Provisioning Token Modal ─────────────────────────────────────────────────

function TokenModal({ token, onClose }: { token: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f0f0f] border border-[#252525] rounded-lg p-6 max-w-lg w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="size-3.5 text-amber-400" />
          <span className="font-mono text-[10px] tracking-[.08em] text-amber-400 uppercase font-medium">Provisioning Token</span>
        </div>
        <p className="text-[12px] text-[#888] mb-4 leading-relaxed">
          This token is shown <span className="text-foreground font-medium">once</span>. Copy it now and transfer it to the device for enrollment.
        </p>
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-md p-3.5 mb-4 break-all">
          <code className="font-mono text-[11px] text-emerald-400 select-all leading-relaxed">{token}</code>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide px-3.5 py-2 rounded-md bg-foreground text-background font-medium hover:bg-foreground/80 transition-colors"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? "Copied" : "Copy Token"}
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide px-3.5 py-2 rounded-md border border-[#252525] text-[#888] hover:text-foreground hover:border-[#3a3a3a] transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Credential Bundle Modal ──────────────────────────────────────────────────

function downloadPemFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/x-pem-file" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function CertBundleModal({
  entityName,
  certificate,
  privateKey,
  caCert,
  onClose,
}: {
  entityName: string;
  certificate: string;
  privateKey: string;
  caCert: string;
  onClose: () => void;
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const handleCopy = async (field: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleExpand = (field: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(field) ? next.delete(field) : next.add(field);
      return next;
    });
  };

  const slug = entityName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const handleDownloadAll = () => {
    downloadPemFile(`${slug}-cert.pem`, certificate);
    setTimeout(() => downloadPemFile(`${slug}-key.pem`, privateKey), 100);
    setTimeout(() => downloadPemFile(`${slug}-ca.pem`, caCert), 200);
  };

  const pemBlocks = [
    { key: "cert", label: "Certificate", content: certificate },
    { key: "key", label: "Private Key", content: privateKey },
    { key: "ca", label: "CA Certificate", content: caCert },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f0f0f] border border-[#252525] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
          <FileLock2 className="size-3.5 text-amber-400" />
          <span className="font-mono text-[10px] tracking-[.08em] text-amber-400 uppercase font-medium">Credential Bundle</span>
        </div>
        <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/15 rounded-md px-3 py-2.5 mb-4 mt-3">
          <AlertTriangle className="size-3.5 text-red-400 shrink-0" />
          <span className="text-[11px] text-red-400">The private key is shown once. Download the bundle now.</span>
        </div>
        <div className="font-mono text-[13px] text-foreground font-semibold mb-4">{entityName}</div>

        {pemBlocks.map(({ key, label, content }) => (
          <div key={key} className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <button
                onClick={() => toggleExpand(key)}
                className="flex items-center gap-1.5 font-mono text-[11px] text-[#888] hover:text-foreground transition-colors"
              >
                {expanded.has(key) ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                {label}
              </button>
              <button
                onClick={() => handleCopy(key, content)}
                className="inline-flex items-center gap-1 font-mono text-[10px] tracking-wide px-2 py-1 rounded border border-[#252525] text-[#666] hover:text-foreground hover:border-[#3a3a3a] transition-colors"
              >
                {copiedField === key ? <Check className="size-2.5" /> : <Copy className="size-2.5" />}
                {copiedField === key ? "Copied" : "Copy"}
              </button>
            </div>
            {expanded.has(key) && (
              <pre className="bg-[#080808] border border-[#1a1a1a] rounded-md p-3 overflow-x-auto max-h-32 overflow-y-auto">
                <code className="font-mono text-[10px] text-emerald-400 whitespace-pre select-all">{content}</code>
              </pre>
            )}
          </div>
        ))}

        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={handleDownloadAll}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide px-3.5 py-2 rounded-md bg-foreground text-background font-medium hover:bg-foreground/80 transition-colors"
          >
            <Download className="size-3" />
            Download All
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide px-3.5 py-2 rounded-md border border-[#252525] text-[#888] hover:text-foreground hover:border-[#3a3a3a] transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Credential State Type ────────────────────────────────────────────────────

type PendingCredential =
  | { type: "token"; token: string }
  | { type: "cert"; certificate: string; private_key: string; ca_cert: string; entityName: string }
  | null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f0f0f] border border-[#252525] rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
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
    </div>
  );
}

// ── (Confirmation modals use ConfirmModal from @/components/dashboard) ────────

// ── Create Base Modal ────────────────────────────────────────────────────────

function CreateBaseModal({
  onClose,
  onTokenReceived,
}: {
  onClose: () => void;
  onTokenReceived: (token: string) => void;
}) {
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = trpc.bases.create.useMutation({
    onSuccess: (data) => {
      utils.bases.list.invalidate();
      onTokenReceived(data.provisioning_token);
      onClose();
    },
    onError: (e) => setError(e.message),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-[#0f0f0f] border border-[#252525] rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[10px] tracking-[.06em] text-[#555] uppercase block mb-1.5">Latitude</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="47.3769"
                className="w-full bg-[#080808] border border-[#252525] rounded-md px-3 py-2 font-mono text-[12px] text-foreground placeholder:text-[#3a3a3a] focus:outline-none focus:border-[#3a3a3a] transition-colors"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-[.06em] text-[#555] uppercase block mb-1.5">Longitude</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="8.5417"
                className="w-full bg-[#080808] border border-[#252525] rounded-md px-3 py-2 font-mono text-[12px] text-foreground placeholder:text-[#3a3a3a] focus:outline-none focus:border-[#3a3a3a] transition-colors"
              />
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
    </div>
  );
}

// ── Status Chip ──────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: string }) {
  if (status === "decommissioned") {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[.04em] uppercase px-2 py-0.5 rounded-full bg-[#252525] text-[#555]">
        <span className="size-1.5 rounded-full bg-[#555]" />
        Decommissioned
      </span>
    );
  }
  if (status === "enrolled") {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[.04em] uppercase px-2 py-0.5 rounded-full bg-fleet-green-dim text-fleet-green border border-fleet-green/15">
        <span className="size-1.5 rounded-full bg-fleet-green animate-status-pulse" />
        Enrolled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[.04em] uppercase px-2 py-0.5 rounded-full bg-fleet-amber-dim text-fleet-amber border border-fleet-amber/15">
      <span className="size-1.5 rounded-full bg-fleet-amber animate-status-pulse-fast" />
      Pending
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

interface BaseCardProps {
  base: {
    id: string;
    name: string;
    status: string;
    lat?: number;
    lng?: number;
    maintenance_mode: boolean;
    enrolled_at?: string;
    cert_expires_at?: string;
    decommissioned_at?: string;
    created_at: string;
  };
  onTokenReceived: (token: string) => void;
  onCertIssued: (cert: { certificate: string; private_key: string; ca_cert: string }) => void;
}

function BaseCard({ base, onTokenReceived, onCertIssued }: BaseCardProps) {
  const utils = trpc.useUtils();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(base.name);
  const [editLat, setEditLat] = useState(base.lat?.toString() ?? "");
  const [editLng, setEditLng] = useState(base.lng?.toString() ?? "");
  const [editMaintenance, setEditMaintenance] = useState(base.maintenance_mode);
  const [error, setError] = useState<string | null>(null);
  const [showRevoke, setShowRevoke] = useState(false);
  const [showIssueCert, setShowIssueCert] = useState(false);
  const [showDecommission, setShowDecommission] = useState(false);

  const isEnrolled = base.status === "enrolled";
  const isPending = base.status === "pending";
  const isDecommissioned = !!base.decommissioned_at;
  const coords = formatCoords(base.lat, base.lng);

  const updateMutation = trpc.bases.update.useMutation({
    onSuccess: () => {
      utils.bases.list.invalidate();
      setEditing(false);
      setError(null);
    },
    onError: (e) => setError(e.message),
  });

  const revokeMutation = trpc.bases.revokeCert.useMutation({
    onSuccess: () => {
      utils.bases.list.invalidate();
      setShowRevoke(false);
    },
    onError: (e) => setError(e.message),
  });

  const decommissionMutation = trpc.bases.decommission.useMutation({
    onSuccess: () => { utils.bases.list.invalidate(); setShowDecommission(false); },
    onError: (e) => { setShowDecommission(false); setError(e.message); },
  });
  const recommissionMutation = trpc.bases.recommission.useMutation({
    onSuccess: () => { utils.bases.list.invalidate(); },
    onError: (e) => setError(e.message),
  });

  const regenerateMutation = trpc.bases.regenerateToken.useMutation({
    onSuccess: (data) => {
      onTokenReceived(data.provisioning_token);
    },
    onError: (e) => setError(e.message),
  });

  const issueCertMutation = trpc.bases.issueCert.useMutation({
    onSuccess: (data) => {
      utils.bases.list.invalidate();
      setShowIssueCert(false);
      onCertIssued(data);
      setTimeout(() => issueCertMutation.reset(), 0);
    },
    onError: (e) => { setShowIssueCert(false); setError(e.message); },
  });

  const handleSave = () => {
    setError(null);
    updateMutation.mutate({
      id: base.id,
      name: editName.trim() || undefined,
      lat: editLat !== "" ? parseFloat(editLat) : undefined,
      lng: editLng !== "" ? parseFloat(editLng) : undefined,
      maintenance_mode: editMaintenance,
    });
  };

  const handleCancel = () => {
    setEditName(base.name);
    setEditLat(base.lat?.toString() ?? "");
    setEditLng(base.lng?.toString() ?? "");
    setEditMaintenance(base.maintenance_mode);
    setEditing(false);
    setError(null);
  };

  return (
    <>
      <div className={`bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg overflow-hidden transition-all hover:border-[#252525] ${isDecommissioned ? "opacity-50" : ""}`}>
        {/* Card header */}
        <div className="px-5 pt-4 pb-3 flex items-start justify-between">
          <div className="min-w-0">
            {editing ? (
              <FieldInput
                value={editName}
                onChange={(e) => setEditName(e.currentTarget.value)}
                className="w-48 -ml-1 !font-sans !text-[14px] !font-semibold"
                size="sm"
              />
            ) : (
              <h3 className="text-[14px] font-semibold text-foreground tracking-[-0.01em]">{base.name}</h3>
            )}
            {editing ? (
              <div className="flex items-center gap-1.5 mt-1.5">
                <MapPin className="size-3 text-[#3a3a3a] shrink-0 mt-0.5" />
                <FieldInput type="number" step="any" value={editLat} onChange={(e) => setEditLat(e.currentTarget.value)} placeholder="Lat" size="sm" className="w-24" />
                <FieldInput type="number" step="any" value={editLng} onChange={(e) => setEditLng(e.currentTarget.value)} placeholder="Lng" size="sm" className="w-24" />
              </div>
            ) : coords ? (
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="size-3 text-[#3a3a3a]" />
                <span className="font-mono text-[11px] text-[#555]">{coords}</span>
              </div>
            ) : null}
          </div>
          <StatusChip status={base.status} />
        </div>

        {/* Info rows */}
        <div className="px-5 pb-3 space-y-2">
          {/* Enrollment info */}
          <div className="flex items-center justify-between py-2 border-t border-[#1a1a1a]">
            <div className="flex items-center gap-2">
              <Shield className="size-3 text-[#3a3a3a]" />
              <span className="font-mono text-[10px] tracking-[.06em] text-[#555] uppercase">Enrollment</span>
            </div>
            {isEnrolled && base.enrolled_at ? (
              <div className="text-right">
                <div className="font-mono text-[11px] text-[#888]">{formatDate(base.enrolled_at)}</div>
                {base.cert_expires_at && (
                  <div className="font-mono text-[10px] text-[#555]">expires {formatDate(base.cert_expires_at)}</div>
                )}
              </div>
            ) : (
              <span className="font-mono text-[10px] text-[#3a3a3a]">Awaiting enrollment</span>
            )}
          </div>

          {/* Maintenance */}
          <div className="flex items-center justify-between py-2 border-t border-[#1a1a1a]">
            <div className="flex items-center gap-2">
              <Wrench className="size-3 text-[#3a3a3a]" />
              <span className="font-mono text-[10px] tracking-[.06em] text-[#555] uppercase">Maintenance</span>
            </div>
            {editing ? (
              <Toggle checked={editMaintenance} onChange={setEditMaintenance} label={editMaintenance ? "On" : "Off"} />
            ) : base.maintenance_mode ? (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[.04em] uppercase px-2 py-0.5 rounded-full bg-fleet-amber-dim text-fleet-amber border border-fleet-amber/15">
                Active
              </span>
            ) : (
              <span className="font-mono text-[10px] text-[#3a3a3a]">{"—"}</span>
            )}
          </div>

          {/* Created */}
          <div className="flex items-center justify-between py-2 border-t border-[#1a1a1a]">
            <div className="flex items-center gap-2">
              <Clock className="size-3 text-[#3a3a3a]" />
              <span className="font-mono text-[10px] tracking-[.06em] text-[#555] uppercase">Created</span>
            </div>
            <span className="font-mono text-[11px] text-[#555]">{formatDate(base.created_at)}</span>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="px-5 pb-2">
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
                  <ActionButton icon={<Pencil className="size-3" />} onClick={() => setEditing(true)}>Edit</ActionButton>
                  {isPending && (
                    <>
                      <ActionButton variant="amber" icon={<RotateCcw className="size-3" />} onClick={() => regenerateMutation.mutate({ id: base.id })} disabled={regenerateMutation.isPending}>
                        {regenerateMutation.isPending ? "..." : "New Token"}
                      </ActionButton>
                      <ActionButton icon={<FileKey className="size-3" />} onClick={() => setShowIssueCert(true)}>Issue Cert</ActionButton>
                    </>
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
          title="Issue Certificate"
          confirmVariant="green"
          confirmLabel="Issue Certificate"
          confirmingLabel="Issuing..."
          confirmIcon={<FileKey className="size-3" />}
          onConfirm={() => issueCertMutation.mutate({ id: base.id })}
          onCancel={() => setShowIssueCert(false)}
          isPending={issueCertMutation.isPending}
        >
          <p className="text-[12px] text-[#888] mb-2 leading-relaxed">
            Issue a certificate for <span className="text-foreground font-medium">{base.name}</span>?
          </p>
          <p className="text-[11px] text-[#555] leading-relaxed">
            This will mark the base as enrolled and generate a TLS certificate bundle. Only proceed if the base has completed provisioning and is ready to authenticate.
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
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BasesPage() {
  const [showDecommissioned, setShowDecommissioned] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: bases, isLoading } = trpc.bases.list.useQuery({ includeDecommissioned: showDecommissioned });
  const [showCreate, setShowCreate] = useState(false);
  const [pendingCredential, setPendingCredential] = useState<PendingCredential>(null);

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
      <div className="px-5 pt-4 pb-0 shrink-0">
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
      <div className="shrink-0 grid grid-cols-4 gap-px bg-[#1a1a1a] border-y border-[#1a1a1a]">
        <StatCell label="Total" value={stats.total} />
        <StatCell label="Enrolled" value={stats.enrolled} color="text-fleet-green" />
        <StatCell label="Pending" value={stats.pending} color={stats.pending > 0 ? "text-fleet-amber" : "text-foreground"} />
        <StatCell label="Maintenance" value={stats.maintenance} color={stats.maintenance > 0 ? "text-fleet-amber" : "text-foreground"} />
      </div>

      {/* Filter bar */}
      <div className="shrink-0 px-5 py-3 border-b border-[#1a1a1a] flex items-center gap-3">
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
      <div className="flex-1 overflow-y-auto p-5">
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
                onTokenReceived={(token) => setPendingCredential({ type: "token", token })}
                onCertIssued={(cert) => setPendingCredential({ type: "cert", ...cert, entityName: base.name })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateBaseModal
          onClose={() => setShowCreate(false)}
          onTokenReceived={(token) => setPendingCredential({ type: "token", token })}
        />
      )}
      {pendingCredential?.type === "token" && (
        <TokenModal token={pendingCredential.token} onClose={() => setPendingCredential(null)} />
      )}
      {pendingCredential?.type === "cert" && (
        <CertBundleModal
          entityName={pendingCredential.entityName}
          certificate={pendingCredential.certificate}
          privateKey={pendingCredential.private_key}
          caCert={pendingCredential.ca_cert}
          onClose={() => setPendingCredential(null)}
        />
      )}
    </div>
  );
}
