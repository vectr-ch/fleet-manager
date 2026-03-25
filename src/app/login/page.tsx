"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { MfaSetup } from "@/components/auth/mfa-setup";
import { MfaVerify } from "@/components/auth/mfa-verify";
import type { OrgFromLogin } from "@/lib/types";

type LoginStep = "credentials" | "mfa-setup" | "mfa-verify";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>("credentials");

  const handleAuthComplete = (orgs?: OrgFromLogin[]) => {
    if (orgs && orgs.length > 1) {
      sessionStorage.setItem("pending_orgs", JSON.stringify(orgs));
      router.push("/select-org");
    } else {
      router.push("/overview");
    }
  };

  const handleMfaRequired = (setupRequired: boolean) => {
    setStep(setupRequired ? "mfa-setup" : "mfa-verify");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-neutral-800 bg-neutral-900 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">VECTR</h1>
          <p className="mt-1 text-sm text-neutral-500">Fleet Intelligence Platform</p>
        </div>

        {step === "credentials" && (
          <LoginForm onMfaRequired={handleMfaRequired} onSuccess={handleAuthComplete} />
        )}
        {step === "mfa-setup" && (
          <MfaSetup onSuccess={handleAuthComplete} />
        )}
        {step === "mfa-verify" && (
          <MfaVerify onSuccess={handleAuthComplete} />
        )}
      </div>
    </div>
  );
}
