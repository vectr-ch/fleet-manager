import { router, publicProcedure } from "../trpc";
import { dronesRouter } from "./drones";
import { missionsRouter } from "./missions";
import { alertsRouter } from "./alerts";
import { commandsRouter } from "./commands";
import { worldState } from "../simulation/state";

export const appRouter = router({
  drones: dronesRouter,
  missions: missionsRouter,
  alerts: alertsRouter,
  commands: commandsRouter,

  baseStations: publicProcedure.query(() => {
    return worldState.baseStations;
  }),

  meshLinks: publicProcedure.query(() => {
    return worldState.meshLinks;
  }),
});

export type AppRouter = typeof appRouter;
