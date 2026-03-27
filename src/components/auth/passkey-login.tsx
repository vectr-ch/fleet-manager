"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { isWebAuthnSupported, toRequestOptions, serializeAuthentication } from "@/lib/webauthn";
import type { OrgFromLogin } from "@/lib/types";

interface PasskeyLoginProps {
  onSuccess: (orgs?: OrgFromLogin[]) => void;
}

export function PasskeyLogin({ onSuccess }: PasskeyLoginProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const optionsMutation = trpc.auth.passkeyLoginOptions.useMutation();
  const verifyMutation = trpc.auth.passkeyLoginVerify.useMutation();

  if (!isWebAuthnSupported()) return null;

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const options = await optionsMutation.mutateAsync();
      const publicKeyOptions = toRequestOptions(options.publicKey as Record<string, unknown>);
      const credential = await navigator.credentials.get({ publicKey: publicKeyOptions });
      if (!credential) { setLoading(false); return; }
      const serialized = serializeAuthentication(credential as PublicKeyCredential);
      const result = await verifyMutation.mutateAsync({
        session_id: options.session_id,
        credential: serialized,
      });
      if (result.success) { onSuccess(result.orgs); }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setLoading(false);
        return; // User cancelled
      }
      setError("Passkey verification failed");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-neutral-900 px-2 font-mono text-[10px] text-neutral-500">or</span>
        </div>
      </div>
      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full rounded-[5px] border border-neutral-700 bg-neutral-800 px-3 py-2 font-mono text-[11px] text-foreground hover:bg-neutral-700 disabled:opacity-50"
      >
        {loading ? "Waiting for passkey..." : "Sign in with passkey"}
      </button>
      {error && <p className="mt-2 font-mono text-[10px] text-red-400">{error}</p>}
    </div>
  );
}
