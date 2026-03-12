import type { DroneStatus } from "@/lib/types";

// ── Status dot (bg + glow) ────────────────────────────────────────────────────

export const statusDotClass: Record<DroneStatus, string> = {
  nominal: "bg-fleet-green shadow-[0_0_4px_#22c55e88]",
  warning: "bg-fleet-amber shadow-[0_0_4px_#f59e0b88]",
  critical: "bg-fleet-red shadow-[0_0_4px_#ef444488]",
  rtb: "bg-fleet-amber shadow-[0_0_4px_#f59e0b88]",
  offline: "bg-muted",
} as const;

// ── Status text color ─────────────────────────────────────────────────────────

export const statusTextClass: Record<DroneStatus, string> = {
  nominal: "text-fleet-green",
  warning: "text-fleet-amber",
  critical: "text-fleet-red",
  rtb: "text-fleet-amber",
  offline: "text-muted-foreground",
} as const;

// ── Status background tint ────────────────────────────────────────────────────

export const statusBgClass: Record<DroneStatus, string> = {
  nominal: "",
  warning: "bg-fleet-amber/[0.03]",
  critical: "bg-fleet-red/[0.03]",
  rtb: "bg-fleet-amber/[0.02]",
  offline: "",
} as const;

// ── Battery color ─────────────────────────────────────────────────────────────

export function getBatteryColor(battery: number): { bar: string; text: string } {
  if (battery > 50) return { bar: "bg-fleet-green", text: "text-fleet-green" };
  if (battery > 25) return { bar: "bg-fleet-amber", text: "text-fleet-amber" };
  return { bar: "bg-fleet-red", text: "text-fleet-red" };
}

// ── Heading to compass direction ──────────────────────────────────────────────

export function headingToCompass(heading: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
  return dirs[Math.round(heading / 45) % 8] ?? "N";
}

// ── Coordinate formatter ──────────────────────────────────────────────────────

export function formatCoord(value: number, decimals = 4): string {
  return value.toFixed(decimals);
}
