import { z } from "zod";

// ─── Organisation (login subset) ─────────────────────────────
// Defined before Auth schemas because loginResponseSchema and
// mfaConfirmResponseSchema reference it.
export const orgFromLoginSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  is_default: z.boolean(),
});
export type OrgFromLogin = z.infer<typeof orgFromLoginSchema>;

// ─── Auth ────────────────────────────────────────────────────
export const loginResponseSchema = z.object({
  access_token: z.string().optional(),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  refresh_token_ttl: z.number().optional(),
  mfa_required: z.boolean().optional(),
  mfa_challenge_token: z.string().optional(),
  setup_required: z.boolean().optional(),
  user: z.object({ id: z.string(), email: z.string() }).optional(),
  organisations: z.array(orgFromLoginSchema).optional(),
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const mfaSetupResponseSchema = z.object({
  qr_uri: z.string(),
  secret: z.string(),
});
export type MFASetupResponse = z.infer<typeof mfaSetupResponseSchema>;

export const mfaConfirmResponseSchema = z.object({
  backup_codes: z.array(z.string()),
  access_token: z.string().optional(),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  refresh_token_ttl: z.number().optional(),
  user: z.object({ id: z.string(), email: z.string() }).optional(),
  organisations: z.array(orgFromLoginSchema).optional(),
});
export type MFAConfirmResponse = z.infer<typeof mfaConfirmResponseSchema>;

// ─── Error ───────────────────────────────────────────────────
export const errorResponseSchema = z.object({
  error: z.string(),
  request_id: z.string().optional(),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// ─── Organisation ────────────────────────────────────────────
export const orgSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  plan: z.string().optional(),
  max_nodes: z.number().optional(),
  max_bases: z.number().optional(),
  max_users: z.number().optional(),
  max_concurrent_missions: z.number().optional(),
});
export type Org = z.infer<typeof orgSchema>;

// ─── User ────────────────────────────────────────────────────
export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  mfa_enabled: z.boolean(),
  created_at: z.string(),
});
export type User = z.infer<typeof userSchema>;

// ─── Base ────────────────────────────────────────────────────
export const baseSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  status: z.string(),
  maintenance_mode: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Base = z.infer<typeof baseSchema>;

// ─── Node ────────────────────────────────────────────────────
export const nodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  serial: z.string().optional(),
  base_id: z.string().optional(),
  firmware_version: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Node = z.infer<typeof nodeSchema>;

// ─── Invite ──────────────────────────────────────────────────
export const inviteSchema = z.object({
  id: z.string(),
  email: z.string(),
  role_id: z.string(),
  expires_at: z.string(),
  created_at: z.string(),
});
export type Invite = z.infer<typeof inviteSchema>;

export const createInviteResponseSchema = z.object({
  invite: inviteSchema,
  token: z.string(),
});
export type CreateInviteResponse = z.infer<typeof createInviteResponseSchema>;

// ─── Missions ───────────────────────────────────────────────

export const missionStatusSchema = z.enum([
  "draft", "planned", "approved", "activating", "active",
  "completing", "completed", "aborting", "aborted", "canceled",
]);
export type MissionStatus = z.infer<typeof missionStatusSchema>;

export const missionSchema = z.object({
  id: z.string(),
  type: z.string(),
  mode: z.string(),
  status: missionStatusSchema,
  base_id: z.string().nullable().optional(),
  drone_count: z.number().nullable().optional(),
  min_drone_count: z.number().nullable().optional(),
  params: z.any().optional(),
  waypoints: z.any().optional(),
  abort_action: z.any().optional(),
  created_by: z.string(),
  approved_by: z.string().nullable().optional(),
  activated_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Mission = z.infer<typeof missionSchema>;

export const missionNodeSchema = z.object({
  mission_id: z.string(),
  node_id: z.string(),
  role: z.string().nullable().optional(),
  assigned_at: z.string(),
});
export type MissionNode = z.infer<typeof missionNodeSchema>;

export const missionEventSchema = z.object({
  id: z.string(),
  mission_id: z.string(),
  from_status: z.string().nullable().optional(),
  to_status: z.string(),
  actor_id: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  created_at: z.string(),
});
export type MissionEvent = z.infer<typeof missionEventSchema>;

export const missionDetailSchema = z.object({
  mission: missionSchema,
  nodes: z.array(missionNodeSchema),
  events: z.array(missionEventSchema),
});
export type MissionDetail = z.infer<typeof missionDetailSchema>;

export const missionTypeSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  description: z.string(),
  params_schema: z.any(),
  default_abort_action: z.any(),
  icon: z.string().nullable().optional(),
  enabled: z.boolean(),
  sort_order: z.number(),
});
export type MissionType = z.infer<typeof missionTypeSchema>;

export const preFlightCheckSchema = z.object({
  name: z.string(),
  passed: z.boolean(),
  detail: z.string(),
});

export const preFlightReportSchema = z.object({
  passed: z.boolean(),
  checks: z.array(preFlightCheckSchema),
});
export type PreFlightReport = z.infer<typeof preFlightReportSchema>;

export const fleetAssignmentResultSchema = z.object({
  assigned_nodes: z.array(missionNodeSchema),
  total_pool: z.number(),
  healthy_pool: z.number(),
});
export type FleetAssignmentResult = z.infer<typeof fleetAssignmentResultSchema>;

export const alertSeveritySchema = z.enum(["info", "warning", "critical"]);

export const alertSchema = z.object({
  id: z.string(),
  severity: alertSeveritySchema,
  title: z.string(),
  detail: z.string().optional(),
  node_id: z.string().optional(),
  created_at: z.string(),
});
export type Alert = z.infer<typeof alertSchema>;

export const systemMetricsSchema = z.object({
  cpu: z.number(),
  memory: z.number(),
  bandwidth: z.number(),
  packets: z.number(),
  errors: z.number(),
});
export type SystemMetrics = z.infer<typeof systemMetricsSchema>;

export const environmentDataSchema = z.object({
  temp: z.number(),
  humidity: z.number(),
  wind: z.number(),
  visibility: z.number(),
  pressure: z.number(),
});
export type EnvironmentData = z.infer<typeof environmentDataSchema>;

export const auditEntrySchema = z.object({
  id: z.string(),
  action: z.string(),
  user_id: z.string(),
  resource: z.string(),
  created_at: z.string(),
});
export type AuditEntry = z.infer<typeof auditEntrySchema>;

// ─── Sysadmin ────────────────────────────────────────────────
export const sysadminOrgSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  plan: z.string(),
  max_nodes: z.number(),
  max_bases: z.number(),
  max_users: z.number(),
  max_concurrent_missions: z.number(),
  deleted_at: z.string().nullable(),
});
export type SysadminOrg = z.infer<typeof sysadminOrgSchema>;

export const createOrgResponseSchema = z.object({
  organisation: sysadminOrgSchema,
  invite_token: z.string().optional(),
});
export type CreateOrgResponse = z.infer<typeof createOrgResponseSchema>;

export const inviteAdminResponseSchema = z.object({
  invite: inviteSchema,
  invite_token: z.string(),
});
export type InviteAdminResponse = z.infer<typeof inviteAdminResponseSchema>;

export const sysadminSchema = z.object({
  id: z.string(),
  email: z.string(),
  mfa_enabled: z.boolean(),
  created_by: z.string().optional(),
});
export type Sysadmin = z.infer<typeof sysadminSchema>;
