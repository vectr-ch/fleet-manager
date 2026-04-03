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
});
