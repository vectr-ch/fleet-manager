import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { fmsFetch } from "@/lib/fms";
import type { OrgMember } from "@/lib/types";

export const membersRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const res = await fmsFetch<{ members: OrgMember[] }>(`/orgs/${ctx.orgSlug}/members`, {
      accessToken: ctx.accessToken,
    });
    return res.members;
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return fmsFetch<OrgMember>(`/orgs/${ctx.orgSlug}/members/${ctx.userId}`, {
      accessToken: ctx.accessToken,
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return fmsFetch<OrgMember>(`/orgs/${ctx.orgSlug}/members/${input.id}`, {
        accessToken: ctx.accessToken,
      });
    }),
});
