"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { friendlyError } from "@/lib/error-messages";
import type { OrgFromLogin } from "@/lib/types";

interface MfaVerifyProps {
  onSuccess: (orgs?: OrgFromLogin[]) => void;
}

export function MfaVerify({ onSuccess }: MfaVerifyProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const verifyMutation = trpc.auth.mfaVerify.useMutation({
    onSuccess: (data) => onSuccess(data.orgs),
    onError: (err) => setError(friendlyError(err)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    verifyMutation.mutate({ code });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-neutral-400">
        Enter the 6-digit code from your authenticator app.
      </p>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        required
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        className="block w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-center text-2xl tracking-widest text-white focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        placeholder="000000"
        autoFocus
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={verifyMutation.isPending || code.length !== 6}
        className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
      >
        {verifyMutation.isPending ? "Verifying..." : "Verify"}
      </button>
    </form>
  );
}
