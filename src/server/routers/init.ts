import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "@/server/trpc";
import { fmsFetch } from "@/lib/fms";
import { setSysadminChallengeCookie } from "@/lib/auth/sysadmin-cookies";
import type { LoginResponse } from "@/lib/types";

export const initRouter = router({
  status: publicProcedure.query(async () => {
    return fmsFetch<{ initialized: boolean }>("/init/status");
  }),

  setup: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const result = await fmsFetch<LoginResponse>("/init/setup", {
        method: "POST",
        body: input,
      });

      // Store the MFA setup challenge token in the same cookie used by the
      // normal sysadmin login flow. This allows the existing
      // sysadminAuth.mfaSetup / mfaConfirm mutations to work unchanged.
      if (result.mfa_challenge_token) {
        await setSysadminChallengeCookie(result.mfa_challenge_token);
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "setup_missing_challenge",
        });
      }

      return {
        mfa_required: result.mfa_required ?? true,
        setup_required: result.setup_required ?? true,
      };
    }),
});
