"use client";

import { useState } from "react";
import { friendlyError } from "@/lib/error-messages";
import { trpc } from "@/lib/trpc/client";
import type { Sysadmin } from "@/lib/types";

// ─── Invite Form ──────────────────────────────────────────────

function InviteForm({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();

  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteMutation = trpc.sysadminAdmins.invite.useMutation({
    onSuccess: (data) => {
      utils.sysadminAdmins.list.invalidate();
      setInviteUrl(data.invite_url);
    },
    onError: (err) => {
      setError(friendlyError(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    inviteMutation.mutate({ email });
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inviteUrl) {
    return (
      <div className="mb-6 rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="mb-4 text-sm font-medium text-white">Sysadmin invited</h2>
        <p className="mb-3 text-sm text-neutral-400">
          Share this invite link with the new admin. It expires in 72 hours and can only be used once.
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 overflow-x-auto rounded border border-neutral-700 bg-neutral-900 p-3 font-mono text-xs text-neutral-200">
            {inviteUrl}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md bg-white px-3 py-1.5 text-sm text-black hover:bg-neutral-200"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-sm text-neutral-400 hover:text-neutral-200"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-neutral-800 bg-neutral-900 p-5">
      <h2 className="mb-4 text-sm font-medium text-white">Invite Sysadmin</h2>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          placeholder="new-admin@example.com"
        />
        <button
          type="submit"
          disabled={inviteMutation.isPending}
          className="rounded-md bg-white px-4 py-2 text-sm text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {inviteMutation.isPending ? "Inviting..." : "Invite"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-neutral-400 hover:text-neutral-200"
        >
          Cancel
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}

// ─── Reset Password Action ───────────────────────────────────

function ResetPasswordAction({ admin }: { admin: Sysadmin }) {
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetMutation = trpc.sysadminAdmins.adminResetPassword.useMutation({
    onSuccess: (data) => {
      setResetUrl(data.reset_url);
    },
    onError: (err) => {
      setError(friendlyError(err));
    },
  });

  const handleReset = () => {
    setError(null);
    resetMutation.mutate({ id: admin.id });
  };

  const handleCopy = async () => {
    if (!resetUrl) return;
    await navigator.clipboard.writeText(resetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (resetUrl) {
    return (
      <div className="flex items-center gap-2">
        <div className="max-w-xs truncate rounded border border-neutral-700 bg-neutral-900 px-2 py-1 font-mono text-xs text-neutral-300">
          {resetUrl}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded bg-white px-2 py-0.5 text-xs text-black hover:bg-neutral-200"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          onClick={() => setResetUrl(null)}
          className="text-xs text-neutral-500 hover:text-neutral-300"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleReset}
        disabled={resetMutation.isPending}
        className="rounded border border-neutral-700 px-2 py-0.5 text-xs text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 disabled:opacity-50"
      >
        {resetMutation.isPending ? "Generating..." : "Reset password"}
      </button>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function SysadminsPage() {
  const [showInvite, setShowInvite] = useState(false);
  const adminsQuery = trpc.sysadminAdmins.list.useQuery();

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Sysadmins</h1>
        {!showInvite && (
          <button
            type="button"
            onClick={() => setShowInvite(true)}
            className="rounded-md bg-white px-3 py-1.5 text-sm text-black hover:bg-neutral-200"
          >
            Invite Sysadmin
          </button>
        )}
      </div>

      {/* Invite Form */}
      {showInvite && <InviteForm onClose={() => setShowInvite(false)} />}

      {/* Table */}
      {adminsQuery.isLoading && (
        <p className="text-sm text-neutral-400">Loading...</p>
      )}

      {adminsQuery.data && adminsQuery.data.length === 0 && (
        <p className="text-sm text-neutral-500">No sysadmins</p>
      )}

      {adminsQuery.data && adminsQuery.data.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-neutral-800">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-900">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                  MFA
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {adminsQuery.data.map((admin) => (
                <tr key={admin.id} className="border-t border-neutral-800">
                  <td className="px-4 py-3 text-sm text-neutral-200">
                    {admin.email}
                  </td>
                  <td className="px-4 py-3">
                    {admin.mfa_enabled ? (
                      <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-200">
                        Enabled
                      </span>
                    ) : (
                      <span className="rounded border border-red-400/20 bg-red-900/30 px-2 py-0.5 text-xs text-red-400">
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ResetPasswordAction admin={admin} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
