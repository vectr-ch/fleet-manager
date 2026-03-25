import { router, sysadminProcedure } from "@/server/trpc";
import { fmsFetch } from "@/lib/fms";
import type { Sysadmin } from "@/lib/types";

export const sysadminAdminsRouter = router({
  list: sysadminProcedure.query(async ({ ctx }) => {
    const res = await fmsFetch<{ admins: Sysadmin[] }>("/sysadmin/admins", {
      accessToken: ctx.accessToken,
    });
    return res.admins;
  }),
});
