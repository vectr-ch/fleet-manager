import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { overlordFetch } from "@/lib/overlord";
import { setCurrentOrg } from "@/lib/auth/cookies";
import type { Org } from "@/lib/types";

export const userAccountRouter = router({
  listOrgs: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return overlordFetch<Org[]>(`/users/${input.userId}/orgs`, {
        accessToken: ctx.accessToken,
      });
    }),

  updateDefaultOrg: protectedProcedure
    .input(z.object({ userId: z.string(), orgSlug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await setCurrentOrg(input.orgSlug);
      return overlordFetch(`/users/${input.userId}/default-org`, {
        method: "PATCH",
        body: { slug: input.orgSlug },
        accessToken: ctx.accessToken,
      });
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        current_password: z.string(),
        new_password: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, ...body } = input;
      return overlordFetch(`/users/${userId}/change-password`, {
        method: "POST",
        body,
        accessToken: ctx.accessToken,
      });
    }),
});
