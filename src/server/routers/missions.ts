import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { fmsFetch } from "@/lib/fms";
import type { Mission, MissionDetail, PreFlightReport, FleetAssignmentResult } from "@/lib/types";

export const missionsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const res = await fmsFetch<{ missions: Mission[] }>(`/orgs/${ctx.orgSlug}/missions`, {
      accessToken: ctx.accessToken,
    });
    return res.missions;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return fmsFetch<MissionDetail>(`/orgs/${ctx.orgSlug}/missions/${input.id}`, {
        accessToken: ctx.accessToken,
      });
    }),

  create: protectedProcedure
    .input(z.object({
      type: z.string(),
      mode: z.string().optional(),
      base_id: z.string().optional(),
      params: z.any().optional(),
      abort_action: z.any().optional(),
      drone_count: z.number().optional(),
      min_drone_count: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<Mission>(`/orgs/${ctx.orgSlug}/missions`, {
        method: "POST",
        body: input,
        accessToken: ctx.accessToken,
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      type: z.string().optional(),
      mode: z.string().optional(),
      base_id: z.string().optional(),
      params: z.any().optional(),
      abort_action: z.any().optional(),
      drone_count: z.number().optional(),
      min_drone_count: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      return fmsFetch<Mission>(`/orgs/${ctx.orgSlug}/missions/${id}`, {
        method: "PATCH",
        body,
        accessToken: ctx.accessToken,
      });
    }),

  submit: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<Mission>(`/orgs/${ctx.orgSlug}/missions/${input.id}/submit`, {
        method: "POST",
        accessToken: ctx.accessToken,
      });
    }),

  approve: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<Mission>(`/orgs/${ctx.orgSlug}/missions/${input.id}/approve`, {
        method: "POST",
        accessToken: ctx.accessToken,
      });
    }),

  reject: protectedProcedure
    .input(z.object({ id: z.string(), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<Mission>(`/orgs/${ctx.orgSlug}/missions/${input.id}/reject`, {
        method: "POST",
        body: { reason: input.reason },
        accessToken: ctx.accessToken,
      });
    }),

  activate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<{ mission: Mission; preflight_report: PreFlightReport }>(
        `/orgs/${ctx.orgSlug}/missions/${input.id}/activate`,
        { method: "POST", accessToken: ctx.accessToken }
      );
    }),

  complete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<Mission>(`/orgs/${ctx.orgSlug}/missions/${input.id}/complete`, {
        method: "POST",
        accessToken: ctx.accessToken,
      });
    }),

  abort: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<Mission>(`/orgs/${ctx.orgSlug}/missions/${input.id}/abort`, {
        method: "POST",
        accessToken: ctx.accessToken,
      });
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<Mission>(`/orgs/${ctx.orgSlug}/missions/${input.id}/cancel`, {
        method: "POST",
        accessToken: ctx.accessToken,
      });
    }),

  assignFleet: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<FleetAssignmentResult>(
        `/orgs/${ctx.orgSlug}/missions/${input.id}/assign-fleet`,
        { method: "POST", accessToken: ctx.accessToken }
      );
    }),

  generateWaypoints: protectedProcedure
    .input(z.object({
      id: z.string(),
      spacing_m: z.number(),
      altitude_m: z.number(),
      speed_ms: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      return fmsFetch<Mission>(`/orgs/${ctx.orgSlug}/missions/${id}/generate-waypoints`, {
        method: "POST",
        body,
        accessToken: ctx.accessToken,
      });
    }),

  assignNode: protectedProcedure
    .input(z.object({ id: z.string(), node_id: z.string(), role: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch(`/orgs/${ctx.orgSlug}/missions/${input.id}/nodes`, {
        method: "POST",
        body: { node_id: input.node_id, role: input.role },
        accessToken: ctx.accessToken,
      });
    }),

  removeNode: protectedProcedure
    .input(z.object({ id: z.string(), node_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch(`/orgs/${ctx.orgSlug}/missions/${input.id}/nodes/${input.node_id}`, {
        method: "DELETE",
        accessToken: ctx.accessToken,
      });
    }),
});
