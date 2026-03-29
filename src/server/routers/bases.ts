import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { fmsFetch } from "@/lib/fms";
import type { Base, IssueCertResponse } from "@/lib/types";

export const basesRouter = router({
  list: protectedProcedure
    .input(z.object({ includeDecommissioned: z.boolean().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const params = input?.includeDecommissioned ? "?include_decommissioned=true" : "";
      const res = await fmsFetch<{ bases: Base[] }>(`/orgs/${ctx.orgSlug}/bases${params}`, {
        accessToken: ctx.accessToken,
      });
      return res.bases;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return fmsFetch<Base>(`/orgs/${ctx.orgSlug}/bases/${input.id}`, {
        accessToken: ctx.accessToken,
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        lat: z.number().optional(),
        lng: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<Base>(`/orgs/${ctx.orgSlug}/bases`, {
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
        lat: z.number().optional(),
        lng: z.number().optional(),
        maintenance_mode: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      return fmsFetch<Base>(`/orgs/${ctx.orgSlug}/bases/${id}`, {
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
      return fmsFetch(`/orgs/${ctx.orgSlug}/bases/${input.id}/revoke-cert`, {
        method: "POST",
        body: input.reason ? { reason: input.reason } : {},
        accessToken: ctx.accessToken,
      });
    }),

  issueCert: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<IssueCertResponse>(
        `/orgs/${ctx.orgSlug}/bases/${input.id}/issue-cert`,
        {
          method: "POST",
          accessToken: ctx.accessToken,
        }
      );
    }),

  decommission: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch(`/orgs/${ctx.orgSlug}/bases/${input.id}/decommission`, {
        method: "POST",
        accessToken: ctx.accessToken,
      });
    }),

  recommission: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch(`/orgs/${ctx.orgSlug}/bases/${input.id}/recommission`, {
        method: "POST",
        accessToken: ctx.accessToken,
      });
    }),
});
