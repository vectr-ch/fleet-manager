import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { getTokens, getCurrentOrg } from "@/lib/auth/cookies";
import { ensureValidToken, decodeJwtPayload } from "@/lib/auth/refresh";
import {
  getSysadminTokens,
  ensureSysadminValidToken,
} from "@/lib/auth/sysadmin-cookies";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        retryAfter:
          error.cause &&
          typeof error.cause === "object" &&
          "retryAfter" in error.cause
            ? (error.cause as { retryAfter: number }).retryAfter
            : undefined,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ next }) => {
  const tokens = await getTokens();
  const accessToken = await ensureValidToken(tokens);
  const orgSlug = await getCurrentOrg();

  if (!accessToken) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "unauthenticated" });
  }
  if (!orgSlug) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "no_org_selected" });
  }
  const { sub: userId } = decodeJwtPayload(accessToken);
  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "unauthenticated" });
  }
  return next({ ctx: { accessToken, orgSlug, userId } });
});

// TRUST BOUNDARY: use only for cross-org operations (listing orgs, selecting org, auth.me).
// All org-resource access must use protectedProcedure.
export const authOnlyProcedure = t.procedure.use(async ({ next }) => {
  const tokens = await getTokens();
  const accessToken = await ensureValidToken(tokens);
  if (!accessToken) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "unauthenticated" });
  }
  const { sub: userId } = decodeJwtPayload(accessToken);
  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "unauthenticated" });
  }
  return next({ ctx: { accessToken, orgSlug: null, userId } });
});

export const sysadminProcedure = t.procedure.use(async ({ next }) => {
  const tokens = await getSysadminTokens();
  const accessToken = await ensureSysadminValidToken(tokens);

  if (!accessToken) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "unauthenticated" });
  }
  return next({
    ctx: { accessToken, orgSlug: null },
  });
});
