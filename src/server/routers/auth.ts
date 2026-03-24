import { z } from "zod";
import { router, publicProcedure } from "@/server/trpc";
import { overlordFetch } from "@/lib/overlord";
import {
  setAuthCookies,
  setChallengeCookie,
  clearAuthCookies,
  getTokens,
  getChallengeToken,
} from "@/lib/auth/cookies";
import type {
  LoginResponse,
  MFASetupResponse,
  MFAConfirmResponse,
} from "@/lib/types";

export const authRouter = router({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const result = await overlordFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: input,
      });

      if (result.mfa_required && result.mfa_challenge_token) {
        await setChallengeCookie(result.mfa_challenge_token);
        return {
          mfa_required: true,
          setup_required: result.setup_required ?? false,
        };
      }

      if (result.access_token) {
        await setAuthCookies(result);
      }

      return { mfa_required: false, setup_required: false };
    }),

  mfaSetup: publicProcedure.mutation(async () => {
    const challengeToken = await getChallengeToken();
    if (!challengeToken) {
      throw new Error("No MFA challenge token");
    }

    return overlordFetch<MFASetupResponse>("/auth/mfa/setup", {
      method: "POST",
      accessToken: challengeToken,
    });
  }),

  mfaConfirm: publicProcedure
    .input(z.object({ code: z.string().length(6) }))
    .mutation(async ({ input }) => {
      const challengeToken = await getChallengeToken();
      if (!challengeToken) {
        throw new Error("No MFA challenge token");
      }

      const result = await overlordFetch<MFAConfirmResponse>(
        "/auth/mfa/confirm",
        {
          method: "POST",
          body: { code: input.code },
          accessToken: challengeToken,
        }
      );

      if (result.access_token) {
        await setAuthCookies(result);
      }

      return { backup_codes: result.backup_codes };
    }),

  mfaVerify: publicProcedure
    .input(z.object({ code: z.string().min(6) }))
    .mutation(async ({ input }) => {
      const challengeToken = await getChallengeToken();
      if (!challengeToken) {
        throw new Error("No MFA challenge token");
      }

      const result = await overlordFetch<LoginResponse>("/auth/mfa/verify", {
        method: "POST",
        body: {
          code: input.code,
          mfa_challenge_token: challengeToken,
        },
      });

      if (result.access_token) {
        await setAuthCookies(result);
      }

      return { success: true };
    }),

  refresh: publicProcedure.mutation(async () => {
    const { refreshToken } = await getTokens();
    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    const result = await overlordFetch<LoginResponse>("/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
    });

    if (result.access_token) {
      await setAuthCookies(result);
    }

    return { success: true };
  }),

  logout: publicProcedure.mutation(async () => {
    const { refreshToken, accessToken } = await getTokens();

    if (refreshToken && accessToken) {
      try {
        await overlordFetch("/auth/logout", {
          method: "POST",
          body: { refresh_token: refreshToken },
          accessToken,
        });
      } catch {
        // Ignore — we clear cookies regardless
      }
    }

    await clearAuthCookies();
    return { success: true };
  }),
});
