import type { Drone, Mission, Alert, Command, BaseStation, MeshLink } from "@/lib/types";
import {
  createSeedDrones,
  createSeedMission,
  createSeedAlerts,
  createSeedCommands,
  createSeedBaseStations,
  createSeedMeshLinks,
} from "./seed";

export interface WorldState {
  drones: Drone[];
  mission: Mission;
  alerts: Alert[];
  commands: Command[];
  baseStations: BaseStation[];
  meshLinks: MeshLink[];
  tickCount: number;
}

function createInitialState(): WorldState {
  return {
    drones: createSeedDrones(),
    mission: createSeedMission(),
    alerts: createSeedAlerts(),
    commands: createSeedCommands(),
    baseStations: createSeedBaseStations(),
    meshLinks: createSeedMeshLinks(),
    tickCount: 0,
  };
}

// Singleton — survives hot reloads in dev via globalThis
const globalForState = globalThis as unknown as { worldState?: WorldState };
export const worldState: WorldState =
  globalForState.worldState ?? createInitialState();
globalForState.worldState = worldState;

export function resetState(): void {
  const fresh = createInitialState();
  Object.assign(worldState, fresh);
}
