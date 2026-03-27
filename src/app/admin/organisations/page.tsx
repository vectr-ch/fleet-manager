"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import type { SysadminOrg, OrgMember } from "@/lib/types";

function buildAdminInviteLink(token: string) {
  if (typeof window === "undefined") {
    return `/admin/accept-invite?token=${encodeURIComponent(token)}`;
  }
  return `${window.location.origin}/admin/accept-invite?token=${encodeURIComponent(token)}`;
}

// ─── Create Form ─────────────────────────────────────────────

function CreateOrgForm({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [plan, setPlan] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMutation = trpc.sysadminOrgs.create.useMutation({
    onSuccess: (data) => {
      utils.sysadminOrgs.list.invalidate();
      if (data.invite_token) {
        setInviteLink(buildAdminInviteLink(data.invite_token));
      } else {
        onClose();
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate({
      name,
      slug,
      plan: plan || undefined,
      admin: adminEmail ? { email: adminEmail } : undefined,
    });
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inviteLink) {
    return (
      <div className="mb-6 rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="mb-4 text-sm font-medium text-white">Organisation created</h2>
        <p className="mb-3 text-sm text-neutral-400">
          Share this invite link with the admin. It can only be used once.
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded border border-neutral-700 bg-neutral-900 p-3 font-mono text-xs text-neutral-200">
            {inviteLink}
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
      <h2 className="mb-4 text-sm font-medium text-white">Create Organisation</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm text-neutral-400">
            Name <span className="text-neutral-600">*</span>
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            placeholder="Acme Corp"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm text-neutral-400">
            Slug <span className="text-neutral-600">*</span>
          </label>
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            placeholder="acme-corp"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm text-neutral-400">Plan</label>
          <input
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            placeholder="pro"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm text-neutral-400">Admin Email</label>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            placeholder="admin@example.com"
          />
        </div>
        {error && (
          <p className="col-span-2 text-sm text-red-400">{error}</p>
        )}
        <div className="col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-md bg-white px-3 py-1.5 text-sm text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating…" : "Create"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-neutral-400 hover:text-neutral-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Org Members ─────────────────────────────────────────────

function OrgMembers({ slug }: { slug: string }) {
  const utils = trpc.useUtils();
  const { data: members, isLoading, error } = trpc.sysadminOrgs.listMembers.useQuery({ slug });

  const revokeMutation = trpc.sysadminOrgs.revokeInvite.useMutation({
    onSuccess: () => {
      utils.sysadminOrgs.listMembers.invalidate({ slug });
    },
  });

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-neutral-400">
        Members
      </h3>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error.message}</p>
      ) : !members || members.length === 0 ? (
        <p className="text-sm text-neutral-500">No members</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Role</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">MFA</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {members.map((member: OrgMember) => (
              <tr key={member.id} className="border-t border-neutral-800/50 text-sm text-neutral-300">
                <td className="px-4 py-2">{member.email}</td>
                <td className="px-4 py-2">
                  {member.role === "org_admin" ? (
                    <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-amber-400">admin</span>
                  ) : (
                    <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">{member.role}</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {member.status === "active" ? (
                    <span className="rounded border border-emerald-400/20 bg-emerald-900/30 px-2 py-0.5 text-xs text-emerald-400">Active</span>
                  ) : (
                    <span className="rounded border border-yellow-400/20 bg-yellow-900/30 px-2 py-0.5 text-xs text-yellow-400">Pending</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {member.mfa_enabled ? (
                    <span className="text-xs text-emerald-400">Enabled</span>
                  ) : (
                    <span className="text-xs text-neutral-500">—</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {member.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => revokeMutation.mutate({ slug, inviteId: member.id })}
                      disabled={revokeMutation.isPending && revokeMutation.variables?.inviteId === member.id}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                      {revokeMutation.isPending && revokeMutation.variables?.inviteId === member.id ? "Revoking…" : "Revoke"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Edit Panel ──────────────────────────────────────────────

function EditPanel({ org, onClose }: { org: SysadminOrg; onClose: () => void }) {
  const utils = trpc.useUtils();

  // Edit fields
  const [name, setName] = useState(org.name);
  const [plan, setPlan] = useState(org.plan ?? "");
  const [maxNodes, setMaxNodes] = useState(String(org.max_nodes ?? ""));
  const [maxBases, setMaxBases] = useState(String(org.max_bases ?? ""));
  const [maxUsers, setMaxUsers] = useState(String(org.max_users ?? ""));
  const [maxMissions, setMaxMissions] = useState(String(org.max_concurrent_missions ?? ""));
  const [editError, setEditError] = useState<string | null>(null);

  // Invite admin
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Deactivate
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  const updateMutation = trpc.sysadminOrgs.update.useMutation({
    onSuccess: () => {
      utils.sysadminOrgs.list.invalidate();
      setEditError(null);
    },
    onError: (err) => setEditError(err.message),
  });

  const inviteMutation = trpc.sysadminOrgs.inviteAdmin.useMutation({
    onSuccess: (data) => {
      setInviteLink(buildAdminInviteLink(data.invite_token));
      setInviteError(null);
      setInviteEmail("");
    },
    onError: (err) => setInviteError(err.message),
  });

  const deactivateMutation = trpc.sysadminOrgs.deactivate.useMutation({
    onSuccess: () => {
      utils.sysadminOrgs.list.invalidate();
      onClose();
    },
    onError: (err) => setDeactivateError(err.message),
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    updateMutation.mutate({
      slug: org.slug,
      name: name || undefined,
      plan: plan || undefined,
      max_nodes: maxNodes ? Number(maxNodes) : undefined,
      max_bases: maxBases ? Number(maxBases) : undefined,
      max_users: maxUsers ? Number(maxUsers) : undefined,
      max_concurrent_missions: maxMissions ? Number(maxMissions) : undefined,
    });
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    inviteMutation.mutate({ slug: org.slug, email: inviteEmail });
  };

  const handleCopyInvite = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  return (
    <tr>
      <td colSpan={8} className="border-t border-neutral-800 bg-neutral-900/30 px-6 py-5">
        <div className="grid grid-cols-2 gap-8">
          {/* Left: Edit fields */}
          <div>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-neutral-400">
              Edit Organisation
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-sm text-neutral-400">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm text-white focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm text-neutral-400">Plan</label>
                  <input
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm text-white focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm text-neutral-400">Max Nodes</label>
                  <input
                    type="number"
                    min={0}
                    value={maxNodes}
                    onChange={(e) => setMaxNodes(e.target.value)}
                    className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm text-white focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm text-neutral-400">Max Bases</label>
                  <input
                    type="number"
                    min={0}
                    value={maxBases}
                    onChange={(e) => setMaxBases(e.target.value)}
                    className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm text-white focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm text-neutral-400">Max Users</label>
                  <input
                    type="number"
                    min={0}
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(e.target.value)}
                    className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm text-white focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm text-neutral-400">Max Missions</label>
                  <input
                    type="number"
                    min={0}
                    value={maxMissions}
                    onChange={(e) => setMaxMissions(e.target.value)}
                    className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm text-white focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  />
                </div>
              </div>
              {editError && <p className="text-sm text-red-400">{editError}</p>}
              {updateMutation.isSuccess && !editError && (
                <p className="text-sm text-neutral-400">Saved.</p>
              )}
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="rounded-md bg-white px-3 py-1.5 text-sm text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateMutation.isPending ? "Saving…" : "Save"}
              </button>
            </form>
          </div>

          {/* Right: Invite admin + Deactivate */}
          <div className="space-y-6">
            {/* Invite Admin */}
            <div>
              <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-neutral-400">
                Invite Admin
              </h3>
              <form onSubmit={handleInvite} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="flex-1 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="rounded-md bg-white px-3 py-1.5 text-sm text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {inviteMutation.isPending ? "Sending…" : "Invite"}
                </button>
              </form>
              {inviteError && <p className="mt-2 text-sm text-red-400">{inviteError}</p>}
              {inviteLink && (
                <div className="mt-3">
                  <p className="mb-2 text-xs text-neutral-500">Invite link — share with the admin:</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded border border-neutral-700 bg-neutral-900 p-3 font-mono text-xs text-neutral-200">
                      {inviteLink}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyInvite}
                      className="rounded-md bg-white px-3 py-1.5 text-sm text-black hover:bg-neutral-200"
                    >
                      {inviteCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Deactivate */}
            {!org.deleted_at && (
              <div>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Danger Zone
                </h3>
                {!showDeactivateConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeactivateConfirm(true)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Deactivate Organisation
                  </button>
                ) : (
                  <div className="space-y-3 rounded-md border border-neutral-800 p-3">
                    <p className="text-sm text-neutral-300">
                      Are you sure you want to deactivate{" "}
                      <span className="font-medium text-white">{org.name}</span>? This action cannot be
                      undone.
                    </p>
                    {deactivateError && (
                      <p className="text-sm text-red-400">{deactivateError}</p>
                    )}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => deactivateMutation.mutate({ slug: org.slug })}
                        disabled={deactivateMutation.isPending}
                        className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        {deactivateMutation.isPending ? "Deactivating…" : "Yes, deactivate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeactivateConfirm(false)}
                        className="text-sm text-neutral-400 hover:text-neutral-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {org.deleted_at && (
              <div>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Status
                </h3>
                <p className="text-sm text-red-400">
                  Deactivated on {new Date(org.deleted_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Members */}
        <OrgMembers slug={org.slug} />
      </td>
    </tr>
  );
}

// ─── Org Row ─────────────────────────────────────────────────

function OrgRow({ org }: { org: SysadminOrg }) {
  const [expanded, setExpanded] = useState(false);
  const isDeactivated = !!org.deleted_at;

  return (
    <>
      <tr
        className={`cursor-pointer border-t border-neutral-800 text-sm hover:bg-neutral-900/50 ${isDeactivated ? "text-neutral-500 opacity-60" : "text-neutral-200"}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <td className={`px-4 py-3 font-medium ${isDeactivated ? "text-neutral-500" : "text-white"}`}>{org.name}</td>
        <td className="px-4 py-3">
          <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">
            {org.slug}
          </span>
        </td>
        <td className="px-4 py-3">
          {isDeactivated ? (
            <span className="rounded border border-red-400/20 bg-red-900/30 px-2 py-0.5 text-xs text-red-400">Deactivated</span>
          ) : (
            <span className="rounded border border-emerald-400/20 bg-emerald-900/30 px-2 py-0.5 text-xs text-emerald-400">Active</span>
          )}
        </td>
        <td className="px-4 py-3 text-neutral-400">{org.plan || "—"}</td>
        <td className="px-4 py-3 tabular-nums text-neutral-300">{org.max_nodes ?? "—"}</td>
        <td className="px-4 py-3 tabular-nums text-neutral-300">{org.max_bases ?? "—"}</td>
        <td className="px-4 py-3 tabular-nums text-neutral-300">{org.max_users ?? "—"}</td>
        <td className="px-4 py-3 tabular-nums text-neutral-300">{org.max_concurrent_missions ?? "—"}</td>
      </tr>
      {expanded && <EditPanel org={org} onClose={() => setExpanded(false)} />}
    </>
  );
}

// ─── Page ────────────────────────────────────────────────────

export default function OrganisationsPage() {
  const [showCreate, setShowCreate] = useState(false);

  const { data: orgs, isLoading, error } = trpc.sysadminOrgs.list.useQuery();

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Organisations</h1>
        {!showCreate && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-md bg-white px-3 py-1.5 text-sm text-black hover:bg-neutral-200"
          >
            Create Organisation
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreate && (
        <CreateOrgForm onClose={() => setShowCreate(false)} />
      )}

      {/* Table */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-neutral-500">Loading...</div>
      ) : error ? (
        <div className="py-12 text-center text-sm text-red-400">{error.message}</div>
      ) : !orgs || orgs.length === 0 ? (
        <div className="rounded-lg border border-neutral-800 py-12 text-center text-sm text-neutral-500">
          No organisations yet
        </div>
      ) : (
        <div className="rounded-lg border border-neutral-800">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-900">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Nodes (max)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Bases (max)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Users (max)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Missions (max)
                </th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <OrgRow key={org.id} org={org} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
