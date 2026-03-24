import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import type { Mission } from "@/lib/types";

export const missionsRouter = router({
  list: protectedProcedure.query(async (): Promise<Mission[]> => []),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async (): Promise<Mission | null> => null),
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async (): Promise<Mission | null> => null),
  pause: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async () => ({ success: false })),
  resume: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async () => ({ success: false })),
  abort: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async () => ({ success: false })),
});
