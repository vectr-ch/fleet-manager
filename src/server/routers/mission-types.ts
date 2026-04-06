import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { fmsFetch } from "@/lib/fms";
import type { MissionType } from "@/lib/types";

export const missionTypesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const res = await fmsFetch<{ types: MissionType[] }>(`/orgs/${ctx.orgSlug}/mission-types`, {
      accessToken: ctx.accessToken,
    });
    return res.types;
  }),

  getByName: protectedProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      return fmsFetch<MissionType>(`/orgs/${ctx.orgSlug}/mission-types/${input.name}`, {
        accessToken: ctx.accessToken,
      });
    }),
});
