import { router, publicProcedure } from "../trpc";
import { worldState } from "../simulation/state";
import { dispatchCommand } from "../simulation/engine";

export const missionsRouter = router({
  active: publicProcedure.query(() => {
    return worldState.mission;
  }),

  history: publicProcedure.query(() => worldState.pastMissions),

  parameters: publicProcedure.query(() => worldState.missionParameters),

  pause: publicProcedure.mutation(() => {
    dispatchCommand("pause", "ALL");
    return worldState.mission;
  }),

  resume: publicProcedure.mutation(() => {
    dispatchCommand("resume", "ALL");
    return worldState.mission;
  }),

  abort: publicProcedure.mutation(() => {
    dispatchCommand("abort", "ALL");
    return worldState.mission;
  }),
});
