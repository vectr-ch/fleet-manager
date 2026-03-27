"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  isWebAuthnSupported,
  toCreationOptions,
  serializeRegistration,
} from "@/lib/webauthn";
import type { PasskeyInfo } from "@/lib/types";

const inputClass =
  "bg-neutral-900 border border-neutral-700 rounded-[5px] px-2.5 py-1.5 font-mono text-[11px] text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 w-full";

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

function formatRelativeTime(iso: string): string {
  try {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(iso);
  } catch {
    return iso;
  }
}

function PasskeyRow({ passkey, onDeleted }: { passkey: PasskeyInfo; onDeleted: () => void }) {
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(passkey.label);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renameMutation = trpc.userAccount.renamePasskey.useMutation({
    onSuccess: () => {
      setEditing(false);
      setError(null);
      onDeleted(); // re-fetch list
    },
    onError: (e) => setError(e.message),
  });

  const deleteMutation = trpc.userAccount.deletePasskey.useMutation({
    onSuccess: () => {
      setConfirmDelete(false);
      onDeleted();
    },
    onError: (e) => setError(e.message),
  });

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editLabel.trim();
    if (!trimmed || trimmed === passkey.label) {
      setEditing(false);
      return;
    }
    setError(null);
    renameMutation.mutate({ passkey_id: passkey.id, label: trimmed });
  };

  return (
    <div className="border-b border-neutral-800 last:border-0 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {editing ? (
            <form onSubmit={handleRename} className="flex items-center gap-2">
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                maxLength={100}
                autoFocus
                className={inputClass + " max-w-xs"}
              />
              <button
                type="submit"
                disabled={renameMutation.isPending}
                className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-[5px] bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setEditLabel(passkey.label); setError(null); }}
                className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-[5px] border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div>
              <div className="font-mono text-[12px] text-foreground">{passkey.label}</div>
              <div className="font-mono text-[10px] text-neutral-500 mt-0.5">
                {passkey.device_type}
                {passkey.backed_up && " (backed up)"}
                {" \u00b7 "}
                Added {formatDate(passkey.created_at)}
                {passkey.last_used_at && (
                  <> {" \u00b7 "} Last used {formatRelativeTime(passkey.last_used_at)}</>
                )}
              </div>
            </div>
          )}
        </div>

        {!editing && !confirmDelete && (
          <div className="flex items-center gap-1.5 ml-3 shrink-0">
            <button
              onClick={() => { setEditing(true); setEditLabel(passkey.label); setError(null); }}
              className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 transition-colors"
            >
              Rename
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border border-neutral-700 text-red-400 hover:text-red-300 hover:border-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="mt-2 flex items-center gap-2">
          <span className="font-mono text-[10px] text-neutral-500">Delete this passkey?</span>
          <button
            onClick={() => deleteMutation.mutate({ passkey_id: passkey.id })}
            disabled={deleteMutation.isPending}
            className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-[5px] bg-red-700 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {deleteMutation.isPending ? "Deleting..." : "Confirm"}
          </button>
          <button
            onClick={() => { setConfirmDelete(false); setError(null); }}
            className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-[5px] border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {error && <div className="font-mono text-[10px] text-red-400 mt-1">{error}</div>}
    </div>
  );
}

export function PasskeysSection() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.userAccount.listPasskeys.useQuery();
  const passkeys = data?.passkeys ?? [];

  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  const registerOptionsMutation = trpc.userAccount.passkeyRegisterOptions.useMutation();
  const registerVerifyMutation = trpc.userAccount.passkeyRegisterVerify.useMutation();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) return;

    setAddError(null);
    setAddLoading(true);

    try {
      const options = await registerOptionsMutation.mutateAsync();
      const pkWrapper = options.publicKey as Record<string, unknown>;
      const publicKeyOptions = toCreationOptions(pkWrapper.publicKey as Record<string, unknown>);
      const credential = await navigator.credentials.create({ publicKey: publicKeyOptions });
      if (!credential) {
        setAddLoading(false);
        return;
      }
      const serialized = serializeRegistration(credential as PublicKeyCredential);
      await registerVerifyMutation.mutateAsync({ session_id: options.session_id, label, credential: serialized });
      utils.userAccount.listPasskeys.invalidate();
      utils.userAccount.mfaStatus.invalidate();
      setShowAdd(false);
      setNewLabel("");
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setAddLoading(false);
        return; // User cancelled
      }
      const message = err instanceof Error ? err.message : "Failed to register passkey";
      setAddError(message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleInvalidate = () => {
    utils.userAccount.listPasskeys.invalidate();
    utils.userAccount.mfaStatus.invalidate();
  };

  const supported = isWebAuthnSupported();

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-[5px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Passkeys</div>
        {supported && (
          <button
            onClick={() => { setShowAdd(true); setAddError(null); }}
            disabled={showAdd}
            className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
          >
            + Add Passkey
          </button>
        )}
      </div>

      {!supported && (
        <div className="px-4 py-6 text-center font-mono text-[11px] text-neutral-500">
          Passkeys are not supported in this browser.
        </div>
      )}

      {supported && showAdd && (
        <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-800/50">
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="font-mono text-[10px] text-neutral-500 block mb-1">Passkey Label</label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder='e.g. "MacBook Touch ID"'
                maxLength={100}
                required
                autoFocus
                className={inputClass + " max-w-xs"}
              />
            </div>
            {addError && <div className="font-mono text-[10px] text-red-400">{addError}</div>}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={addLoading || !newLabel.trim()}
                className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
              >
                {addLoading ? "Waiting for passkey..." : "Register"}
              </button>
              <button
                type="button"
                onClick={() => { setShowAdd(false); setNewLabel(""); setAddError(null); }}
                disabled={addLoading}
                className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {supported && isLoading && (
        <div className="px-4 py-6 text-center font-mono text-[11px] text-neutral-500">Loading passkeys...</div>
      )}

      {supported && !isLoading && passkeys.length === 0 && !showAdd && (
        <div className="px-4 py-6 text-center font-mono text-[11px] text-neutral-500">
          No passkeys registered. Add one for passwordless sign-in.
        </div>
      )}

      {supported && passkeys.length > 0 && (
        <div>
          {passkeys.map((pk) => (
            <PasskeyRow key={pk.id} passkey={pk} onDeleted={handleInvalidate} />
          ))}
        </div>
      )}
    </div>
  );
}
