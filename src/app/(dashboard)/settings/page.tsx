"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ── Shared styles ─────────────────────────────────────────────────────────────

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

// ── Organisation Tab ──────────────────────────────────────────────────────────

function OrgTab() {
  const utils = trpc.useUtils();
  const { data: org, isLoading } = trpc.org.get.useQuery();
  const [editName, setEditName] = useState("");
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMutation = trpc.org.update.useMutation({
    onSuccess: () => {
      utils.org.get.invalidate();
      setEditing(false);
      setSuccess(true);
      setError(null);
      setTimeout(() => setSuccess(false), 2000);
    },
    onError: (e) => setError(e.message),
  });

  const startEdit = () => {
    setEditName(org?.name ?? "");
    setEditing(true);
    setError(null);
  };

  const handleSave = () => {
    setError(null);
    updateMutation.mutate({ name: editName.trim() });
  };

  return (
    <div className="max-w-xl space-y-5">
      <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-5">
        <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-4">Organisation Details</div>

        {isLoading ? (
          <div className="font-mono text-[11px] text-neutral-500">Loading…</div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="font-mono text-[10px] text-neutral-500 mb-1">Slug</div>
              <div className="font-mono text-[12px] text-neutral-300">{org?.slug ?? "—"}</div>
            </div>

            <div>
              <div className="font-mono text-[10px] text-neutral-500 mb-1">Name</div>
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={inputClass + " max-w-xs"}
                    autoFocus
                  />
                  <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {updateMutation.isPending ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setError(null); }}
                    className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="font-mono text-[12px] text-neutral-300">{org?.name ?? "—"}</div>
                  <button
                    onClick={startEdit}
                    className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 transition-colors"
                  >
                    Edit
                  </button>
                  {success && (
                    <span className="font-mono text-[10px] text-emerald-400">Saved</span>
                  )}
                </div>
              )}
              {error && <div className="font-mono text-[10px] text-red-400 mt-1">{error}</div>}
            </div>

            {org?.plan && (
              <div>
                <div className="font-mono text-[10px] text-neutral-500 mb-1">Plan</div>
                <div className="font-mono text-[12px] text-neutral-300 capitalize">{org.plan}</div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-neutral-800">
              {org?.max_nodes != null && (
                <div>
                  <div className="font-mono text-[10px] text-neutral-500 mb-0.5">Max Nodes</div>
                  <div className="font-mono text-[13px] font-semibold text-foreground">{org.max_nodes}</div>
                </div>
              )}
              {org?.max_bases != null && (
                <div>
                  <div className="font-mono text-[10px] text-neutral-500 mb-0.5">Max Bases</div>
                  <div className="font-mono text-[13px] font-semibold text-foreground">{org.max_bases}</div>
                </div>
              )}
              {org?.max_users != null && (
                <div>
                  <div className="font-mono text-[10px] text-neutral-500 mb-0.5">Max Users</div>
                  <div className="font-mono text-[13px] font-semibold text-foreground">{org.max_users}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────

function UsersTab() {
  const { data: users, isLoading } = trpc.users.list.useQuery();

  return (
    <div className="max-w-2xl">
      <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-800">
          <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">
            {isLoading ? "Loading…" : `${users?.length ?? 0} member${(users?.length ?? 0) === 1 ? "" : "s"}`}
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center font-mono text-[11px] text-neutral-500">Loading users…</div>
        ) : !users || users.length === 0 ? (
          <div className="py-12 text-center font-mono text-[11px] text-neutral-500">No users found</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950">
                <th className="px-4 py-2.5 text-left">
                  <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Email</span>
                </th>
                <th className="px-3 py-2.5 text-left">
                  <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">MFA</span>
                </th>
                <th className="px-4 py-2.5 text-left">
                  <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Joined</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-neutral-800 last:border-0">
                  <td className="px-4 py-3 font-mono text-[12px] text-foreground">{user.email}</td>
                  <td className="px-3 py-3">
                    {user.mfa_enabled ? (
                      <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border bg-emerald-900/30 text-emerald-400 border-emerald-400/20">
                        Enabled
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border bg-neutral-800 text-neutral-500 border-neutral-700">
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-neutral-500">{formatDate(user.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Invites Tab ───────────────────────────────────────────────────────────────

function InvitesTab() {
  const utils = trpc.useUtils();
  const { data: invites, isLoading } = trpc.invites.list.useQuery();
  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const createMutation = trpc.invites.create.useMutation({
    onSuccess: () => {
      utils.invites.list.invalidate();
      setShowCreate(false);
      setEmail("");
      setRoleId("");
      setCreateError(null);
    },
    onError: (e) => setCreateError(e.message),
  });

  const deleteMutation = trpc.invites.delete.useMutation({
    onSuccess: () => utils.invites.list.invalidate(),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    createMutation.mutate({ email: email.trim(), role_id: roleId.trim() });
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Create form */}
      <div className="flex justify-between items-center">
        <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">
          Pending Invites
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
        >
          {showCreate ? "Cancel" : "+ Invite"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-neutral-800 border border-neutral-700 rounded-[5px] p-4">
          <div className="font-mono text-[10px] tracking-wider text-neutral-400 uppercase mb-3">Create Invite</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="font-mono text-[10px] text-neutral-500 block mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] text-neutral-500 block mb-1">Role ID *</label>
              <input
                type="text"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                placeholder="member"
                required
                className={inputClass}
              />
            </div>
          </div>
          {createError && <div className="font-mono text-[10px] text-red-400 mb-3">{createError}</div>}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            {createMutation.isPending ? "Sending…" : "Send Invite"}
          </button>
        </form>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center font-mono text-[11px] text-neutral-500">Loading invites…</div>
        ) : !invites || invites.length === 0 ? (
          <div className="py-12 text-center font-mono text-[11px] text-neutral-500">No pending invites</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950">
                <th className="px-4 py-2.5 text-left">
                  <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Email</span>
                </th>
                <th className="px-3 py-2.5 text-left">
                  <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Role</span>
                </th>
                <th className="px-3 py-2.5 text-left">
                  <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Expires</span>
                </th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => (
                <tr key={invite.id} className="border-b border-neutral-800 last:border-0 group">
                  <td className="px-4 py-3 font-mono text-[12px] text-foreground">{invite.email}</td>
                  <td className="px-3 py-3 font-mono text-[11px] text-neutral-400">{invite.role_id}</td>
                  <td className="px-3 py-3 font-mono text-[11px] text-neutral-500">{formatDate(invite.expires_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteMutation.mutate({ id: invite.id })}
                      disabled={deleteMutation.isPending}
                      className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border border-neutral-700 text-red-400 hover:text-red-300 hover:border-red-700 opacity-0 group-hover:opacity-100 disabled:opacity-50 transition-all"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Security Tab ──────────────────────────────────────────────────────────────

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // userId is not yet available from JWT context — disabled until backend provides current user endpoint
  const changePasswordMutation = trpc.userAccount.changePassword.useMutation({
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (e) => setError(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    // TODO: replace placeholder with real userId once /me endpoint is available
    changePasswordMutation.mutate({
      userId: "me",
      current_password: currentPassword,
      new_password: newPassword,
    });
  };

  return (
    <div className="max-w-md space-y-5">
      <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-5">
        <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-4">Change Password</div>

        <div className="mb-3 px-3 py-2.5 bg-amber-900/20 border border-amber-700/30 rounded-[5px]">
          <div className="font-mono text-[10px] text-amber-400">
            Note: Password change requires a current user endpoint which is not yet available. This form will be fully functional once the backend provides /users/me.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="font-mono text-[10px] text-neutral-500 block mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="font-mono text-[10px] text-neutral-500 block mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="font-mono text-[10px] text-neutral-500 block mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={inputClass}
            />
          </div>

          {error && <div className="font-mono text-[10px] text-red-400">{error}</div>}
          {success && <div className="font-mono text-[10px] text-emerald-400">Password changed successfully.</div>}

          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="font-mono text-[10px] tracking-wider uppercase px-4 py-2 rounded-[5px] bg-foreground text-background hover:opacity-90 disabled:opacity-50 transition-opacity mt-1"
          >
            {changePasswordMutation.isPending ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-auto">
      {/* Header */}
      <div className="flex items-center px-5 py-3 border-b border-neutral-800 bg-neutral-950 shrink-0">
        <div>
          <div className="text-[15px] font-semibold text-foreground tracking-tight">Settings</div>
          <div className="text-[11px] text-neutral-500 font-mono mt-0.5">Manage your organisation and account</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5">
        <Tabs defaultValue="org">
          <TabsList variant="line" className="mb-6">
            <TabsTrigger value="org">Organisation</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="invites">Invites</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="org">
            <OrgTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="invites">
            <InvitesTab />
          </TabsContent>

          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
