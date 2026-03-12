import { router, publicProcedure } from "../trpc";
import { worldState } from "../simulation/state";

export const telemetryRouter = router({
  systemMetrics: publicProcedure.query(() => worldState.systemMetrics),
  environment: publicProcedure.query(() => worldState.environment),
});
