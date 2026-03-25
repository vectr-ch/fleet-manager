import { router, sysadminProcedure } from "@/server/trpc";
import { overlordFetch } from "@/lib/overlord";
import type { Sysadmin } from "@/lib/types";

export const sysadminAdminsRouter = router({
  list: sysadminProcedure.query(async ({ ctx }) => {
    const res = await overlordFetch<{ admins: Sysadmin[] }>("/sysadmin/admins", {
      accessToken: ctx.accessToken,
    });
    return res.admins;
  }),
});
