"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

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

const inputClass =
  "bg-neutral-900 border border-neutral-700 rounded-[5px] px-2.5 py-1.5 font-mono text-[11px] text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 w-full";

// ── Provisioning Token Modal ─────────────────────────────────────────────────

function TokenModal({ token, onClose }: { token: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-neutral-900 border border-neutral-700 rounded-[5px] p-6 max-w-lg w-full mx-4">
        <div className="font-mono text-[10px] tracking-wider text-amber-400 uppercase mb-1">Provisioning Token</div>
        <div className="font-mono text-[11px] text-neutral-400 mb-4">
          This token is shown once. Copy it now and transfer it to the device for enrollment.
        </div>
        <div className="bg-neutral-950 border border-neutral-700 rounded-[5px] p-3 mb-4 break-all">
          <code className="font-mono text-[11px] text-emerald-400 select-all">{token}</code>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
          >
            {copied ? "Copied" : "Copy Token"}
          </button>
          <button
            onClick={onClose}
            className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-neutral-900 border border-neutral-700 rounded-[5px] p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="font-mono text-[10px] tracking-wider text-amber-400 uppercase mb-1">Credential Bundle</div>
        <div className="bg-red-900/20 border border-red-700/30 rounded-[5px] px-3 py-2 mb-4">
          <div className="font-mono text-[10px] text-red-400">
            The private key is shown once. Download the bundle now.
          </div>
        </div>
        <div className="font-mono text-[12px] text-foreground font-semibold mb-4">{entityName}</div>

        {pemBlocks.map(({ key, label, content }) => (
          <div key={key} className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <button
                onClick={() => toggleExpand(key)}
                className="font-mono text-[10px] tracking-wider text-neutral-400 uppercase hover:text-neutral-200 transition-colors"
              >
                {expanded.has(key) ? "\u25BC" : "\u25B6"} {label}
              </button>
              <button
                onClick={() => handleCopy(key, content)}
                className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                {copiedField === key ? "Copied" : "Copy"}
              </button>
            </div>
            {expanded.has(key) && (
              <pre className="bg-neutral-950 border border-neutral-700 rounded-[5px] p-3 overflow-x-auto max-h-32 overflow-y-auto">
                <code className="font-mono text-[10px] text-emerald-400 whitespace-pre select-all">{content}</code>
              </pre>
            )}
          </div>
        ))}

        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={handleDownloadAll}
            className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
          >
            Download All
          </button>
          <button
            onClick={onClose}
            className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-neutral-900 border border-neutral-700 rounded-[5px] p-6 max-w-md w-full mx-4">
        <div className="font-mono text-[10px] tracking-wider text-red-400 uppercase mb-1">Revoke Certificate</div>
        <div className="font-mono text-[11px] text-neutral-400 mb-4">
          Revoke the certificate for <span className="text-foreground font-semibold">{nodeName}</span>? The node will
          return to pending status and require re-enrollment.
        </div>
        <div className="mb-4">
          <label className="font-mono text-[10px] text-neutral-500 block mb-1">Reason (optional)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. device compromised"
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onConfirm(reason)}
            disabled={isPending}
            className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-red-700 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Revoking..." : "Revoke"}
          </button>
          <button
            onClick={onCancel}
            className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ enrolled_at, decommissioned_at }: { enrolled_at?: string; decommissioned_at?: string }) {
  if (decommissioned_at) {
    return (
      <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border bg-neutral-900/30 text-neutral-500 border-neutral-500/20">
        Decommissioned
      </span>
    );
  }
  if (enrolled_at) {
    return (
      <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border bg-emerald-900/30 text-emerald-400 border-emerald-400/20">
        Enrolled
      </span>
    );
  }
  return (
    <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border bg-amber-900/30 text-amber-400 border-amber-400/20">
      Pending
    </span>
  );
}

// ── Enrollment Info ──────────────────────────────────────────────────────────

function EnrollmentInfo({ node }: { node: { enrolled_at?: string; cert_expires_at?: string } }) {
  if (node.enrolled_at) {
    return (
      <div className="font-mono text-[11px]">
        <div className="text-neutral-400">{formatDate(node.enrolled_at)}</div>
        {node.cert_expires_at && (
          <div className="text-[10px] text-neutral-500">
            cert expires {formatDate(node.cert_expires_at)}
          </div>
        )}
      </div>
    );
  }
  return <span className="font-mono text-[10px] text-neutral-500">Awaiting enrollment</span>;
}

// ── Create Node Form ──────────────────────────────────────────────────────────

