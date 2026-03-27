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

// ─── MFA / Passkey ──────────────────────────────────────────
export const mfaStatusSchema = z.object({
  totp_enabled: z.boolean(),
  totp_created_at: z.string().nullable(),
  backup_codes_remaining: z.number(),
  passkey_count: z.number(),
});
export type MFAStatus = z.infer<typeof mfaStatusSchema>;

export const passkeyInfoSchema = z.object({
  id: z.string(),
  label: z.string(),
  device_type: z.string(),
  backed_up: z.boolean(),
  created_at: z.string(),
  last_used_at: z.string().nullable(),
});
export type PasskeyInfo = z.infer<typeof passkeyInfoSchema>;

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

// ─── Base ────────────────────────────────────────────────────
export const baseSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  status: z.string(),
  maintenance_mode: z.boolean(),
  enrolled_at: z.string().optional(),
  cert_expires_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Base = z.infer<typeof baseSchema>;

export const createBaseResponseSchema = z.object({
  base: baseSchema,
  provisioning_token: z.string(),
});
export type CreateBaseResponse = z.infer<typeof createBaseResponseSchema>;

// ─── Node ────────────────────────────────────────────────────
export const nodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  serial: z.string().optional(),
  base_id: z.string().optional(),
  firmware_version: z.string().optional(),
  enrolled_at: z.string().optional(),
  cert_expires_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Node = z.infer<typeof nodeSchema>;

export const createNodeResponseSchema = z.object({
  node: nodeSchema,
  provisioning_token: z.string(),
});
export type CreateNodeResponse = z.infer<typeof createNodeResponseSchema>;

export const regenerateTokenResponseSchema = z.object({
  provisioning_token: z.string(),
});
export type RegenerateTokenResponse = z.infer<typeof regenerateTokenResponseSchema>;

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

// ─── Stubbed types (M3 — define contracts now) ──────────────

export const missionStatusSchema = z.enum([
  "planned",
  "active",
  "paused",
  "aborted",
  "complete",
]);

export const missionSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: missionStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});
export type Mission = z.infer<typeof missionSchema>;

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

// ─── Sysadmin Invite / Reset ─────────────────────────────────
export const sysadminInviteResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  invite_url: z.string(),
});
export type SysadminInviteResponse = z.infer<typeof sysadminInviteResponseSchema>;

export const sysadminResetUrlResponseSchema = z.object({
  reset_url: z.string(),
});
export type SysadminResetUrlResponse = z.infer<typeof sysadminResetUrlResponseSchema>;

export const sysadminTokenRedeemResponseSchema = z.object({
  email: z.string(),
});
export type SysadminTokenRedeemResponse = z.infer<typeof sysadminTokenRedeemResponseSchema>;

export const sysadminResetVerifyResponseSchema = z.object({
  reset_token: z.string(),
});
export type SysadminResetVerifyResponse = z.infer<typeof sysadminResetVerifyResponseSchema>;

// ─── Org Member (sysadmin view) ─────────────────────────────
export const orgMemberSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
  status: z.enum(["active", "pending"]),
  mfa_enabled: z.boolean(),
  created_at: z.string(),
});
export type OrgMember = z.infer<typeof orgMemberSchema>;
