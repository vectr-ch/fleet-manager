"use client";

import { useState } from "react";

const inputClass =
  "bg-neutral-900 border border-neutral-700 rounded-[5px] px-2.5 py-1.5 font-mono text-[11px] text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 w-full";

interface StepUpDialogProps {
  title: string;
  description: string;
  onSubmit: (code: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}

export function StepUpDialog({ title, description, onSubmit, onCancel, isLoading, error }: StepUpDialogProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    onSubmit(code);
  };

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-[5px] p-4 mt-3">
      <div className="font-mono text-[10px] tracking-wider text-neutral-400 uppercase mb-1">{title}</div>
      <div className="font-mono text-[10px] text-neutral-500 mb-3">{description}</div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="font-mono text-[10px] text-neutral-500 block mb-1">Verification Code</label>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9a-zA-Z-]/g, ""))}
            placeholder="6-digit code or backup code"
            required
            autoFocus
            className={inputClass + " max-w-xs"}
          />
        </div>

        {error && <div className="font-mono text-[10px] text-red-400">{error}</div>}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isLoading || code.length < 6}
            className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Verifying..." : "Confirm"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-[5px] border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
