import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { getTokens, getCurrentOrg } from "@/lib/auth/cookies";
import { ensureValidToken } from "@/lib/auth/refresh";
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
  // Read cookies lazily — only for protected routes, not public ones like login
  const tokens = await getTokens();
  const accessToken = await ensureValidToken(tokens);
  const orgSlug = await getCurrentOrg();

  if (!accessToken) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "unauthenticated" });
  }
  if (!orgSlug) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "no_org_selected" });
  }
  return next({
    ctx: {
      accessToken,
      orgSlug,
    },
  });
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
