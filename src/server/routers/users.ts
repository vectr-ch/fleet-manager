import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { overlordFetch } from "@/lib/overlord";
import type { User } from "@/lib/types";

export const usersRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const res = await overlordFetch<{ users: User[] }>(`/orgs/${ctx.orgSlug}/users`, {
      accessToken: ctx.accessToken,
    });
    return res.users;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return overlordFetch<User>(`/orgs/${ctx.orgSlug}/users/${input.id}`, {
        accessToken: ctx.accessToken,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      return overlordFetch<User>(`/orgs/${ctx.orgSlug}/users/${id}`, {
        method: "PATCH",
        body,
        accessToken: ctx.accessToken,
      });
    }),
});
