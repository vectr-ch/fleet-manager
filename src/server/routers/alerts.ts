import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import type { Alert } from "@/lib/types";

export const alertsRouter = router({
  list: protectedProcedure.query(async (): Promise<Alert[]> => []),
  dismiss: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async () => ({ success: false })),
});
