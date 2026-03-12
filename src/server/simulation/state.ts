import type { Drone, Mission, Alert, Command, BaseStation, MeshLink, PastMission, MissionParameters, SystemMetrics, EnvironmentData, MeshNetworkHealth } from "@/lib/types";
import {
  createSeedDrones,
  createSeedMission,
  createSeedAlerts,
  createSeedCommands,
  createSeedBaseStations,
  createSeedMeshLinks,
  createSeedPastMissions,
  createSeedMissionParameters,
  createSeedSystemMetrics,
  createSeedEnvironment,
  createSeedMeshNetworkHealth,
} from "./seed";

export interface WorldState {
  drones: Drone[];
  mission: Mission;
  alerts: Alert[];
  commands: Command[];
  baseStations: BaseStation[];
  meshLinks: MeshLink[];
  pastMissions: PastMission[];
  missionParameters: MissionParameters;
  systemMetrics: SystemMetrics;
  environment: EnvironmentData;
  meshNetworkHealth: MeshNetworkHealth;
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
    pastMissions: createSeedPastMissions(),
    missionParameters: createSeedMissionParameters(),
    systemMetrics: createSeedSystemMetrics(),
    environment: createSeedEnvironment(),
    meshNetworkHealth: createSeedMeshNetworkHealth(),
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
