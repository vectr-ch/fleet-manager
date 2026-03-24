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

// ── Create Base Form ──────────────────────────────────────────────────────────

function CreateBaseForm({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = trpc.bases.create.useMutation({
    onSuccess: () => {
      utils.bases.list.invalidate();
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
    <form onSubmit={handleSubmit} className="bg-neutral-800 border border-neutral-700 rounded-[5px] p-4 mb-4">
      <div className="font-mono text-[10px] tracking-wider text-neutral-400 uppercase mb-3">Create Base</div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className="font-mono text-[10px] text-neutral-500 block mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Base Alpha"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="font-mono text-[10px] text-neutral-500 block mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="47.3769"
            className={inputClass}
          />
        </div>
        <div>
          <label className="font-mono text-[10px] text-neutral-500 block mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="8.5417"
            className={inputClass}
          />
        </div>
      </div>
      {error && <div className="font-mono text-[10px] text-red-400 mb-3">{error}</div>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
        >
          {createMutation.isPending ? "Creating…" : "Create Base"}
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

// ── Edit Base Row ─────────────────────────────────────────────────────────────

interface BaseRowProps {
  base: {
    id: string;
    name: string;
    status: string;
    lat?: number;
    lng?: number;
    maintenance_mode: boolean;
    created_at: string;
  };
}

function BaseRow({ base }: BaseRowProps) {
  const utils = trpc.useUtils();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(base.name);
  const [editMaintenance, setEditMaintenance] = useState(base.maintenance_mode);
  const [error, setError] = useState<string | null>(null);

  const updateMutation = trpc.bases.update.useMutation({
    onSuccess: () => {
      utils.bases.list.invalidate();
      setEditing(false);
      setError(null);
    },
    onError: (e) => setError(e.message),
  });

  const handleSave = () => {
    setError(null);
    updateMutation.mutate({
      id: base.id,
      name: editName.trim() || undefined,
      maintenance_mode: editMaintenance,
    });
  };

  const handleCancel = () => {
    setEditName(base.name);
    setEditMaintenance(base.maintenance_mode);
    setEditing(false);
    setError(null);
  };

  const isOnline = base.status === "online";

  if (editing) {
    return (
      <tr className="border-b border-neutral-800 bg-neutral-800/50">
        <td className="px-4 py-3 w-3">
          <div className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? "bg-emerald-400" : "bg-neutral-600"}`} />
        </td>
        <td className="px-3 py-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="bg-neutral-900 border border-neutral-600 rounded px-2 py-1 font-mono text-[11px] text-foreground focus:outline-none focus:border-neutral-400 w-40"
          />
        </td>
        <td className="px-3 py-2">
          <span
            className={`font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border ${
              isOnline
                ? "bg-emerald-900/30 text-emerald-400 border-emerald-400/20"
                : "bg-neutral-800 text-neutral-500 border-neutral-700"
            }`}
          >
            {base.status}
          </span>
        </td>
        <td className="px-3 py-2 font-mono text-[11px] text-neutral-400">
          {base.lat != null && base.lng != null ? `${base.lat.toFixed(4)}, ${base.lng.toFixed(4)}` : "—"}
        </td>
        <td className="px-3 py-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={editMaintenance}
              onChange={(e) => setEditMaintenance(e.target.checked)}
              className="accent-amber-400"
            />
            <span className="font-mono text-[10px] text-neutral-400">Maintenance</span>
          </label>
        </td>
        <td className="px-3 py-2 font-mono text-[11px] text-neutral-500">{formatDate(base.created_at)}</td>
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
      <td className="px-4 py-3 w-3">
        <div className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-neutral-600"}`} />
      </td>
      <td className="px-3 py-3 font-mono text-[12px] font-semibold text-foreground">{base.name}</td>
      <td className="px-3 py-3">
        <span
          className={`font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border ${
            isOnline
              ? "bg-emerald-900/30 text-emerald-400 border-emerald-400/20"
              : "bg-neutral-800 text-neutral-500 border-neutral-700"
          }`}
        >
          {base.status}
        </span>
      </td>
      <td className="px-3 py-3 font-mono text-[11px] text-neutral-400">
        {base.lat != null && base.lng != null ? `${base.lat.toFixed(4)}, ${base.lng.toFixed(4)}` : "—"}
      </td>
      <td className="px-3 py-3">
        {base.maintenance_mode ? (
          <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border bg-amber-900/30 text-amber-400 border-amber-400/20">
            Maintenance
          </span>
        ) : (
          <span className="font-mono text-[10px] text-neutral-500">—</span>
        )}
      </td>
      <td className="px-3 py-3 font-mono text-[11px] text-neutral-500">{formatDate(base.created_at)}</td>
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

export default function BasesPage() {
  const { data: bases, isLoading } = trpc.bases.list.useQuery();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
      {/* Page header */}
      <div className="px-5 pt-4 pb-3 shrink-0 flex items-center justify-between border-b border-neutral-800">
        <div>
          <div className="text-[15px] font-semibold text-foreground tracking-tight">Bases</div>
          <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
            {isLoading ? "Loading…" : `${bases?.length ?? 0} base${(bases?.length ?? 0) === 1 ? "" : "s"} registered`}
          </div>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
        >
          {showCreate ? "Cancel" : "+ Create Base"}
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 p-5">
        {showCreate && <CreateBaseForm onClose={() => setShowCreate(false)} />}

        {isLoading ? (
          <div className="flex items-center justify-center py-24 font-mono text-[12px] text-neutral-500">
            Loading bases…
          </div>
        ) : !bases || bases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-2">
            <div className="font-mono text-[12px] text-neutral-500">No bases yet</div>
            <div className="font-mono text-[10px] text-neutral-600">Create a base to get started</div>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950">
                  <th className="px-4 py-2.5 w-3" />
                  <th className="px-3 py-2.5 text-left">
                    <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Name</span>
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Status</span>
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Lat / Lng</span>
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Maintenance</span>
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Created</span>
                  </th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {bases.map((base) => (
                  <BaseRow key={base.id} base={base} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
