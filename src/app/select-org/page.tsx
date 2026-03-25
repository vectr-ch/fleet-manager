"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import type { OrgFromLogin } from "@/lib/types";

function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function SelectOrgPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<OrgFromLogin[] | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Try sessionStorage first (primary path after login)
  useEffect(() => {
    const raw = sessionStorage.getItem("pending_orgs");
    if (raw) {
      try {
        setOrgs(JSON.parse(raw));
      } catch {
        // ignore parse error; fall through to live fetch
      }
    }
    setInitialized(true);
  }, []);

  // Fallback: live fetch when sessionStorage is absent (new tab / browser restore).
  // Only enabled after the sessionStorage check completes.
  const listMyOrgsQuery = trpc.userAccount.listMyOrgs.useQuery(undefined, {
    enabled: initialized && orgs === null,
    retry: false,
  });

  useEffect(() => {
    if (listMyOrgsQuery.data) {
      setOrgs(listMyOrgsQuery.data.map((o) => ({ ...o, is_default: false })));
    }
  }, [listMyOrgsQuery.data]);

  const selectOrgMutation = trpc.userAccount.selectOrg.useMutation({
    onSuccess: () => {
      sessionStorage.removeItem("pending_orgs");
      router.push("/overview");
    },
  });

  const handleSelect = (slug: string) => {
    selectOrgMutation.mutate({ slug });
  };

  if (listMyOrgsQuery.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-neutral-400">
          Session expired.{" "}
          <a href="/login" className="text-white underline">
            Sign in again
          </a>
        </p>
      </div>
    );
  }

  if (orgs === null && listMyOrgsQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-neutral-400">Loading organisations...</p>
      </div>
    );
  }

  if (orgs !== null && orgs.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-neutral-400">
          You are not a member of any organisation. Contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-neutral-800 bg-neutral-900 p-8">
        <div>
          <h1 className="text-xl font-bold text-white">Choose a workspace</h1>
          <p className="mt-1 text-sm text-neutral-500">
            You&apos;re authenticated. Select an organisation to enter.
          </p>
        </div>

        <div className="space-y-2">
          {(orgs ?? []).map((org) => (
            <button
              key={org.id}
              onClick={() => handleSelect(org.slug)}
              disabled={selectOrgMutation.isPending}
              className="w-full flex items-center gap-3 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-left hover:border-neutral-500 hover:bg-neutral-700 disabled:opacity-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-200 shrink-0">
                {getInitials(org.name)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{org.name}</div>
                <div className="text-xs text-neutral-500 font-mono">{org.slug}</div>
              </div>
              <div className="text-xs text-neutral-500 font-semibold tracking-wide">
                ENTER →
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
