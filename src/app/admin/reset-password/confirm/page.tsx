"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const confirmMutation = trpc.sysadminResetPassword.confirm.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
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
      await confirmMutation.mutateAsync({ token: token!, password });
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "data" in err &&
        (err as { data?: { code?: string } }).data?.code === "BAD_REQUEST"
      ) {
        setError("This reset link is invalid or has expired");
      } else {
        setError(
          err instanceof Error ? err.message : "This reset link is invalid or has expired"
        );
      }
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
          <p className="mt-1 text-sm text-neutral-500">Set your new password</p>
        </div>

        {!token ? (
          <div className="rounded-md border border-red-900/50 bg-red-950/20 p-4">
            <p className="text-sm text-red-400">
              No reset token found. Please use the link from your password reset email.
            </p>
          </div>
        ) : success ? (
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
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
