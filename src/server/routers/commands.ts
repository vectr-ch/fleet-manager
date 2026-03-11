import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { worldState } from "../simulation/state";
import { dispatchCommand } from "../simulation/engine";
import { commandTypeSchema } from "@/lib/types";

export const commandsRouter = router({
  dispatch: publicProcedure
    .input(
      z.object({
        type: commandTypeSchema,
        target: z.string().default("ALL"),
      })
    )
    .mutation(({ input }) => {
      dispatchCommand(input.type, input.target);
      return worldState.commands[0];
    }),

  log: publicProcedure.query(() => {
    return worldState.commands.slice(0, 20);
  }),
});