function CreateNodeForm({
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
    onError: (e) => setError(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate({
      name: name.trim(),
      serial: serial.trim() || undefined,
      base_id: baseId.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-800 border border-neutral-700 rounded-[5px] p-4 mb-4">
      <div className="font-mono text-[10px] tracking-wider text-neutral-400 uppercase mb-3">Register Node</div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className="font-mono text-[10px] text-neutral-500 block mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Node-01"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="font-mono text-[10px] text-neutral-500 block mb-1">Serial</label>
          <input
            type="text"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            placeholder="SN-XXXXXX"
            className={inputClass}
          />
        </div>
        <div>
          <label className="font-mono text-[10px] text-neutral-500 block mb-1">Base</label>
          <select
            value={baseId}
            onChange={(e) => setBaseId(e.target.value)}
            className={inputClass}
          >
            <option value="">{"\u2014"} None {"\u2014"}</option>
            {bases?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <div className="font-mono text-[10px] text-red-400 mb-3">{error}</div>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
        >
          {createMutation.isPending ? "Creating..." : "Register Node"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Node Table Row ────────────────────────────────────────────────────────────

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
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [editSerial, setEditSerial] = useState(node.serial ?? "");
  const [editBaseId, setEditBaseId] = useState(node.base_id ?? "");
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
    onError: (e) => setError(e.message),
  });

  const revokeMutation = trpc.nodes.revokeCert.useMutation({
    onSuccess: () => {
      utils.nodes.list.invalidate();
      setShowRevoke(false);
    },
    onError: (e) => setError(e.message),
  });

  const decommissionMutation = trpc.nodes.decommission.useMutation({
    onSuccess: () => { utils.nodes.list.invalidate(); },
    onError: (e) => setError(e.message),
  });
  const recommissionMutation = trpc.nodes.recommission.useMutation({
    onSuccess: () => { utils.nodes.list.invalidate(); },
    onError: (e) => setError(e.message),
  });

  const regenerateMutation = trpc.nodes.regenerateToken.useMutation({
    onSuccess: (data) => {
      onTokenReceived(data.provisioning_token);
    },
    onError: (e) => setError(e.message),
  });

  const issueCertMutation = trpc.nodes.issueCert.useMutation({
    onSuccess: (data) => {
      utils.nodes.list.invalidate();
      onCertIssued(data);
      // Clear private key from mutation cache immediately after capture
      setTimeout(() => issueCertMutation.reset(), 0);
    },
    onError: (e) => setError(e.message),
  });

  const handleSave = () => {
    setError(null);
    updateMutation.mutate({
      id: node.id,
      name: editName.trim() || undefined,
      serial: editSerial.trim() || undefined,
      base_id: editBaseId.trim() || undefined,
    });
  };

  const handleCancel = () => {
    setEditName(node.name);
    setEditSerial(node.serial ?? "");
    setEditBaseId(node.base_id ?? "");
    setEditing(false);
    setError(null);
  };

  const baseName = bases.find((b) => b.id === node.base_id)?.name ?? node.base_id ?? "\u2014";

  if (editing) {
    return (
      <tr className="border-b border-neutral-800 bg-neutral-800/50">
        <td className="px-4 py-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="bg-neutral-900 border border-neutral-600 rounded px-2 py-1 font-mono text-[11px] text-foreground focus:outline-none focus:border-neutral-400 w-36"
          />
        </td>
        <td className="px-3 py-2">
          <input
            type="text"
            value={editSerial}
            onChange={(e) => setEditSerial(e.target.value)}
            className="bg-neutral-900 border border-neutral-600 rounded px-2 py-1 font-mono text-[11px] text-foreground focus:outline-none focus:border-neutral-400 w-32"
          />
        </td>
        <td className="px-3 py-2">
          <select
            value={editBaseId}
            onChange={(e) => setEditBaseId(e.target.value)}
            className="bg-neutral-900 border border-neutral-600 rounded px-2 py-1 font-mono text-[11px] text-foreground focus:outline-none focus:border-neutral-400 w-36"
          >
            <option value="">{"\u2014"} None {"\u2014"}</option>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </td>
        <td className="px-3 py-2">
          <StatusBadge enrolled_at={node.enrolled_at} decommissioned_at={node.decommissioned_at} />
        </td>
        <td className="px-3 py-2">
          <EnrollmentInfo node={node} />
        </td>
        <td className="px-3 py-2 font-mono text-[11px] text-neutral-500">{node.firmware_version ?? "\u2014"}</td>
        <td className="px-4 py-2">
          <div className="flex items-center gap-2">
            {error && <span className="font-mono text-[10px] text-red-400">{error}</span>}
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {updateMutation.isPending ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr className={`border-b border-neutral-800 hover:bg-neutral-800/40 transition-colors group${isDecommissioned ? " opacity-50" : ""}`}>
        <td className="px-4 py-3 font-mono text-[12px] font-semibold text-foreground">{node.name}</td>
        <td className="px-3 py-3 font-mono text-[11px] text-neutral-400">{node.serial ?? "\u2014"}</td>
        <td className="px-3 py-3 font-mono text-[11px] text-neutral-400">{baseName}</td>
        <td className="px-3 py-3">
          <StatusBadge enrolled_at={node.enrolled_at} decommissioned_at={node.decommissioned_at} />
        </td>
        <td className="px-3 py-3">
          <EnrollmentInfo node={node} />
        </td>
        <td className="px-3 py-3 font-mono text-[11px] text-neutral-400">{node.firmware_version ?? "\u2014"}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
            {!isDecommissioned && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 transition-colors"
                >
                  Edit
                </button>
                {isPending && (
                  <>
                    <button
                      onClick={() => issueCertMutation.mutate({ id: node.id })}
                      disabled={issueCertMutation.isPending}
                      className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border border-emerald-700/50 text-emerald-400 hover:text-emerald-300 hover:border-emerald-600 disabled:opacity-50 transition-colors"
                    >
                      {issueCertMutation.isPending ? "Issuing..." : "Issue Cert"}
                    </button>
                    <button
                      onClick={() => regenerateMutation.mutate({ id: node.id })}
                      disabled={regenerateMutation.isPending}
                      className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border border-amber-700/50 text-amber-400 hover:text-amber-300 hover:border-amber-600 disabled:opacity-50 transition-colors"
                    >
                      {regenerateMutation.isPending ? "..." : "New Token"}
                    </button>
                  </>
                )}
                {isEnrolled && (
                  <button
                    onClick={() => setShowRevoke(true)}
                    className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border border-red-700/50 text-red-400 hover:text-red-300 hover:border-red-600 transition-colors"
                  >
                    Revoke
                  </button>
                )}
                <button
                  onClick={() => decommissionMutation.mutate({ id: node.id })}
                  disabled={decommissionMutation.isPending}
                  className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border border-red-700/50 text-red-400 hover:text-red-300 hover:border-red-600 disabled:opacity-50 transition-colors"
                >
                  {decommissionMutation.isPending ? "..." : "Decommission"}
                </button>
              </>
            )}
            {isDecommissioned && (
              <button
                onClick={() => recommissionMutation.mutate({ id: node.id })}
                disabled={recommissionMutation.isPending}
                className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border border-emerald-700/50 text-emerald-400 hover:text-emerald-300 hover:border-emerald-600 disabled:opacity-50 transition-colors"
              >
                {recommissionMutation.isPending ? "..." : "Recommission"}
              </button>
            )}
          </div>
          {error && <div className="font-mono text-[10px] text-red-400 mt-1">{error}</div>}
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
  const { data: nodes, isLoading } = trpc.nodes.list.useQuery({ includeDecommissioned: showDecommissioned });
  const { data: bases = [] } = trpc.bases.list.useQuery();
  const [showCreate, setShowCreate] = useState(false);
  const [pendingCredential, setPendingCredential] = useState<PendingCredential>(null);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
      {/* Page header */}
      <div className="px-5 pt-4 pb-3 shrink-0 flex items-center justify-between border-b border-neutral-800">
        <div>
          <div className="text-[15px] font-semibold text-foreground tracking-tight">Fleet</div>
          <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
            {isLoading
              ? "Loading..."
              : `${nodes?.length ?? 0} node${(nodes?.length ?? 0) === 1 ? "" : "s"} registered`}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={showDecommissioned} onChange={(e) => setShowDecommissioned(e.target.checked)} className="accent-neutral-400" />
            <span className="font-mono text-[10px] text-neutral-500">Show decommissioned</span>
          </label>
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
          >
            {showCreate ? "Cancel" : "+ Register Node"}
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 p-5">
        {showCreate && (
          <CreateNodeForm
            onClose={() => setShowCreate(false)}
            onTokenReceived={(token) => setPendingCredential({ type: "token", token })}
          />
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-24 font-mono text-[12px] text-neutral-500">
            Loading nodes...
          </div>
        ) : !nodes || nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-2">
            <div className="font-mono text-[12px] text-neutral-500">No nodes registered yet</div>
            <div className="font-mono text-[10px] text-neutral-600">Register a node to get started</div>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950">
                  <th className="px-4 py-2.5 text-left">
                    <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Name</span>
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Serial</span>
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Base</span>
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Status</span>
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Enrollment</span>
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Firmware</span>
                  </th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {nodes.map((node) => (
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
          </div>
        )}
      </div>

      {/* Credential modals */}
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
