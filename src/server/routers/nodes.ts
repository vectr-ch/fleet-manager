import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { fmsFetch } from "@/lib/fms";
import type { Node, IssueCertResponse } from "@/lib/types";

export const nodesRouter = router({
  list: protectedProcedure
    .input(z.object({ includeDecommissioned: z.boolean().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const params = input?.includeDecommissioned ? "?include_decommissioned=true" : "";
      const res = await fmsFetch<{ nodes: Node[] }>(`/orgs/${ctx.orgSlug}/nodes${params}`, {
        accessToken: ctx.accessToken,
      });
      return res.nodes;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return fmsFetch<Node>(`/orgs/${ctx.orgSlug}/nodes/${input.id}`, {
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
      return fmsFetch<Node>(`/orgs/${ctx.orgSlug}/nodes`, {
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
      return fmsFetch<Node>(`/orgs/${ctx.orgSlug}/nodes/${id}`, {
        method: "PATCH",
        body,
        accessToken: ctx.accessToken,
      });
    }),

  revokeCert: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return fmsFetch(`/orgs/${ctx.orgSlug}/nodes/${input.id}/revoke-cert`, {
        method: "POST",
        body: input.reason ? { reason: input.reason } : {},
        accessToken: ctx.accessToken,
      });
    }),

  issueCert: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<IssueCertResponse>(
        `/orgs/${ctx.orgSlug}/nodes/${input.id}/issue-cert`,
        {
          method: "POST",
          accessToken: ctx.accessToken,
        }
      );
    }),

  decommission: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch(`/orgs/${ctx.orgSlug}/nodes/${input.id}/decommission`, {
        method: "POST",
        accessToken: ctx.accessToken,
      });
    }),

  recommission: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch(`/orgs/${ctx.orgSlug}/nodes/${input.id}/recommission`, {
        method: "POST",
        accessToken: ctx.accessToken,
      });
    }),
});
