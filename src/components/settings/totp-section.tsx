"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { trpc } from "@/lib/trpc/client";
import { StepUpDialog } from "./step-up-dialog";

type Action = "disable" | "regenerate" | null;

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

export function TOTPSection() {
  const utils = trpc.useUtils();
  const { data: status, isLoading } = trpc.userAccount.mfaStatus.useQuery();

  const [activeAction, setActiveAction] = useState<Action>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [newBackupCodes, setNewBackupCodes] = useState<string[] | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  const disableMutation = trpc.userAccount.disableMFA.useMutation({
    onSuccess: () => {
      utils.userAccount.mfaStatus.invalidate();
      setActiveAction(null);
      setActionError(null);
    },
    onError: (e) => setActionError(e.message),
  });

  const regenerateMutation = trpc.userAccount.regenerateBackupCodes.useMutation({
    onSuccess: (data) => {
      setNewBackupCodes(data.backup_codes);
      setActiveAction(null);
      setActionError(null);
      utils.userAccount.mfaStatus.invalidate();
    },
    onError: (e) => setActionError(e.message),
  });

  // MFA setup flow (reuses the auth mfaSetup/mfaConfirm flow)
  const setupMutation = trpc.auth.mfaSetup.useMutation();
  const confirmMutation = trpc.auth.mfaConfirm.useMutation({
    onSuccess: (data) => {
      setNewBackupCodes(data.backup_codes);
      setShowSetup(false);
      utils.userAccount.mfaStatus.invalidate();
    },
    onError: (e) => setActionError(e.message),
  });

  const [setupCode, setSetupCode] = useState("");

  const handleStartSetup = async () => {
    setActionError(null);
    setShowSetup(true);
    setupMutation.mutate();
  };

  const handleConfirmSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    confirmMutation.mutate({ code: setupCode });
  };

  const handleStepUp = async (code: string) => {
    setActionError(null);
    if (activeAction === "disable") {
      disableMutation.mutate({ code });
    } else if (activeAction === "regenerate") {
      regenerateMutation.mutate({ code });
    }
  };

  const handleCopyBackupCodes = () => {
    if (newBackupCodes) {
      navigator.clipboard.writeText(newBackupCodes.join("\n"));
    }
  };

  if (isLoading) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-5">
        <div className="font-mono text-[11px] text-neutral-500">Loading...</div>
      </div>
    );
  }

  // Show new backup codes
  if (newBackupCodes) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-5">
        <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-3">
          {status?.totp_enabled ? "New Backup Codes" : "Backup Codes"}
        </div>
        <div className="font-mono text-[10px] text-amber-400 mb-3">
          Save these codes in a safe place. Each code can only be used once.
        </div>
        <div className="grid grid-cols-2 gap-1.5 bg-neutral-800 border border-neutral-700 rounded-[5px] p-3 mb-3">
          {newBackupCodes.map((code, i) => (
            <span key={i} className="font-mono text-[11px] text-neutral-200">{code}</span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyBackupCodes}
            className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Copy all codes
          </button>
          <button
            onClick={() => setNewBackupCodes(null)}
            className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Setup flow
  if (showSetup) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-5">
        <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-4">
          Set Up Authenticator
        </div>

        {setupMutation.isPending && (
          <div className="font-mono text-[11px] text-neutral-500">Generating QR code...</div>
        )}

        {setupMutation.data && (
          <div className="space-y-4">
            <div className="font-mono text-[10px] text-neutral-400">
              Scan this QR code with your authenticator app.
            </div>
            <div className="flex justify-center bg-white rounded-[5px] p-4 max-w-[200px]">
              <QRCodeSVG value={setupMutation.data.qr_uri} size={180} />
            </div>
            <details className="font-mono text-[10px]">
              <summary className="cursor-pointer text-neutral-500 hover:text-neutral-400">
                Manual entry code
              </summary>
              <code className="mt-1 block break-all bg-neutral-800 border border-neutral-700 rounded-[5px] p-2 text-neutral-300">
                {setupMutation.data.secret}
              </code>
            </details>
            <form onSubmit={handleConfirmSetup} className="space-y-3">
              <div>
                <label className="font-mono text-[10px] text-neutral-500 block mb-1">Verification Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  required
                  autoFocus
                  className="bg-neutral-900 border border-neutral-700 rounded-[5px] px-2.5 py-1.5 font-mono text-[11px] text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 w-full max-w-xs"
                />
              </div>
              {actionError && <div className="font-mono text-[10px] text-red-400">{actionError}</div>}
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={confirmMutation.isPending || setupCode.length !== 6}
                  className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                >
                  {confirmMutation.isPending ? "Verifying..." : "Verify & Activate"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowSetup(false); setSetupCode(""); setActionError(null); }}
                  className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // TOTP enabled state
  if (status?.totp_enabled) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Authenticator App</div>
          <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border bg-emerald-900/30 text-emerald-400 border-emerald-400/20">
            Enabled
          </span>
        </div>

        <div className="space-y-2 mb-4">
          {status.totp_created_at && (
            <div className="font-mono text-[11px] text-neutral-400">
              Enrolled {formatDate(status.totp_created_at)}
            </div>
          )}
          <div className="font-mono text-[11px] text-neutral-400">
            {status.backup_codes_remaining} backup code{status.backup_codes_remaining === 1 ? "" : "s"} remaining
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleStartSetup}
            className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] border border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 transition-colors"
          >
            Change device
          </button>
          <button
            onClick={() => { setActiveAction("regenerate"); setActionError(null); }}
            className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] border border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 transition-colors"
          >
            Regenerate codes
          </button>
          <button
            onClick={() => { setActiveAction("disable"); setActionError(null); }}
            className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] border border-neutral-700 text-red-400 hover:text-red-300 hover:border-red-700 transition-colors"
          >
            Disable
          </button>
        </div>

        {activeAction === "disable" && (
          <StepUpDialog
            title="Disable Two-Factor Authentication"
            description="Enter your authenticator code or a backup code to disable 2FA."
            onSubmit={handleStepUp}
            onCancel={() => { setActiveAction(null); setActionError(null); }}
            isLoading={disableMutation.isPending}
            error={actionError}
          />
        )}

        {activeAction === "regenerate" && (
          <StepUpDialog
            title="Regenerate Backup Codes"
            description="Enter your authenticator code to generate new backup codes. All existing codes will be invalidated."
            onSubmit={handleStepUp}
            onCancel={() => { setActiveAction(null); setActionError(null); }}
            isLoading={regenerateMutation.isPending}
            error={actionError}
          />
        )}
      </div>
    );
  }

  // TOTP disabled state
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Authenticator App</div>
        <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border bg-neutral-800 text-neutral-500 border-neutral-700">
          Disabled
        </span>
      </div>

      <div className="font-mono text-[11px] text-neutral-500 mb-4">
        Add an authenticator app for an extra layer of security.
      </div>

      <button
        onClick={handleStartSetup}
        className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
      >
        Enable
      </button>
    </div>
  );
}
