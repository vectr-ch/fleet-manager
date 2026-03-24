import { router, protectedProcedure } from "@/server/trpc";
import type { SystemMetrics, EnvironmentData } from "@/lib/types";

export const telemetryRouter = router({
  systemMetrics: protectedProcedure.query(
    async (): Promise<SystemMetrics | null> => null
  ),
  environment: protectedProcedure.query(
    async (): Promise<EnvironmentData | null> => null
  ),
});
