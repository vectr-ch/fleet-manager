import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, authOnlyProcedure } from "@/server/trpc";
import { overlordFetch } from "@/lib/overlord";
import { setCurrentOrg } from "@/lib/auth/cookies";
import type { Org } from "@/lib/types";

export const userAccountRouter = router({
  // Identity derived from JWT ctx.userId — no client-supplied userId.
  listOrgs: protectedProcedure
    .query(async ({ ctx }) => {
      return overlordFetch<Org[]>(`/users/${ctx.userId}/orgs`, {
        accessToken: ctx.accessToken,
      });
    }),

  updateDefaultOrg: protectedProcedure
    .input(z.object({ orgSlug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await overlordFetch(`/users/${ctx.userId}/default-org`, {
        method: "PATCH",
        body: { slug: input.orgSlug },
        accessToken: ctx.accessToken,
      });
      await setCurrentOrg(input.orgSlug);
      return result;
    }),

  changePassword: protectedProcedure
    .input(z.object({
      current_password: z.string(),
      new_password: z.string().min(8),
    }))
    .mutation(async ({ ctx, input }) => {
      return overlordFetch(`/users/${ctx.userId}/change-password`, {
        method: "POST",
        body: input,
        accessToken: ctx.accessToken,
      });
    }),

  // Fallback for /select-org when sessionStorage is absent (new tab, browser restore).
  listMyOrgs: authOnlyProcedure
    .query(async ({ ctx }) => {
      return overlordFetch<Org[]>(`/users/${ctx.userId}/orgs`, {
        accessToken: ctx.accessToken,
      });
    }),

  // Server-validates org membership before writing current_org cookie.
  selectOrg: authOnlyProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const orgs = await overlordFetch<Org[]>(`/users/${ctx.userId}/orgs`, {
        accessToken: ctx.accessToken,
      });
      if (!orgs.some((o) => o.slug === input.slug)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "not_member_of_org" });
      }
      await setCurrentOrg(input.slug);
      return { success: true };
    }),
});
