import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, authOnlyProcedure } from "@/server/trpc";
import { fmsFetch } from "@/lib/fms";
import { setCurrentOrg } from "@/lib/auth/cookies";
import { validatePassword } from "@/lib/password";
import type { Org } from "@/lib/types";

const userPasswordSchema = z.string().superRefine((password, ctx) => {
  const error = validatePassword(password);
  if (error) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
  }
});

export const userAccountRouter = router({
  // Identity derived from JWT ctx.userId — no client-supplied userId.
  listOrgs: protectedProcedure
    .query(async ({ ctx }) => {
      const res = await fmsFetch<{ orgs: Org[] }>(`/users/${ctx.userId}/orgs`, {
        accessToken: ctx.accessToken,
      });
      return res.orgs;
    }),

  updateDefaultOrg: protectedProcedure
    .input(
      z.object({
        orgId: z.string().uuid(),
        orgSlug: z.string(),
        orgName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the user is a member of the target org before patching.
      const res = await fmsFetch<{ orgs: Org[] }>(`/users/${ctx.userId}/orgs`, {
        accessToken: ctx.accessToken,
      });
      const matchedOrg = res.orgs.find((o) => o.id === input.orgId);
      if (!matchedOrg) {
        throw new TRPCError({ code: "FORBIDDEN", message: "not_member_of_org" });
      }

      const result = await fmsFetch(`/users/${ctx.userId}`, {
        method: "PATCH",
        body: { default_org_id: input.orgId },
        accessToken: ctx.accessToken,
      });
      await setCurrentOrg(input.orgSlug, input.orgName);
      return result;
    }),

  changePassword: protectedProcedure
    .input(z.object({
      current_password: z.string(),
      new_password: userPasswordSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch(`/users/${ctx.userId}/change-password`, {
        method: "POST",
        body: input,
        accessToken: ctx.accessToken,
      });
    }),

  // Fallback for /select-org when sessionStorage is absent (new tab, browser restore).
  listMyOrgs: authOnlyProcedure
    .query(async ({ ctx }) => {
      const res = await fmsFetch<{ orgs: Org[] }>(`/users/${ctx.userId}/orgs`, {
        accessToken: ctx.accessToken,
      });
      return res.orgs;
    }),

  // Server-validates org membership before writing current_org cookie.
  selectOrg: authOnlyProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const res = await fmsFetch<{ orgs: Org[] }>(`/users/${ctx.userId}/orgs`, {
        accessToken: ctx.accessToken,
      });
      const matchedOrg = res.orgs.find((o) => o.slug === input.slug);
      if (!matchedOrg) {
        throw new TRPCError({ code: "FORBIDDEN", message: "not_member_of_org" });
      }
      await setCurrentOrg(input.slug, matchedOrg.name);
      return { success: true };
    }),
});
