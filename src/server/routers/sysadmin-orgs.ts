import { z } from "zod";
import { router, sysadminProcedure } from "@/server/trpc";
import { fmsFetch } from "@/lib/fms";
import type { SysadminOrg, CreateOrgResponse, InviteAdminResponse, OrgMember } from "@/lib/types";

export const sysadminOrgsRouter = router({
  list: sysadminProcedure.query(async ({ ctx }) => {
    const res = await fmsFetch<{ orgs: SysadminOrg[] }>("/sysadmin/orgs", {
      accessToken: ctx.accessToken,
    });
    return res.orgs;
  }),

  get: sysadminProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return fmsFetch<SysadminOrg>(`/sysadmin/orgs/${input.slug}`, {
        accessToken: ctx.accessToken,
      });
    }),

  create: sysadminProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        name: z.string().min(1),
        plan: z.string().optional(),
        admin: z.object({ email: z.string().email() }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<CreateOrgResponse>("/sysadmin/orgs", {
        method: "POST",
        body: input,
        accessToken: ctx.accessToken,
      });
    }),

  update: sysadminProcedure
    .input(
      z.object({
        slug: z.string(),
        name: z.string().optional(),
        plan: z.string().optional(),
        max_nodes: z.number().optional(),
        max_bases: z.number().optional(),
        max_users: z.number().optional(),
        max_concurrent_missions: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { slug, ...body } = input;
      return fmsFetch<SysadminOrg>(`/sysadmin/orgs/${slug}`, {
        method: "PATCH",
        body,
        accessToken: ctx.accessToken,
      });
    }),

  deactivate: sysadminProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch(`/sysadmin/orgs/${input.slug}`, {
        method: "DELETE",
        accessToken: ctx.accessToken,
      });
    }),

  inviteAdmin: sysadminProcedure
    .input(z.object({ slug: z.string(), email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch<InviteAdminResponse>(
        `/sysadmin/orgs/${input.slug}/invite-admin`,
        {
          method: "POST",
          body: { email: input.email },
          accessToken: ctx.accessToken,
        }
      );
    }),

  listMembers: sysadminProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const res = await fmsFetch<{ members: OrgMember[] }>(
        `/sysadmin/orgs/${input.slug}/members`,
        { accessToken: ctx.accessToken },
      );
      return res.members;
    }),

  revokeInvite: sysadminProcedure
    .input(z.object({ slug: z.string(), inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return fmsFetch(`/sysadmin/orgs/${input.slug}/invites/${input.inviteId}`, {
        method: "DELETE",
        accessToken: ctx.accessToken,
      });
    }),
});
