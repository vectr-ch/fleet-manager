"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { trpc } from "@/lib/trpc/client";
import { friendlyError } from "@/lib/error-messages";
import type { OrgFromLogin } from "@/lib/types";

interface MfaSetupProps {
  onSuccess: (orgs?: OrgFromLogin[]) => void;
}

export function MfaSetup({ onSuccess }: MfaSetupProps) {
  const [step, setStep] = useState<"qr" | "confirm" | "backup">("qr");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendingOrgs, setPendingOrgs] = useState<OrgFromLogin[] | undefined>();

  const setupMutation = trpc.auth.mfaSetup.useMutation({
    onSuccess: () => setStep("qr"),
  });

  const confirmMutation = trpc.auth.mfaConfirm.useMutation({
    onSuccess: (data) => {
      setBackupCodes(data.backup_codes);
      setStep("backup");
      setPendingOrgs(data.orgs);
    },
    onError: (err) => setError(friendlyError(err)),
  });

  useEffect(() => {
    setupMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    confirmMutation.mutate({ code });
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
  };

  if (setupMutation.isPending) {
    return <p className="text-neutral-400">Setting up MFA...</p>;
  }

  if (step === "backup") {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Backup Codes</h3>
        <p className="text-sm text-amber-400">
          Save these codes in a safe place. Each code can only be used once.
        </p>
        <div className="grid grid-cols-2 gap-2 rounded-md bg-neutral-800 p-4 font-mono text-sm">
          {backupCodes.map((code, i) => (
            <span key={i} className="text-neutral-200">{code}</span>
          ))}
        </div>
        <button
          onClick={handleCopyBackupCodes}
          className="w-full rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
        >
          Copy all codes
        </button>
        <button
          onClick={() => onSuccess(pendingOrgs)}
          className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
        >
          I&apos;ve saved my codes — continue
        </button>
      </div>
    );
  }

  if (!setupMutation.data) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Set Up Two-Factor Authentication</h3>
      <p className="text-sm text-neutral-400">
        Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
      </p>
      <div className="flex justify-center rounded-md bg-white p-4">
        <QRCodeSVG value={setupMutation.data.qr_uri} size={200} />
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-neutral-400 hover:text-neutral-300">
          Can&apos;t scan? Enter this code manually
        </summary>
        <code className="mt-2 block break-all rounded bg-neutral-800 p-2 text-xs text-neutral-200">
          {setupMutation.data.secret}
        </code>
      </details>
      <form onSubmit={handleConfirm} className="space-y-3">
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
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={confirmMutation.isPending || code.length !== 6}
          className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
        >
          {confirmMutation.isPending ? "Verifying..." : "Verify & activate"}
        </button>
      </form>
    </div>
  );
}
