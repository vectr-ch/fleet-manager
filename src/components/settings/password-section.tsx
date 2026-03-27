"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

const inputClass =
  "bg-neutral-900 border border-neutral-700 rounded-[5px] px-2.5 py-1.5 font-mono text-[11px] text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 w-full";

export function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const changePasswordMutation = trpc.userAccount.changePassword.useMutation({
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (e) => setError(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    changePasswordMutation.mutate({
      current_password: currentPassword,
      new_password: newPassword,
    });
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-5">
      <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-4">Change Password</div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="font-mono text-[10px] text-neutral-500 block mb-1">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="font-mono text-[10px] text-neutral-500 block mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="font-mono text-[10px] text-neutral-500 block mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            className={inputClass}
          />
        </div>

        {error && <div className="font-mono text-[10px] text-red-400">{error}</div>}
        {success && <div className="font-mono text-[10px] text-emerald-400">Password changed successfully.</div>}

        <button
          type="submit"
          disabled={changePasswordMutation.isPending}
          className="font-mono text-[10px] tracking-wider uppercase px-4 py-2 rounded-[5px] bg-foreground text-background hover:opacity-90 disabled:opacity-50 transition-opacity mt-1"
        >
          {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
