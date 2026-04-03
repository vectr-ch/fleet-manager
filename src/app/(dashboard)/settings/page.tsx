"use client";

import { useState } from "react";
import { friendlyError } from "@/lib/error-messages";
import { trpc } from "@/lib/trpc/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PasswordSection } from "@/components/settings/password-section";
import { PasskeysSection } from "@/components/settings/passkeys-section";
import { TOTPSection } from "@/components/settings/totp-section";

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

/** Turn snake_case role names into title case (e.g. "org_admin" → "Org Admin"). */
function formatRoleName(name: string) {
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
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
    onError: (e) => setError(friendlyError(e)),
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
                  <div className="font-mono text-[10px] text-neutral-500 mb-0.5">Max Drones</div>
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

// ── Members Tab ───────────────────────────────────────────────────────────────

function MembersTab() {
  const { data: members, isLoading } = trpc.members.list.useQuery();

  return (
    <div className="max-w-2xl">
      <div className="bg-neutral-900 border border-neutral-800 rounded-[5px]">
        <div className="px-4 py-3 border-b border-neutral-800">
          <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">
            {isLoading ? "Loading…" : `${members?.length ?? 0} member${(members?.length ?? 0) === 1 ? "" : "s"}`}
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center font-mono text-[11px] text-neutral-500">Loading members…</div>
        ) : !members || members.length === 0 ? (
          <div className="py-12 text-center font-mono text-[11px] text-neutral-500">No members found</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-135">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950">
                <th className="px-4 py-2.5 text-left">
                  <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Email</span>
                </th>
                <th className="px-3 py-2.5 text-left">
                  <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Role</span>
                </th>
                <th className="px-3 py-2.5 text-left">
                  <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Status</span>
                </th>
                <th className="px-3 py-2.5 text-left">
                  <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">MFA</span>
                </th>
                <th className="px-4 py-2.5 text-left">
                  <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Added</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-neutral-800 last:border-0">
                  <td className="px-4 py-3 font-mono text-[12px] text-foreground">{member.email}</td>
                  <td className="px-3 py-3">
                    <span className="font-mono text-[11px] text-neutral-400">{member.role ? formatRoleName(member.role) : "—"}</span>
                  </td>
                  <td className="px-3 py-3">
                    {member.status === "active" ? (
                      <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border bg-emerald-900/30 text-emerald-400 border-emerald-400/20">
                        Active
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border bg-amber-900/30 text-amber-400 border-amber-400/20">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {member.status === "active" && member.mfa_enabled ? (
                      <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border bg-emerald-900/30 text-emerald-400 border-emerald-400/20">
                        Enabled
                      </span>
                    ) : member.status === "active" ? (
                      <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border bg-neutral-800 text-neutral-500 border-neutral-700">
                        Disabled
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-neutral-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-neutral-500">{formatDate(member.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Invites Tab ───────────────────────────────────────────────────────────────

function InvitesTab() {
  const utils = trpc.useUtils();
  const { data: invites, isLoading } = trpc.invites.list.useQuery();
  const { data: roles } = trpc.roles.list.useQuery();
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
    onError: (e) => setCreateError(friendlyError(e)),
  });

  const deleteMutation = trpc.invites.delete.useMutation({
    onSuccess: () => utils.invites.list.invalidate(),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    createMutation.mutate({ email: email.trim(), role_id: roleId });
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
              <label className="font-mono text-[10px] text-neutral-500 block mb-1">Role *</label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                required
                className={inputClass}
              >
                <option value="">Select a role…</option>
                {roles?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {formatRoleName(role.name)}
                  </option>
                ))}
              </select>
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
                  <td className="px-3 py-3 font-mono text-[11px] text-neutral-400">
                    {(() => { const r = roles?.find((r) => r.id === invite.role_id); return r ? formatRoleName(r.name) : invite.role_id; })()}
                  </td>
                  <td className="px-3 py-3 font-mono text-[11px] text-neutral-500">{formatDate(invite.expires_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteMutation.mutate({ id: invite.id })}
                      disabled={deleteMutation.isPending}
                      className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border border-neutral-700 text-red-400 hover:text-red-300 hover:border-red-700 md:opacity-0 md:group-hover:opacity-100 disabled:opacity-50 transition-all"
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
  return (
    <div className="max-w-md space-y-5">
      {/* Sign-in */}
      <div className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2">
        Sign-in
      </div>
      <PasswordSection />
      <div className="mt-4">
        <PasskeysSection />
      </div>

      {/* Two-Factor Authentication */}
      <div className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2 mt-6">
        Two-Factor Authentication
      </div>
      <TOTPSection />
    </div>
  );
}

// ── Roles Tab ────────────────────────────────────────────────────────────────

function RolesTab() {
  const utils = trpc.useUtils();
  const { data: roles, isLoading } = trpc.roles.list.useQuery();
  const { data: allPermissions } = trpc.roles.permissions.useQuery();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);

  const createMutation = trpc.roles.create.useMutation({
    onSuccess: () => {
      utils.roles.list.invalidate();
      setShowCreate(false);
      setName("");
      setSelectedPerms([]);
      setCreateError(null);
    },
    onError: (e) => setCreateError(friendlyError(e)),
  });

  const togglePerm = (perm: string) => {
    setSelectedPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    createMutation.mutate({ name: name.trim(), permissions: selectedPerms });
  };

  // Group permissions by resource (e.g., "bases:read" → "bases")
  const permGroups = (allPermissions ?? []).reduce<Record<string, string[]>>((acc, p) => {
    const [resource] = p.split(":");
    if (!acc[resource]) acc[resource] = [];
    acc[resource].push(p);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex justify-between items-center">
        <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">
          Roles
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
        >
          {showCreate ? "Cancel" : "+ Role"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-neutral-800 border border-neutral-700 rounded-[5px] p-4">
          <div className="font-mono text-[10px] tracking-wider text-neutral-400 uppercase mb-3">Create Role</div>
          <div className="mb-3">
            <label className="font-mono text-[10px] text-neutral-500 block mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. pilot"
              required
              className={inputClass + " max-w-xs"}
            />
          </div>
          <div className="mb-3">
            <label className="font-mono text-[10px] text-neutral-500 block mb-2">Permissions *</label>
            <div className="space-y-3">
              {Object.entries(permGroups).map(([resource, perms]) => (
                <div key={resource}>
                  <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1">{resource}</div>
                  <div className="flex flex-wrap gap-2">
                    {perms.map((perm) => {
                      const action = perm.split(":")[1];
                      const active = selectedPerms.includes(perm);
                      return (
                        <button
                          key={perm}
                          type="button"
                          onClick={() => togglePerm(perm)}
                          className={`font-mono text-[10px] px-2.5 py-1 rounded border transition-colors ${
                            active
                              ? "bg-emerald-900/40 text-emerald-400 border-emerald-400/30"
                              : "bg-neutral-900 text-neutral-500 border-neutral-700 hover:text-neutral-300 hover:border-neutral-600"
                          }`}
                        >
                          {action}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {createError && <div className="font-mono text-[10px] text-red-400 mb-3">{createError}</div>}
          <button
            type="submit"
            disabled={createMutation.isPending || selectedPerms.length === 0}
            className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            {createMutation.isPending ? "Creating…" : "Create Role"}
          </button>
        </form>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center font-mono text-[11px] text-neutral-500">Loading roles…</div>
        ) : !roles || roles.length === 0 ? (
          <div className="py-12 text-center font-mono text-[11px] text-neutral-500">No roles found</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950">
                <th className="px-4 py-2.5 text-left">
                  <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Name</span>
                </th>
                <th className="px-3 py-2.5 text-left">
                  <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Type</span>
                </th>
                <th className="px-3 py-2.5 text-left">
                  <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Permissions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b border-neutral-800 last:border-0">
                  <td className="px-4 py-3 font-mono text-[12px] text-foreground">{formatRoleName(role.name)}</td>
                  <td className="px-3 py-3">
                    {role.system ? (
                      <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border bg-neutral-800 text-neutral-400 border-neutral-700">
                        System
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border bg-emerald-900/30 text-emerald-400 border-emerald-400/20">
                        Custom
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((p) => (
                        <span key={p} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                          {p}
                        </span>
                      ))}
                    </div>
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

// ── Scope Selector ───────────────────────────────────────────────────────────

type SettingsScope = "org" | "account";

function ScopeSelector({ value, onChange }: { value: SettingsScope; onChange: (v: SettingsScope) => void }) {
  return (
    <div className="inline-flex items-center bg-neutral-900 border border-neutral-800 rounded-[5px] p-0.5">
      {([
        { key: "org", label: "Organisation" },
        { key: "account", label: "Account" },
      ] as const).map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={`font-mono text-[11px] px-3 py-1 rounded-[3px] transition-colors ${
            value === item.key
              ? "bg-neutral-800 text-foreground"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [scope, setScope] = useState<SettingsScope>("account");

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-(--page-padding) py-3 border-b border-neutral-800 bg-neutral-950 shrink-0">
        <div>
          <div className="text-[15px] font-semibold text-foreground tracking-tight">Settings</div>
          <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
            {scope === "org" ? "Manage your organisation" : "Manage your account"}
          </div>
        </div>
        <ScopeSelector value={scope} onChange={setScope} />
      </div>

      <div className="flex-1 overflow-auto p-(--page-padding)">
        {scope === "org" && (
          <Tabs defaultValue="general">
            <TabsList variant="line" className="mb-6 overflow-x-auto">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="invites">Invites</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <OrgTab />
            </TabsContent>
            <TabsContent value="members">
              <MembersTab />
            </TabsContent>
            <TabsContent value="invites">
              <InvitesTab />
            </TabsContent>
            <TabsContent value="roles">
              <RolesTab />
            </TabsContent>
          </Tabs>
        )}

        {scope === "account" && (
          <Tabs defaultValue="security">
            <TabsList variant="line" className="mb-6 overflow-x-auto">
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="security">
              <SecurityTab />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
