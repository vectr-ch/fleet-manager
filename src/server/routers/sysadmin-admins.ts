import { router, sysadminProcedure } from "@/server/trpc";
import { overlordFetch } from "@/lib/overlord";
import type { Sysadmin } from "@/lib/types";

export const sysadminAdminsRouter = router({
  list: sysadminProcedure.query(async ({ ctx }) => {
    return overlordFetch<Sysadmin[]>("/sysadmin/admins", {
      accessToken: ctx.accessToken,
    });
  }),
});
