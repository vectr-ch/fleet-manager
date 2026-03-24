"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forgotMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => setSubmitted(true),
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
    forgotMutation.mutate({ email });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-neutral-800 bg-neutral-900 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">VECTR</h1>
          <p className="mt-1 text-sm text-neutral-500">Reset your password</p>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-neutral-300">
              If an account exists for <span className="font-medium text-white">{email}</span>,
              you will receive a password reset email shortly.
            </p>
            <Link
              href="/login"
              className="inline-block text-sm text-neutral-400 hover:text-white"
            >
              Back to login
            </Link>
          </div>
        ) : (
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
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={forgotMutation.isPending}
              className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
            >
              {forgotMutation.isPending ? "Sending..." : "Send reset link"}
            </button>
            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-neutral-400 hover:text-white"
              >
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
