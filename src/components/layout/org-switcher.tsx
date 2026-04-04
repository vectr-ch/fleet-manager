"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

interface OrgSwitcherProps {
  currentOrg: string;
  currentOrgName: string | null;
}

export function OrgSwitcher({ currentOrg, currentOrgName }: OrgSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const orgsQuery = trpc.userAccount.listOrgs.useQuery();
  const switchOrgMutation = trpc.userAccount.updateDefaultOrg.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const handleSwitch = (org: { id: string; slug: string; name: string }) => {
    if (org.slug === currentOrg) {
      setIsOpen(false);
      return;
    }
    switchOrgMutation.mutate({ orgId: org.id, orgSlug: org.slug, orgName: org.name });
    setIsOpen(false);
  };

  const displayName = currentOrgName ?? orgsQuery.data?.find((o) => o.slug === currentOrg)?.name ?? currentOrg;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-[5px] border border-[#252525] bg-transparent px-2.5 py-1 font-mono text-xs text-[#888] transition-all hover:border-[#3a3a3a] hover:text-[#e8e8e8]"
      >
        <span className="size-1.5 rounded-full bg-fleet-blue" />
        {displayName}
        <span className="text-[#555] text-[10px]">▾</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          {orgsQuery.data && (
            <div className="absolute right-0 top-full z-50 mt-1.5 min-w-45 rounded-md border border-[#252525] bg-[#0f0f0f] py-1 shadow-[0_8px_24px_#000a]">
              {orgsQuery.data.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSwitch(org)}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left font-mono text-[11px] transition-colors hover:bg-[#1a1a1a] ${
                    org.slug === currentOrg ? "text-fleet-green" : "text-[#888] hover:text-[#e8e8e8]"
                  }`}
                >
                  {org.slug === currentOrg && <span className="size-1 rounded-full bg-fleet-green" />}
                  {org.name}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
