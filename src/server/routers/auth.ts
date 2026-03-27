import { z } from "zod";
import { router, publicProcedure, authOnlyProcedure } from "@/server/trpc";
import { fmsFetch } from "@/lib/fms";
import {
  setAuthCookies,
  setChallengeCookie,
  clearAuthCookies,
  clearChallengeCookie,
  getTokens,
  getChallengeToken,
  setUserInfo,
  setCurrentOrg,
} from "@/lib/auth/cookies";
import type {
  LoginResponse,
  MFASetupResponse,
  MFAConfirmResponse,
  OrgFromLogin,
} from "@/lib/types";

async function handleLoginEnrichment(result: {
  user?: { id: string; email: string };
  organisations?: OrgFromLogin[];
}): Promise<{ orgs?: OrgFromLogin[] }> {
  if (result.user) {
    await setUserInfo(result.user.email);
  }

  const orgs = result.organisations ?? [];
  const defaultOrg = orgs.find((o) => o.is_default);
  const singleOrg = orgs.length === 1 ? orgs[0] : null;

  // Auto-selection: users with a default org or exactly one org bypass /select-org.
  // Only users with 2+ orgs and no default are sent to /select-org for manual selection.
  if (defaultOrg) {
    await setCurrentOrg(defaultOrg.slug, defaultOrg.name);
    return {};
  }
  if (singleOrg) {
    await setCurrentOrg(singleOrg.slug, singleOrg.name);
    return {};
  }
  if (orgs.length > 1) {
    return { orgs }; // client handles /select-org routing
  }
  // enrichment absent — let middleware handle
  return {};
}

export const authRouter = router({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const result = await fmsFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: input,
      });

      if (result.mfa_required && result.mfa_challenge_token) {
        await setChallengeCookie(result.mfa_challenge_token);
        return {
          mfa_required: true as const,
          setup_required: result.setup_required ?? false,
        };
      }

      if (result.access_token) {
        await setAuthCookies(result);
        const { orgs } = await handleLoginEnrichment(result);
        return { mfa_required: false as const, setup_required: false, orgs };
      }
      return { mfa_required: false as const, setup_required: false };
    }),

  mfaSetup: publicProcedure.mutation(async () => {
    const challengeToken = await getChallengeToken();
    if (!challengeToken) {
      throw new Error("No MFA challenge token");
    }

    return fmsFetch<MFASetupResponse>("/auth/mfa/setup", {
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

      const result = await fmsFetch<MFAConfirmResponse>(
        "/auth/mfa/confirm",
        {
          method: "POST",
          body: { code: input.code },
          accessToken: challengeToken,
        }
      );

      if (result.access_token) {
        await setAuthCookies(result);
        await clearChallengeCookie();
        const { orgs } = await handleLoginEnrichment(result);
        return { backup_codes: result.backup_codes, orgs };
      }
      return { backup_codes: result.backup_codes };
    }),

  mfaVerify: publicProcedure
    .input(z.object({ code: z.string().length(6).regex(/^\d{6}$/) }))
    .mutation(async ({ input }) => {
      const challengeToken = await getChallengeToken();
      if (!challengeToken) {
        throw new Error("No MFA challenge token");
      }

      const result = await fmsFetch<LoginResponse>("/auth/mfa/verify", {
        method: "POST",
        body: {
          code: input.code,
          mfa_challenge_token: challengeToken,
        },
      });

      if (result.access_token) {
        await setAuthCookies(result);
        await clearChallengeCookie();
        const { orgs } = await handleLoginEnrichment(result);
        return { success: true, orgs };
      }
      return { success: true };
    }),

  refresh: publicProcedure.mutation(async () => {
    const { refreshToken } = await getTokens();
    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    const result = await fmsFetch<LoginResponse>("/auth/refresh", {
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
        await fmsFetch("/auth/logout", {
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

  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      return fmsFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: input,
      });
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string().min(1),
        new_password: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      return fmsFetch<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: input,
      });
    }),

  me: authOnlyProcedure.query(async ({ ctx }) => {
    return { id: ctx.userId };
  }),
});
