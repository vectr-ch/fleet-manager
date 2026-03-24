import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { overlordFetch } from "@/lib/overlord";
import type { Org } from "@/lib/types";

export const orgRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return overlordFetch<Org>(`/orgs/${ctx.orgSlug}`, {
      accessToken: ctx.accessToken,
    });
  }),

  update: protectedProcedure
    .input(z.object({ name: z.string().min(1).optional() }))
    .mutation(async ({ ctx, input }) => {
      return overlordFetch<Org>(`/orgs/${ctx.orgSlug}`, {
        method: "PATCH",
        body: input,
        accessToken: ctx.accessToken,
      });
    }),

  list: protectedProcedure.query(async (): Promise<Org[]> => []),
});
