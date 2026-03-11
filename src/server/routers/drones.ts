import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { worldState } from "../simulation/state";

export const dronesRouter = router({
  list: publicProcedure.query(() => {
    return worldState.drones;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const drone = worldState.drones.find((d) => d.id === input.id);
      if (!drone) throw new Error(`Drone ${input.id} not found`);
      return drone;
    }),
});
