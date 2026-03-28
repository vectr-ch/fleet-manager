"use client";

import { useState, useMemo } from "react";
import { friendlyError } from "@/lib/error-messages";
import { getNodeEditDefaults, validateNodeEditBaseId, validateNodeEditName } from "@/lib/node-edit";
import { trpc } from "@/lib/trpc/client";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Plus,
  RotateCcw,
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
  KeyRound,
  Cpu,
  Server,
} from "lucide-react";
import { InlineEditActions } from "@/components/dashboard/inline-edit-actions";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f0f0f] border border-[#252525] rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
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
    </div>
  );
}

// ── Status Dot ───────────────────────────────────────────────────────────────

function StatusDot({ enrolled_at, decommissioned_at }: { enrolled_at?: string; decommissioned_at?: string }) {
  if (decommissioned_at) {
    return <span className="size-2 rounded-full bg-[#3a3a3a]" title="Decommissioned" />;
  }
  if (enrolled_at) {
    return <span className="size-2 rounded-full bg-fleet-green shadow-[0_0_4px_#22c55e88] animate-status-pulse" title="Enrolled" />;
  }
  return <span className="size-2 rounded-full bg-fleet-amber shadow-[0_0_4px_#f59e0b88] animate-status-pulse-fast" title="Pending" />;
}

