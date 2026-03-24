import { router, protectedProcedure } from "@/server/trpc";

export const overviewRouter = router({
  stats: protectedProcedure.query(async () => null),
  recentActivity: protectedProcedure.query(async () => []),
});
