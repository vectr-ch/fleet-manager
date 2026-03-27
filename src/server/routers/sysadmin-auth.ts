import { z } from "zod";
import { router, publicProcedure } from "@/server/trpc";
import { fmsFetch } from "@/lib/fms";
import {
  setSysadminAuthCookies,
  clearSysadminAuthCookies,
  clearSysadminChallengeCookie,
  getSysadminTokens,
  setSysadminChallengeCookie,
  getSysadminChallengeToken,
} from "@/lib/auth/sysadmin-cookies";
import type { LoginResponse, MFASetupResponse, MFAConfirmResponse } from "@/lib/types";

export const sysadminAuthRouter = router({
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const result = await fmsFetch<LoginResponse>("/sysadmin/login", {
        method: "POST",
        body: input,
      });

      if (result.mfa_required && result.mfa_challenge_token) {
        await setSysadminChallengeCookie(result.mfa_challenge_token);
        return {
          mfa_required: true,
          setup_required: result.setup_required ?? false,
        };
      }

      if (result.access_token) {
        await setSysadminAuthCookies(result);
        await clearSysadminChallengeCookie();
      }

      return { mfa_required: false, setup_required: false };
    }),

  mfaSetup: publicProcedure.mutation(async () => {
    const challengeToken = await getSysadminChallengeToken();
    if (!challengeToken) throw new Error("No MFA challenge token");

    return fmsFetch<MFASetupResponse>("/sysadmin/mfa/setup", {
      method: "POST",
      accessToken: challengeToken,
    });
  }),

  mfaConfirm: publicProcedure
    .input(z.object({ code: z.string().length(6) }))
    .mutation(async ({ input }) => {
      const challengeToken = await getSysadminChallengeToken();
      if (!challengeToken) throw new Error("No MFA challenge token");

      const result = await fmsFetch<MFAConfirmResponse>(
        "/sysadmin/mfa/confirm",
        {
          method: "POST",
          body: { code: input.code },
          accessToken: challengeToken,
        }
      );

      if (result.access_token) {
        await setSysadminAuthCookies(result);
        await clearSysadminChallengeCookie();
      }

      return { backup_codes: result.backup_codes };
    }),

  mfaVerify: publicProcedure
    .input(z.object({ code: z.string().min(6) }))
    .mutation(async ({ input }) => {
      const challengeToken = await getSysadminChallengeToken();
      if (!challengeToken) throw new Error("No MFA challenge token");

      const result = await fmsFetch<LoginResponse>("/sysadmin/mfa/verify", {
        method: "POST",
        body: { code: input.code, mfa_challenge_token: challengeToken },
      });

      if (result.access_token) {
        await setSysadminAuthCookies(result);
        await clearSysadminChallengeCookie();
      }

      return { success: true };
    }),

  refresh: publicProcedure.mutation(async () => {
    const { refreshToken } = await getSysadminTokens();
    if (!refreshToken) throw new Error("No refresh token");

    const result = await fmsFetch<LoginResponse>("/sysadmin/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
    });

    if (result.access_token) {
      await setSysadminAuthCookies(result);
    }

    return { success: true };
  }),

  logout: publicProcedure.mutation(async () => {
    const { refreshToken, accessToken } = await getSysadminTokens();

    if (refreshToken && accessToken) {
      try {
        await fmsFetch("/sysadmin/logout", {
          method: "POST",
          body: { refresh_token: refreshToken },
          accessToken,
        });
      } catch {
        // Ignore — clear cookies regardless
      }
    }

    await clearSysadminAuthCookies();
    return { success: true };
  }),
});
