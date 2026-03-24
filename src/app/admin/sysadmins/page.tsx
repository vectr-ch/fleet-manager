"use client";

import { trpc } from "@/lib/trpc/client";

export default function SysadminsPage() {
  const adminsQuery = trpc.sysadminAdmins.list.useQuery();

  return (
    <div>
      <h1 className="text-xl font-semibold text-white mb-6">Sysadmins</h1>

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
