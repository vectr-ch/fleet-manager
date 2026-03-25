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

  const handleSwitch = (slug: string, name: string) => {
    if (slug === currentOrg) {
      setIsOpen(false);
      return;
    }
    switchOrgMutation.mutate({ orgSlug: slug, orgName: name });
    setIsOpen(false);
  };

  const displayName = currentOrgName ?? orgsQuery.data?.find((o) => o.slug === currentOrg)?.name ?? currentOrg;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-700"
      >
        {displayName}
        <span className="text-neutral-500">&#x25BE;</span>
      </button>
      {isOpen && orgsQuery.data && (
        <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-md border border-neutral-700 bg-neutral-800 py-1 shadow-lg">
          {orgsQuery.data.map((org) => (
            <button
              key={org.id}
              onClick={() => handleSwitch(org.slug, org.name)}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-neutral-700 ${
                org.slug === currentOrg ? "text-emerald-400" : "text-neutral-200"
              }`}
            >
              {org.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
