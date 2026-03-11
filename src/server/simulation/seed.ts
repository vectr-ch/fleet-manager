import type { Drone, Mission, Alert, Command, BaseStation, MeshLink } from "@/lib/types";

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
    { id: "BASE-01", position: { lat: 32.240, lng: -110.932 }, status: "online", uplinkLatency: 14 },
  ];
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
