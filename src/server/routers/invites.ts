import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "@/server/trpc";
import { overlordFetch } from "@/lib/overlord";
import type { Invite, CreateInviteResponse } from "@/lib/types";

export const invitesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const res = await overlordFetch<{ invites: Invite[] }>(`/orgs/${ctx.orgSlug}/invites`, {
      accessToken: ctx.accessToken,
    });
    return res.invites;
  }),

  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        role_id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return overlordFetch<CreateInviteResponse>(
        `/orgs/${ctx.orgSlug}/invites`,
        {
          method: "POST",
          body: input,
          accessToken: ctx.accessToken,
        }
      );
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return overlordFetch(`/orgs/${ctx.orgSlug}/invites/${input.id}`, {
        method: "DELETE",
        accessToken: ctx.accessToken,
      });
    }),

  accept: publicProcedure
    .input(
      z.object({
        token: z.string(),
        email: z.string().email(),
        password: z.string().min(8).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const body: Record<string, string> = {
        token: input.token,
        email: input.email,
      };
      if (input.password) {
        body.password = input.password;
      }
      return overlordFetch<{ message: string }>("/invites/accept", {
        method: "POST",
        body,
      });
    }),
});
