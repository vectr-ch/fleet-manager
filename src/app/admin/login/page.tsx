"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { trpc } from "@/lib/trpc/client";

type Step = "credentials" | "mfa-setup" | "mfa-verify";

interface MfaSetupData {
  qrCodeUrl: string;
  secret: string;
  backupCodes?: string[];
}

export default function AdminLoginPage() {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<Step>("credentials");

  // Credentials form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // MFA setup state
  const [mfaSetupData, setMfaSetupData] = useState<MfaSetupData | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [setupCode, setSetupCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [backupCodesCopied, setBackupCodesCopied] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // MFA verify state
  const [totpCode, setTotpCode] = useState("");

  // Error state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // tRPC mutations
  const loginMutation = trpc.sysadminAuth.login.useMutation();
  const mfaSetupMutation = trpc.sysadminAuth.mfaSetup.useMutation();
  const mfaConfirmMutation = trpc.sysadminAuth.mfaConfirm.useMutation();
  const mfaVerifyMutation = trpc.sysadminAuth.mfaVerify.useMutation();

  // Step 1: Credentials submit
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      // MFA is always required for sysadmins
      if (result.mfa_required) {
        if (result.setup_required) {
          // First-time sysadmin: trigger MFA setup
          const setupResult = await mfaSetupMutation.mutateAsync();
          setMfaSetupData({
            qrCodeUrl: setupResult.qr_uri,
            secret: setupResult.secret,
          });
          setStep("mfa-setup");
        } else {
          setStep("mfa-verify");
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: MFA setup confirm
  const handleMfaSetupConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await mfaConfirmMutation.mutateAsync({ code: setupCode });
      if (result.backup_codes) {
        setBackupCodes(result.backup_codes);
        setShowBackupCodes(true);
      } else {
        router.push("/admin/organisations");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  // Step 2b: After backup codes acknowledged
  const handleBackupCodesAcknowledged = () => {
    router.push("/admin/organisations");
  };

  // Copy backup codes
  const handleCopyBackupCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join("\n"));
    setBackupCodesCopied(true);
    setTimeout(() => setBackupCodesCopied(false), 2000);
  };

  // Step 3: MFA verify
  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await mfaVerifyMutation.mutateAsync({ code: totpCode });
      router.push("/admin/organisations");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-neutral-800 bg-neutral-900 p-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">VECTR</h1>
            <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-neutral-400">
              Admin
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {step === "credentials" && "Sign in to the admin console"}
            {step === "mfa-setup" && (showBackupCodes ? "Save your backup codes" : "Set up two-factor authentication")}
            {step === "mfa-verify" && "Two-factor authentication"}
          </p>
        </div>

        {/* Step 1: Credentials */}
        {step === "credentials" && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm text-neutral-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                placeholder="admin@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm text-neutral-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}

        {/* Step 2: MFA Setup */}
        {step === "mfa-setup" && !showBackupCodes && mfaSetupData && (
          <div className="space-y-5">
            <p className="text-sm text-neutral-400">
              Scan the QR code with your authenticator app (e.g. Google Authenticator, Authy).
            </p>

            {/* QR code in white container */}
            <div className="flex justify-center">
              <div className="rounded-lg bg-white p-4">
                <QRCodeSVG value={mfaSetupData.qrCodeUrl} size={180} />
              </div>
            </div>

            {/* Can't scan expandable */}
            <div>
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-300"
              >
                <svg
                  className={`h-3.5 w-3.5 transition-transform ${showSecret ? "rotate-90" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Can&apos;t scan? Enter code manually
              </button>
              {showSecret && (
                <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-950 p-3">
                  <p className="mb-1 text-xs text-neutral-500">Manual entry key</p>
                  <code className="break-all font-mono text-sm text-neutral-300">{mfaSetupData.secret}</code>
                </div>
              )}
            </div>

            {/* Confirm code form */}
            <form onSubmit={handleMfaSetupConfirm} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="setup-code" className="block text-sm text-neutral-400">
                  Verification code
                </label>
                <input
                  id="setup-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-center font-mono text-lg tracking-[0.5em] text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  placeholder="000000"
                  autoComplete="one-time-code"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading || setupCode.length !== 6}
                className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Verify and continue"}
              </button>
            </form>
          </div>
        )}

        {/* Step 2b: Backup codes display */}
        {step === "mfa-setup" && showBackupCodes && backupCodes.length > 0 && (
          <div className="space-y-5">
            <div className="rounded-md border border-amber-900/50 bg-amber-950/20 p-3">
              <p className="text-sm font-medium text-amber-400">Save these backup codes</p>
              <p className="mt-1 text-xs text-amber-500/80">
                Store them somewhere safe. Each code can only be used once. You will not see these again.
              </p>
            </div>

            {/* 2-column grid of backup codes */}
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, i) => (
                <div
                  key={i}
                  className="rounded border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-center font-mono text-sm text-neutral-300"
                >
                  {code}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCopyBackupCodes}
                className="flex-1 rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
              >
                {backupCodesCopied ? "Copied!" : "Copy all"}
              </button>
              <button
                type="button"
                onClick={handleBackupCodesAcknowledged}
                className="flex-1 rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
              >
                I&apos;ve saved them
              </button>
            </div>
          </div>
        )}

        {/* Step 3: MFA Verify */}
        {step === "mfa-verify" && (
          <form onSubmit={handleMfaVerify} className="space-y-4">
            <p className="text-sm text-neutral-400">
              Enter the 6-digit code from your authenticator app.
            </p>
            <div className="space-y-1.5">
              <label htmlFor="totp-code" className="block text-sm text-neutral-400">
                Authentication code
              </label>
              <input
                id="totp-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoFocus
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-center font-mono text-lg tracking-[0.5em] text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                placeholder="000000"
                autoComplete="one-time-code"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading || totpCode.length !== 6}
              className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setError(null);
                setTotpCode("");
              }}
              className="w-full rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
            >
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
