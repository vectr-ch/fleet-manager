export interface TelemetryFrame {
  nodeId: string;
  orgId: string;
  baseId: string;
  timestampMs: number;
  attitude: {
    rollDeg: number;
    pitchDeg: number;
    yawDeg: number;
  } | null;
  position: {
    latitude: number;
    longitude: number;
    altitudeM: number;
  } | null;
  batteryVoltage: number;
  batteryPercent: number;
  flightMode: string;
  armed: boolean;
  gps: {
    fixType: number;
    satellites: number;
    hdop: number;
  } | null;
}

const FLIGHT_MODE_NAMES: Record<number, string> = {
  0: "UNSPECIFIED",
  1: "STABILIZE",
  2: "ACRO",
  3: "ALT_HOLD",
  4: "LOITER",
  5: "RTL",
  6: "LAND",
  7: "ANGLE",
  8: "HORIZON",
  9: "AUTO",
  10: "GUIDED",
  11: "NAV_POSHOLD",
  12: "NAV_WP",
  13: "NAV_RTH",
};

export function flightModeName(value: number): string {
  return FLIGHT_MODE_NAMES[value] ?? "UNKNOWN";
}
