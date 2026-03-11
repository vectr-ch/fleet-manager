import { z } from "zod";

// ── Position ──
export const positionSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});
export type Position = z.infer<typeof positionSchema>;

// ── Grid position ──
export const gridPosSchema = z.object({
  row: z.number(),
  col: z.number(),
});
export type GridPos = z.infer<typeof gridPosSchema>;

// ── Drone ──
export const droneRoleSchema = z.enum(["coordinator", "follower", "relay"]);
export type DroneRole = z.infer<typeof droneRoleSchema>;

export const droneStatusSchema = z.enum([
  "nominal",
  "warning",
  "critical",
  "rtb",
  "offline",
]);
export type DroneStatus = z.infer<typeof droneStatusSchema>;

export const droneSchema = z.object({
  id: z.string(),
  role: droneRoleSchema,
  status: droneStatusSchema,
  position: positionSchema,
  gridPos: gridPosSchema,
  battery: z.number().min(0).max(100),
  heading: z.number(),
});
export type Drone = z.infer<typeof droneSchema>;

// ── Mission ──
export const missionStatusSchema = z.enum([
  "active",
  "paused",
  "aborted",
  "complete",
]);
export type MissionStatus = z.infer<typeof missionStatusSchema>;

export const formationTypeSchema = z.enum(["grid", "line", "orbit"]);
export type FormationType = z.infer<typeof formationTypeSchema>;

export const missionSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: missionStatusSchema,
  coverage: z.number().min(0).max(100),
  formation: formationTypeSchema,
  formationIntegrity: z.number().min(0).max(100),
  bounds: z.array(positionSchema).min(4).max(4),
  eta: z.number(),
  baseId: z.string(),
});
export type Mission = z.infer<typeof missionSchema>;

// ── Alert ──
export const alertSeveritySchema = z.enum(["info", "warning", "critical"]);
export type AlertSeverity = z.infer<typeof alertSeveritySchema>;

export const alertSchema = z.object({
  id: z.string(),
  severity: alertSeveritySchema,
  title: z.string(),
  detail: z.string(),
  droneId: z.string().optional(),
  timestamp: z.date(),
});
export type Alert = z.infer<typeof alertSchema>;

// ── Command ──
export const commandTypeSchema = z.enum([
  "pause",
  "resume",
  "rtb",
  "goto",
  "orbit",
  "abort",
  "activate_mission",
  "set_formation",
  "adjust_spacing",
]);
export type CommandType = z.infer<typeof commandTypeSchema>;

export const commandStateSchema = z.enum([
  "pending",
  "executing",
  "completed",
  "failed",
]);
export type CommandState = z.infer<typeof commandStateSchema>;

export const commandSchema = z.object({
  id: z.string(),
  type: commandTypeSchema,
  target: z.string(),
  state: commandStateSchema,
  timestamp: z.date(),
});
export type Command = z.infer<typeof commandSchema>;

// ── Base Station ──
export const baseStationSchema = z.object({
  id: z.string(),
  position: positionSchema,
  status: z.enum(["online", "offline"]),
  uplinkLatency: z.number(),
});
export type BaseStation = z.infer<typeof baseStationSchema>;

// ── Mesh link ──
export const meshLinkSchema = z.object({
  from: z.string(),
  to: z.string(),
});
export type MeshLink = z.infer<typeof meshLinkSchema>;
