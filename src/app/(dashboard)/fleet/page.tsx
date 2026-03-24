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

// ── Create Node Form ──────────────────────────────────────────────────────────

function CreateNodeForm({ onClose }: { onClose: () => void }) {
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
            <option value="">— None —</option>
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
          {createMutation.isPending ? "Creating…" : "Register Node"}
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
    created_at: string;
  };
  bases: { id: string; name: string }[];
}

function NodeRow({ node, bases }: NodeRowProps) {
  const utils = trpc.useUtils();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [editSerial, setEditSerial] = useState(node.serial ?? "");
  const [editBaseId, setEditBaseId] = useState(node.base_id ?? "");
  const [error, setError] = useState<string | null>(null);

  const updateMutation = trpc.nodes.update.useMutation({
    onSuccess: () => {
      utils.nodes.list.invalidate();
      setEditing(false);
      setError(null);
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

  const baseName = bases.find((b) => b.id === node.base_id)?.name ?? node.base_id ?? "—";

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
            <option value="">— None —</option>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </td>
        <td className="px-3 py-2 font-mono text-[11px] text-neutral-500">{node.firmware_version ?? "—"}</td>
        <td className="px-3 py-2 font-mono text-[11px] text-neutral-500">{formatDate(node.created_at)}</td>
        <td className="px-4 py-2">
          <div className="flex items-center gap-2">
            {error && <span className="font-mono text-[10px] text-red-400">{error}</span>}
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {updateMutation.isPending ? "Saving…" : "Save"}
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
    <tr className="border-b border-neutral-800 hover:bg-neutral-800/40 transition-colors group">
      <td className="px-4 py-3 font-mono text-[12px] font-semibold text-foreground">{node.name}</td>
      <td className="px-3 py-3 font-mono text-[11px] text-neutral-400">{node.serial ?? "—"}</td>
      <td className="px-3 py-3 font-mono text-[11px] text-neutral-400">{baseName}</td>
      <td className="px-3 py-3 font-mono text-[11px] text-neutral-400">{node.firmware_version ?? "—"}</td>
      <td className="px-3 py-3 font-mono text-[11px] text-neutral-500">{formatDate(node.created_at)}</td>
      <td className="px-4 py-3">
        <button
          onClick={() => setEditing(true)}
          className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 opacity-0 group-hover:opacity-100 transition-all"
        >
          Edit
        </button>
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FleetPage() {
  const { data: nodes, isLoading } = trpc.nodes.list.useQuery();
  const { data: bases = [] } = trpc.bases.list.useQuery();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
      {/* Page header */}
      <div className="px-5 pt-4 pb-3 shrink-0 flex items-center justify-between border-b border-neutral-800">
        <div>
          <div className="text-[15px] font-semibold text-foreground tracking-tight">Fleet</div>
          <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
            {isLoading
              ? "Loading…"
              : `${nodes?.length ?? 0} node${(nodes?.length ?? 0) === 1 ? "" : "s"} registered`}
          </div>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
        >
          {showCreate ? "Cancel" : "+ Register Node"}
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 p-5">
        {showCreate && <CreateNodeForm onClose={() => setShowCreate(false)} />}

        {isLoading ? (
          <div className="flex items-center justify-center py-24 font-mono text-[12px] text-neutral-500">
            Loading nodes…
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
                    <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Firmware</span>
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Created</span>
                  </th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {nodes.map((node) => (
                  <NodeRow key={node.id} node={node} bases={bases} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
