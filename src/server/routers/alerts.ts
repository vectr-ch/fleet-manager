import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { worldState } from "../simulation/state";

export const alertsRouter = router({
  list: publicProcedure.query(() => {
    return worldState.alerts;
  }),

  dismiss: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      worldState.alerts = worldState.alerts.filter((a) => a.id !== input.id);
    }),
});