function StatusLabel({ enrolled_at, decommissioned_at }: { enrolled_at?: string; decommissioned_at?: string }) {
  if (decommissioned_at) {
    return <span className="font-mono text-[10px] tracking-[.04em] uppercase text-[#555]">Decommissioned</span>;
  }
  if (enrolled_at) {
    return <span className="font-mono text-[10px] tracking-[.04em] uppercase text-fleet-green">Enrolled</span>;
  }
  return <span className="font-mono text-[10px] tracking-[.04em] uppercase text-fleet-amber">Pending</span>;
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
  onTokenReceived,
}: {
  onClose: () => void;
  onTokenReceived: (token: string) => void;
}) {
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [serial, setSerial] = useState("");
  const [baseId, setBaseId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: bases } = trpc.bases.list.useQuery();

  const createMutation = trpc.nodes.create.useMutation({
    onSuccess: (data) => {
      utils.nodes.list.invalidate();
      onTokenReceived(data.provisioning_token);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-[#0f0f0f] border border-[#252525] rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
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
    </div>
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
    enrolled_at?: string;
    cert_expires_at?: string;
    decommissioned_at?: string;
    created_at: string;
  };
  bases: { id: string; name: string }[];
  onTokenReceived: (token: string) => void;
  onCertIssued: (cert: { certificate: string; private_key: string; ca_cert: string }) => void;
}

function NodeRow({ node, bases, onTokenReceived, onCertIssued }: NodeRowProps) {
  const utils = trpc.useUtils();
  const initialEditState = getNodeEditDefaults(node);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(initialEditState.name);
  const [editSerial, setEditSerial] = useState(initialEditState.serial);
  const [editBaseId, setEditBaseId] = useState(initialEditState.baseId);
  const [error, setError] = useState<string | null>(null);
  const [showRevoke, setShowRevoke] = useState(false);

  const isEnrolled = !!node.enrolled_at;
  const isPending = !node.enrolled_at;
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
    onSuccess: () => { utils.nodes.list.invalidate(); },
    onError: (e) => setError(friendlyError(e)),
  });
  const recommissionMutation = trpc.nodes.recommission.useMutation({
    onSuccess: () => { utils.nodes.list.invalidate(); },
    onError: (e) => setError(friendlyError(e)),
  });

  const regenerateMutation = trpc.nodes.regenerateToken.useMutation({
    onSuccess: (data) => {
      onTokenReceived(data.provisioning_token);
    },
    onError: (e) => setError(friendlyError(e)),
  });

  const issueCertMutation = trpc.nodes.issueCert.useMutation({
    onSuccess: (data) => {
      utils.nodes.list.invalidate();
      onCertIssued(data);
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
        <td className="pl-4 pr-2 py-2.5"><StatusDot enrolled_at={node.enrolled_at} decommissioned_at={node.decommissioned_at} /></td>
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
        <td className="px-3 py-2.5"><StatusLabel enrolled_at={node.enrolled_at} decommissioned_at={node.decommissioned_at} /></td>
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
          <StatusDot enrolled_at={node.enrolled_at} decommissioned_at={node.decommissioned_at} />
        </td>
        <td className="px-3 py-3">
          <div>
            <div className="font-mono text-[12px] font-medium text-foreground">{node.name}</div>
            {node.enrolled_at && node.cert_expires_at && (
              <div className="font-mono text-[10px] text-[#3a3a3a] mt-0.5">expires {formatDate(node.cert_expires_at)}</div>
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
          <StatusLabel enrolled_at={node.enrolled_at} decommissioned_at={node.decommissioned_at} />
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
                {isPending && (
                  <>
                    <button
                      onClick={() => issueCertMutation.mutate({ id: node.id })}
                      disabled={issueCertMutation.isPending}
                      className="inline-flex items-center justify-center size-7 rounded-md bg-fleet-green-dim text-fleet-green border border-fleet-green/15 hover:bg-fleet-green/15 disabled:opacity-50 transition-colors"
                      title="Issue Certificate"
                    >
                      <FileKey className="size-3" />
                    </button>
                    <button
                      onClick={() => regenerateMutation.mutate({ id: node.id })}
                      disabled={regenerateMutation.isPending}
                      className="inline-flex items-center justify-center size-7 rounded-md bg-fleet-amber-dim text-fleet-amber border border-fleet-amber/15 hover:bg-fleet-amber/15 disabled:opacity-50 transition-colors"
                      title="Regenerate Token"
                    >
                      <RotateCcw className="size-3" />
                    </button>
                  </>
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
                  onClick={() => decommissionMutation.mutate({ id: node.id })}
                  disabled={decommissionMutation.isPending}
                  className="inline-flex items-center justify-center size-7 rounded-md border border-red-500/20 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
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
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FleetPage() {
  const [showDecommissioned, setShowDecommissioned] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBase, setFilterBase] = useState("");
  const { data: nodes, isLoading } = trpc.nodes.list.useQuery({ includeDecommissioned: showDecommissioned });
  const { data: bases = [] } = trpc.bases.list.useQuery();
  const [showCreate, setShowCreate] = useState(false);
  const [pendingCredential, setPendingCredential] = useState<PendingCredential>(null);

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
      <div className="px-5 pt-4 pb-0 shrink-0">
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
      <div className="shrink-0 grid grid-cols-4 gap-px bg-[#1a1a1a] border-y border-[#1a1a1a]">
        <StatCell label="Total" value={stats.total} />
        <StatCell label="Enrolled" value={stats.enrolled} color="text-fleet-green" />
        <StatCell label="Pending" value={stats.pending} color={stats.pending > 0 ? "text-fleet-amber" : "text-foreground"} />
        <StatCell label="Assigned to Base" value={stats.withBase} />
      </div>

      {/* Filter bar */}
      <div className="shrink-0 px-5 py-3 border-b border-[#1a1a1a] flex items-center gap-3 bg-[#0f0f0f]">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#3a3a3a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or serial..."
            className="w-full bg-[#080808] border border-[#1a1a1a] rounded-md pl-8 pr-3 py-1.5 font-mono text-[11px] text-foreground placeholder:text-[#3a3a3a] focus:outline-none focus:border-[#252525] transition-colors"
          />
        </div>
        {bases.length > 0 && (
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

      {/* Table */}
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
                  onTokenReceived={(token) => setPendingCredential({ type: "token", token })}
                  onCertIssued={(cert) => setPendingCredential({ type: "cert", ...cert, entityName: node.name })}
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
