"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

function validatePassword(pw: string): string[] {
  const errors: string[] = [];
  if (pw.length < 12) errors.push("At least 12 characters");
  if (!/[A-Z]/.test(pw)) errors.push("At least one uppercase letter");
  if (!/[a-z]/.test(pw)) errors.push("At least one lowercase letter");
  if (!/[0-9]/.test(pw)) errors.push("At least one number");
  if (!/[^A-Za-z0-9\s]/.test(pw)) errors.push("At least one special character");
  return errors;
}

type Step = "verify" | "reset";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("verify");

  // Step 1: Verify
  const [email, setEmail] = useState("");
  const [totpCode, setTotpCode] = useState("");

  // Step 2: Reset
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Common state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const verifyMutation = trpc.sysadminResetPassword.verify.useMutation();
  const confirmMutation = trpc.sysadminResetPassword.confirm.useMutation();

  // Step 1: Verify email + TOTP
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await verifyMutation.mutateAsync({ email, code: totpCode });
      setResetToken(result.reset_token);
      setStep("reset");
    } catch {
      setError("Invalid email or verification code");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Set new password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const pwErrors = validatePassword(password);
    setPasswordErrors(pwErrors);
    if (pwErrors.length > 0) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await confirmMutation.mutateAsync({ token: resetToken, password });
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to reset password. Please try again."
      );
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
              Reset Password
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {step === "verify" && "Verify your identity to reset your password"}
            {step === "reset" && !success && "Set your new password"}
          </p>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-950 ring-1 ring-green-800">
                <svg
                  className="h-7 w-7 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <p className="text-lg font-medium text-white">Password reset successfully</p>
            <p className="text-sm text-neutral-500">Redirecting to sign in...</p>
          </div>
        ) : step === "verify" ? (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
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
              <label htmlFor="totp-code" className="block text-sm text-neutral-400">
                Authentication code
              </label>
              <p className="text-xs text-neutral-500">
                Enter the 6-digit code from your authenticator app.
              </p>
              <input
                id="totp-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
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
              {loading ? "Verifying..." : "Verify and continue"}
            </button>
            <a
              href="/admin/login"
              className="block text-center text-sm text-neutral-500 hover:text-neutral-300"
            >
              Back to sign in
            </a>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="block text-sm text-neutral-400">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordErrors.length > 0) {
                    setPasswordErrors(validatePassword(e.target.value));
                  }
                }}
                className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                placeholder="••••••••••••"
              />
              {passwordErrors.length > 0 && (
                <ul className="space-y-0.5 text-xs text-red-400">
                  {passwordErrors.map((msg) => (
                    <li key={msg}>{msg}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="block text-sm text-neutral-400">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                placeholder="••••••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Resetting password..." : "Reset password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
