"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import type { OrgFromLogin } from "@/lib/types";

interface LoginFormProps {
  onMfaRequired: (setupRequired: boolean) => void;
  onSuccess: (orgs?: OrgFromLogin[]) => void;
}

export function LoginForm({ onMfaRequired, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.mfa_required) {
        onMfaRequired(data.setup_required);
      } else {
        onSuccess(data.orgs);
      }
    },
    onError: (err) => {
      const retryAfter = (err.data as { retryAfter?: number } | undefined)?.retryAfter;
      if (retryAfter) {
        setError(`Too many attempts. Try again in ${retryAfter} seconds.`);
      } else {
        setError(err.message === "invalid_credentials" ? "Invalid email or password" : err.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-400">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-400">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          placeholder="Enter your password"
        />
      </div>
      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-xs text-neutral-400 hover:text-white"
        >
          Forgot password?
        </Link>
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
      >
        {loginMutation.isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
