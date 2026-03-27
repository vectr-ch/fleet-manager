"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { SYSADMIN_MIN_LENGTH } from "@/lib/password";

type Step = "account" | "mfa" | "organisation" | "complete";

interface MfaSetupData {
  qrCodeUrl: string;
  secret: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function StepIndicator({ current }: { current: Step }) {
  const t = useTranslations("setup.steps");
  const steps: { key: Step; label: string }[] = [
    { key: "account", label: t("account") },
    { key: "mfa", label: t("security") },
    { key: "organisation", label: t("organisation") },
  ];
  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                i <= currentIndex
                  ? "bg-white text-black"
                  : "bg-neutral-800 text-neutral-500"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-xs ${
                i <= currentIndex ? "text-neutral-200" : "text-neutral-600"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-px w-6 ${
                i < currentIndex ? "bg-neutral-500" : "bg-neutral-800"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function SetupPage() {
  const t = useTranslations("setup");

  const [step, setStep] = useState<Step>("account");

  // Account form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // MFA state
  const [mfaSetupData, setMfaSetupData] = useState<MfaSetupData | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [setupCode, setSetupCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodesCopied, setBackupCodesCopied] = useState(false);

  // Organisation state
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Common state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // TRPC mutations
  const setupMutation = trpc.init.setup.useMutation();
  // MFA mutations reuse the existing sysadmin auth flow (challenge token stored
  // in the same cookie by init.setup).
  const mfaSetupMutation = trpc.sysadminAuth.mfaSetup.useMutation();
  const mfaConfirmMutation = trpc.sysadminAuth.mfaConfirm.useMutation();
  const createOrgMutation = trpc.sysadminOrgs.create.useMutation();

  // ---------- Validation ----------

  // Client-side validation mirrors the server PasswordPolicy (configured via
  // MIN_PASSWORD_LENGTH etc. in platform.go). The server is the source of truth
  // and will reject passwords that don't meet its policy. Update both if the
  // server policy changes.
  function validatePassword(pw: string): string[] {
    const errors: string[] = [];
    if (pw.length < SYSADMIN_MIN_LENGTH) errors.push(t("errors.passwordMinLength", { minLength: SYSADMIN_MIN_LENGTH }));
    if (!/[A-Z]/.test(pw)) errors.push(t("errors.passwordUppercase"));
    if (!/[a-z]/.test(pw)) errors.push(t("errors.passwordLowercase"));
    if (!/[0-9]/.test(pw)) errors.push(t("errors.passwordDigit"));
    if (!/[^A-Za-z0-9\s]/.test(pw)) errors.push(t("errors.passwordSpecial"));
    return errors;
  }

  // ---------- Step 1: Account ----------

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const pwErrors = validatePassword(password);
    setPasswordErrors(pwErrors);
    if (pwErrors.length > 0) return;

    if (password !== confirmPassword) {
      setError(t("errors.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      await setupMutation.mutateAsync({ email, password });

      // Immediately trigger MFA setup
      const mfaResult = await mfaSetupMutation.mutateAsync();
      setMfaSetupData({
        qrCodeUrl: mfaResult.qr_uri,
        secret: mfaResult.secret,
      });
      setError(null);
      setStep("mfa");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const trpcErr = err as { data?: { code?: string }; message?: string };
        if (trpcErr.data?.code === "NOT_FOUND") {
          setError(t("errors.alreadyInitialized"));
          setTimeout(() => {
            window.location.href = "/admin/login";
          }, 2000);
          return;
        }
        if (trpcErr.data?.code === "TOO_MANY_REQUESTS") {
          setError(t("errors.rateLimited"));
          return;
        }
      }
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Step 2: MFA ----------

  const handleMfaConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await mfaConfirmMutation.mutateAsync({ code: setupCode });
      if (result.backup_codes) {
        setBackupCodes(result.backup_codes);
        setShowBackupCodes(true);
      } else {
        setStep("organisation");
      }
    } catch {
      setError(t("errors.invalidCode"));
    } finally {
      setLoading(false);
    }
  };

  const handleBackupCodesAcknowledged = () => {
    setError(null);
    setStep("organisation");
  };

  const handleCopyBackupCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join("\n"));
    setBackupCodesCopied(true);
    setTimeout(() => setBackupCodesCopied(false), 2000);
  };

  // ---------- Step 3: Organisation ----------

  const handleOrgNameChange = (name: string) => {
    setOrgName(name);
    if (!slugManuallyEdited) {
      setOrgSlug(slugify(name));
    }
  };

  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createOrgMutation.mutateAsync({
        name: orgName,
        slug: orgSlug,
      });
      setError(null);
      setStep("complete");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Shared styles ----------

  const inputClass =
    "w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500";
  const labelClass = "block text-sm text-neutral-400";
  const primaryBtnClass =
    "w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50";
  const secondaryBtnClass =
    "flex-1 rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800";

  return (
    <div className="w-full max-w-md space-y-6 rounded-lg border border-neutral-800 bg-neutral-900 p-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            VECTR
          </h1>
          <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-neutral-400">
            Setup
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">{t("title")}</p>
      </div>

      {/* Step indicator */}
      <StepIndicator current={step} />

      {/* Step 1: Account */}
      {step === "account" && (
        <form onSubmit={handleAccountSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-neutral-400">{t("account.description")}</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className={labelClass}>
              {t("account.email")}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder={t("account.emailPlaceholder")}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className={labelClass}>
              {t("account.password")}
            </label>
            <input
              id="password"
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
              className={inputClass}
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
            <label htmlFor="confirm-password" className={labelClass}>
              {t("account.confirmPassword")}
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className={primaryBtnClass}>
            {loading ? t("account.submitting") : t("account.submit")}
          </button>
        </form>
      )}

      {/* Step 2: MFA Setup */}
      {step === "mfa" && !showBackupCodes && mfaSetupData && (
        <div className="space-y-5">
          <p className="text-sm text-neutral-400">{t("mfa.description")}</p>

          <div className="flex justify-center">
            <div className="rounded-lg bg-white p-4">
              <QRCodeSVG value={mfaSetupData.qrCodeUrl} size={180} />
            </div>
          </div>

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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              {t("mfa.cantScan")}
            </button>
            {showSecret && (
              <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-950 p-3">
                <p className="mb-1 text-xs text-neutral-500">
                  {t("mfa.manualKey")}
                </p>
                <code className="break-all font-mono text-sm text-neutral-300">
                  {mfaSetupData.secret}
                </code>
              </div>
            )}
          </div>

          <form onSubmit={handleMfaConfirm} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="setup-code" className={labelClass}>
                {t("mfa.codeLabel")}
              </label>
              <input
                id="setup-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={setupCode}
                onChange={(e) =>
                  setSetupCode(e.target.value.replace(/\D/g, ""))
                }
                className={`${inputClass} text-center font-mono text-lg tracking-[0.5em]`}
                placeholder={t("mfa.codePlaceholder")}
                autoComplete="one-time-code"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading || setupCode.length !== 6}
              className={primaryBtnClass}
            >
              {loading ? t("mfa.submitting") : t("mfa.submit")}
            </button>
          </form>
        </div>
      )}

      {/* Step 2b: Backup codes */}
      {step === "mfa" && showBackupCodes && backupCodes.length > 0 && (
        <div className="space-y-5">
          <div className="rounded-md border border-amber-900/50 bg-amber-950/20 p-3">
            <p className="text-sm font-medium text-amber-400">
              {t("mfa.backupCodesHeading")}
            </p>
            <p className="mt-1 text-xs text-amber-500/80">
              {t("mfa.backupCodesWarning")}
            </p>
          </div>

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
              className={secondaryBtnClass}
            >
              {backupCodesCopied ? t("mfa.copied") : t("mfa.copyAll")}
            </button>
            <button
              type="button"
              onClick={handleBackupCodesAcknowledged}
              className="flex-1 rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
            >
              {t("mfa.savedCodes")}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Organisation */}
      {step === "organisation" && (
        <form onSubmit={handleOrgSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-neutral-400">
              {t("organisation.description")}
            </p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="org-name" className={labelClass}>
              {t("organisation.name")}
            </label>
            <input
              id="org-name"
              type="text"
              required
              value={orgName}
              onChange={(e) => handleOrgNameChange(e.target.value)}
              className={inputClass}
              placeholder={t("organisation.namePlaceholder")}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="org-slug" className={labelClass}>
              {t("organisation.slug")}
            </label>
            <input
              id="org-slug"
              type="text"
              required
              value={orgSlug}
              onChange={(e) => {
                setSlugManuallyEdited(true);
                setOrgSlug(e.target.value);
              }}
              className={inputClass}
              placeholder={t("organisation.slugPlaceholder")}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            />
            <p className="text-xs text-neutral-600">
              {t("errors.slugFormat")}
            </p>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !orgName || !orgSlug}
            className={primaryBtnClass}
          >
            {loading ? t("organisation.submitting") : t("organisation.submit")}
          </button>
        </form>
      )}

      {/* Step 4: Setup complete */}
      {step === "complete" && <SetupComplete />}
    </div>
  );
}

function SetupComplete() {
  const t = useTranslations("setup");

  useEffect(() => {
    const timer = setTimeout(() => {
      // Full reload to reset init cache in middleware
      window.location.href = "/admin/organisations";
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-5 text-center">
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
      <div>
        <p className="text-lg font-medium text-white">
          {t("complete.heading")}
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          {t("complete.description")}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          window.location.href = "/admin/organisations";
        }}
        className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
      >
        {t("complete.continue")}
      </button>
    </div>
  );
}
