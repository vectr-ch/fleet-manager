import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { overlordFetch } from "@/lib/overlord";
import type { Node } from "@/lib/types";

export const nodesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const res = await overlordFetch<{ nodes: Node[] }>(`/orgs/${ctx.orgSlug}/nodes`, {
      accessToken: ctx.accessToken,
    });
    return res.nodes;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return overlordFetch<Node>(`/orgs/${ctx.orgSlug}/nodes/${input.id}`, {
        accessToken: ctx.accessToken,
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        serial: z.string().optional(),
        base_id: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return overlordFetch<Node>(`/orgs/${ctx.orgSlug}/nodes`, {
        method: "POST",
        body: input,
        accessToken: ctx.accessToken,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        serial: z.string().optional(),
        base_id: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      return overlordFetch<Node>(`/orgs/${ctx.orgSlug}/nodes/${id}`, {
        method: "PATCH",
        body,
        accessToken: ctx.accessToken,
      });
    }),
});
