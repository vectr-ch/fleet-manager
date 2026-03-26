"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { validatePassword } from "@/lib/password";

export default function InviteAcceptPage() {
  return (
    <Suspense>
      <InviteAcceptForm />
    </Suspense>
  );
}

function InviteAcceptForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const emailParam = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // user_info cookie is client-readable and indicates an active session
  const isLoggedIn = typeof document !== "undefined" && document.cookie.includes("user_info=");

  const acceptMutation = trpc.invites.accept.useMutation({
    onSuccess: () => {
      // Clear stale org list so /select-org does a fresh fetch
      sessionStorage.removeItem("pending_orgs");
      setSuccess(true);
    },
    onError: (err) => {
      if (err.data?.code === "TOO_MANY_REQUESTS") {
        setError("Too many requests. Please try again later.");
      } else {
        setError(err.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password) {
      const policyError = validatePassword(password);
      if (policyError) {
        setError(policyError);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    acceptMutation.mutate({
      token,
      email,
      ...(password ? { password } : {}),
    });
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <p className="text-red-400">Invalid invite link — no token provided.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="w-full max-w-md space-y-4 rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center">
          <h2 className="text-xl font-bold text-white">
            {isLoggedIn ? "Invitation Accepted" : "Account Created"}
          </h2>
          <p className="text-neutral-400">
            {isLoggedIn
              ? "You have been added to the organisation."
              : "Your account has been created successfully."}
          </p>
          <button
            onClick={() => router.push(isLoggedIn ? "/select-org" : "/login")}
            className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
          >
            {isLoggedIn ? "Continue" : "Go to login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-neutral-800 bg-neutral-900 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Join VECTR</h1>
          <p className="mt-1 text-sm text-neutral-400">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-400">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={!!emailParam}
              className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 read-only:opacity-60"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-400">Password</label>
            <input
              id="password"
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              placeholder="Choose a password"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Min 8 characters. Leave blank if you already have an account.
            </p>
          </div>
          {password && (
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-neutral-400">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              />
            </div>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={acceptMutation.isPending}
            className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
          >
            {acceptMutation.isPending ? "Joining..." : "Join organisation"}
          </button>
        </form>
      </div>
    </div>
  );
}
