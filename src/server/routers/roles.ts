import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { fmsFetch } from "@/lib/fms";
import type { Role } from "@/lib/types";

export const rolesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const res = await fmsFetch<{ roles: Role[] }>(`/orgs/${ctx.orgSlug}/roles`, {
      accessToken: ctx.accessToken,
    });
    return res.roles;
  }),

  permissions: protectedProcedure.query(async ({ ctx }) => {
    const res = await fmsFetch<{ permissions: string[] }>(`/orgs/${ctx.orgSlug}/roles/permissions`, {
      accessToken: ctx.accessToken,
    });
    return res.permissions;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        permissions: z.array(z.string()).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const res = await fmsFetch<{ role: Role }>(`/orgs/${ctx.orgSlug}/roles`, {
        method: "POST",
        body: input,
        accessToken: ctx.accessToken,
      });
      return res.role;
    }),
});
