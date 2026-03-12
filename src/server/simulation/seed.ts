import type { Drone, Mission, Alert, Command, BaseStation, MeshLink, PastMission, MissionParameters, SystemMetrics, EnvironmentData, MeshNetworkHealth } from "@/lib/types";

export function createSeedDrones(): Drone[] {
  return [
    { id: "D-01", role: "coordinator", status: "nominal", position: { lat: 32.260, lng: -110.924 }, gridPos: { row: 1, col: 1 }, battery: 84, heading: 90 },
    { id: "D-02", role: "follower",    status: "nominal", position: { lat: 32.260, lng: -110.913 }, gridPos: { row: 1, col: 2 }, battery: 79, heading: 90 },
    { id: "D-03", role: "relay",       status: "nominal", position: { lat: 32.260, lng: -110.901 }, gridPos: { row: 1, col: 3 }, battery: 76, heading: 90 },
    { id: "D-04", role: "follower",    status: "nominal", position: { lat: 32.254, lng: -110.924 }, gridPos: { row: 2, col: 1 }, battery: 71, heading: 90 },
    { id: "D-05", role: "follower",    status: "nominal", position: { lat: 32.254, lng: -110.913 }, gridPos: { row: 2, col: 2 }, battery: 68, heading: 90 },
    { id: "D-06", role: "follower",    status: "nominal", position: { lat: 32.254, lng: -110.901 }, gridPos: { row: 2, col: 3 }, battery: 65, heading: 90 },
    { id: "D-07", role: "follower",    status: "warning", position: { lat: 32.248, lng: -110.920 }, gridPos: { row: 3, col: 1 }, battery: 22, heading: 90 },
    { id: "D-08", role: "follower",    status: "nominal", position: { lat: 32.248, lng: -110.908 }, gridPos: { row: 3, col: 2 }, battery: 61, heading: 90 },
  ];
}

export function createSeedMission(): Mission {
  return {
    id: "MISSION-241",
    name: "Area Surveillance",
    status: "active",
    coverage: 62,
    formation: "grid",
    formationIntegrity: 87,
    bounds: [
      { lat: 32.262, lng: -110.928 },
      { lat: 32.262, lng: -110.895 },
      { lat: 32.244, lng: -110.895 },
      { lat: 32.244, lng: -110.928 },
    ],
    eta: 18,
    baseId: "BASE-01",
  };
}

export function createSeedAlerts(): Alert[] {
  const now = Date.now();
  return [
    { id: "ALT-001", severity: "warning",  title: "D-07 Battery Critical",    detail: "22% remaining · RTB threshold at 15%",           droneId: "D-07", timestamp: new Date(now - 2 * 60_000) },
    { id: "ALT-002", severity: "info",     title: "Formation reconfigured",   detail: "Grid spacing adjusted for terrain",               timestamp: new Date(now - 8 * 60_000) },
    { id: "ALT-003", severity: "info",     title: "Mission ACTIVATED",        detail: "8 drones · Area Surveillance · Alpha-7",           timestamp: new Date(now - 24 * 60_000) },
  ];
}

export function createSeedCommands(): Command[] {
  const now = Date.now();
  return [
    { id: "CMD-001", type: "activate_mission", target: "ALL", state: "completed", timestamp: new Date(now - 24 * 60_000) },
    { id: "CMD-002", type: "set_formation",    target: "ALL", state: "completed", timestamp: new Date(now - 20 * 60_000) },
    { id: "CMD-003", type: "adjust_spacing",   target: "ALL", state: "executing", timestamp: new Date(now - 8 * 60_000) },
  ];
}

export function createSeedBaseStations(): BaseStation[] {
  return [
    {
      id: "BASE-01",
      position: { lat: 32.240, lng: -110.932 },
      status: "online",
      uplinkLatency: 14,
      firmware: "v2.4.2",
      antenna: "Omni-directional",
      signal: 88,
      lastMaintenance: "2026-03-08",
      connectedDrones: 8,
    },
    {
      id: "BASE-02",
      position: { lat: 32.255, lng: -110.910 },
      status: "online",
      uplinkLatency: 8,
      firmware: "v2.4.1",
      antenna: "Omni-directional",
      signal: 94,
      lastMaintenance: "2026-03-01",
      connectedDrones: 3,
    },
    {
      id: "BASE-03",
      position: { lat: 32.270, lng: -110.945 },
      status: "offline",
      uplinkLatency: 0,
      firmware: "v2.3.8",
      antenna: "Directional",
      signal: 0,
      lastMaintenance: "2026-02-15",
      connectedDrones: 0,
    },
  ];
}

export function createSeedPastMissions(): PastMission[] {
  return [
    { id: "MISSION-240", name: "Perimeter Scan",     status: "complete", coverage: 100, duration: "42m",     date: "2026-03-10" },
    { id: "MISSION-239", name: "Grid Survey North",  status: "complete", coverage: 98,  duration: "1h 12m",  date: "2026-03-09" },
    { id: "MISSION-238", name: "Emergency Search",   status: "aborted",  coverage: 34,  duration: "18m",     date: "2026-03-08" },
    { id: "MISSION-237", name: "Boundary Mapping",   status: "complete", coverage: 100, duration: "55m",     date: "2026-03-07" },
    { id: "MISSION-236", name: "Thermal Survey",     status: "complete", coverage: 95,  duration: "1h 03m",  date: "2026-03-06" },
  ];
}

export function createSeedMissionParameters(): MissionParameters {
  return {
    formation:   "Grid",
    spacing:     "12m",
    scanPattern: "Boustrophedon",
    altitude:    "45m AGL",
    overlapH:    "80%",
    overlapV:    "60%",
    gimbalAngle: "-90°",
    speed:       "8 m/s",
  };
}

export function createSeedSystemMetrics(): SystemMetrics {
  return {
    cpu:       23,
    memory:    41,
    bandwidth: "2.4 Mbps",
    packets:   "1.2M",
    errors:    0,
  };
}

export function createSeedEnvironment(): EnvironmentData {
  return {
    temp:       "18°C",
    humidity:   "45%",
    wind:       "12 km/h NW",
    visibility: "8.2 km",
    pressure:   "1013 hPa",
  };
}

export function createSeedMeshNetworkHealth(): MeshNetworkHealth {
  return {
    avgLatency: "12 ms",
    packetLoss: "0.02%",
  };
}

export function createSeedMeshLinks(): MeshLink[] {
  return [
    { from: "D-01", to: "D-02" },
    { from: "D-02", to: "D-03" },
    { from: "D-01", to: "D-04" },
    { from: "D-02", to: "D-05" },
    { from: "D-03", to: "D-06" },
    { from: "D-04", to: "D-05" },
    { from: "D-05", to: "D-06" },
    { from: "D-04", to: "D-07" },
    { from: "D-05", to: "D-08" },
    { from: "D-07", to: "D-08" },
  ];
}
