import { z } from "zod";
import { router, sysadminProcedure } from "@/server/trpc";
import { fmsFetch } from "@/lib/fms";
import type { Sysadmin, SysadminInviteResponse, SysadminResetUrlResponse } from "@/lib/types";

export const sysadminAdminsRouter = router({
  list: sysadminProcedure.query(async ({ ctx }) => {
    const res = await fmsFetch<{ admins: Sysadmin[] }>("/sysadmin/admins", {
      accessToken: ctx.accessToken,
    });
    return res.admins;
  }),

  invite: sysadminProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<SysadminInviteResponse>("/sysadmin/admins/invite", {
        method: "POST",
        body: { email: input.email },
        accessToken: ctx.accessToken,
      });
    }),

  adminResetPassword: sysadminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<SysadminResetUrlResponse>(
        `/sysadmin/admins/${input.id}/reset-password`,
        {
          method: "POST",
          accessToken: ctx.accessToken,
        }
      );
    }),
});
