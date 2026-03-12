import type { Command, CommandType } from "@/lib/types";
import { worldState } from "./state";

const RTB_THRESHOLD = 15;
const BATTERY_DRAIN_RATE = 0.05;
const COVERAGE_RATE = 0.02;
let alertCounter = 100;
let cmdCounter = 100;

export function tick(): void {
  const { mission, drones, alerts } = worldState;

  if (mission.status !== "active") return;

  worldState.tickCount++;

  // Drift drones along scan lines
  for (const drone of drones) {
    if (drone.status === "rtb" || drone.status === "offline") continue;

    const i = drones.indexOf(drone);
    const t = worldState.tickCount * 0.02;
    drone.position = {
      lat: drone.position.lat + Math.cos(t + i * 1.1) * 0.00002,
      lng: drone.position.lng + Math.sin(t + i * 0.8) * 0.00003,
    };
  }

  // Drain batteries
  for (const drone of drones) {
    if (drone.status === "rtb" || drone.status === "offline") continue;

    drone.battery = Math.max(0, drone.battery - BATTERY_DRAIN_RATE);

    // Warning threshold
    if (drone.battery <= 25 && drone.status === "nominal") {
      drone.status = "warning";
      alerts.unshift({
        id: `ALT-${++alertCounter}`,
        severity: "warning",
        title: `${drone.id} Battery Low`,
        detail: `${Math.round(drone.battery)}% remaining · RTB threshold at ${RTB_THRESHOLD}%`,
        droneId: drone.id,
        timestamp: new Date(),
      });
    }

    // RTB threshold
    const currentStatus: string = drone.status;
    if (drone.battery <= RTB_THRESHOLD && currentStatus !== "rtb") {
      drone.status = "rtb";
      alerts.unshift({
        id: `ALT-${++alertCounter}`,
        severity: "critical",
        title: `${drone.id} Returning to Base`,
        detail: `Battery at ${Math.round(drone.battery)}% — automatic RTB initiated`,
        droneId: drone.id,
        timestamp: new Date(),
      });
    }
  }

  // Advance coverage
  if (mission.coverage < 100) {
    mission.coverage = Math.min(100, mission.coverage + COVERAGE_RATE);
  }

  // Update ETA
  const remaining = 100 - mission.coverage;
  mission.eta = Math.max(0, Math.round(remaining / (COVERAGE_RATE * 60)));

  // Recalculate formation integrity
  const activeDrones = drones.filter(
    (d) => d.status === "nominal" || d.status === "warning"
  );
  mission.formationIntegrity = drones.length === 0 ? 0 : Math.round(
    (activeDrones.length / drones.length) * 100
  );

  // Complete mission check
  if (mission.coverage >= 100) {
    mission.status = "complete";
    alerts.unshift({
      id: `ALT-${++alertCounter}`,
      severity: "info",
      title: "Mission Complete",
      detail: `${mission.id} — 100% coverage achieved`,
      timestamp: new Date(),
    });
  }
}

export function dispatchCommand(
  type: CommandType,
  target: string
): void {
  const { mission, drones, commands, alerts } = worldState;
  const cmd: Command = {
    id: `CMD-${++cmdCounter}`,
    type,
    target,
    state: "executing" as const,
    timestamp: new Date(),
  };
  commands.unshift(cmd);

  switch (type) {
    case "pause":
      mission.status = "paused";
      cmd.state = "completed";
      break;

    case "resume":
      if (mission.status === "paused") {
        mission.status = "active";
      }
      cmd.state = "completed";
      break;

    case "abort":
      mission.status = "aborted";
      cmd.state = "completed";
      alerts.unshift({
        id: `ALT-${++alertCounter}`,
        severity: "critical",
        title: "Mission ABORTED",
        detail: `${mission.id} aborted by operator`,
        timestamp: new Date(),
      });
      break;

    case "rtb": {
      const targets =
        target === "ALL"
          ? drones.filter((d) => d.status !== "offline")
          : drones.filter((d) => d.id === target);
      for (const d of targets) {
        d.status = "rtb";
      }
      cmd.state = "completed";
      break;
    }

    default:
      setTimeout(() => {
        cmd.state = "completed";
      }, 5000);
      break;
  }
}

// Start tick loop — singleton guard
const globalForEngine = globalThis as unknown as { engineStarted?: boolean };
if (!globalForEngine.engineStarted) {
  globalForEngine.engineStarted = true;
  setInterval(tick, 1000);
}
