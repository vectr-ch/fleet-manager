"use client";

import { useState, useEffect, useMemo } from "react";
import { SparklineChart } from "@/components/telemetry/sparkline-chart";
import { DroneSelector } from "@/components/telemetry/drone-selector";
import { StatsRow } from "@/components/telemetry/stats-row";
import { DroneDetailPanel } from "@/components/telemetry/drone-detail-panel";
import type { TelemetryFrame } from "@/lib/nats/types";
import type { TelemetryHistory } from "@/hooks/use-telemetry-stream";

// ── Simulated data ──────────────────────────────────────────────

const MOCK_DRONES = [
  { nodeId: "8969ce14-de66-4fd6-8d25-ee3577698028", baseId: "4c24b814-9387-43a8-b9b1-2ce71f68605f" },
  { nodeId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", baseId: "4c24b814-9387-43a8-b9b1-2ce71f68605f" },
  { nodeId: "deadbeef-cafe-4321-9876-543210fedcba", baseId: "bb11cc22-dd33-ee44-ff55-667788990011" },
];

const ORG_ID = "1684a636-9576-4c0d-b504-21310d39c9e5";
const HISTORY_SIZE = 60;

function randomWalk(prev: number, range: number, min: number, max: number): number {
  const next = prev + (Math.random() - 0.5) * range;
  return Math.max(min, Math.min(max, next));
}

function generateFrame(drone: typeof MOCK_DRONES[0], prev?: TelemetryFrame): TelemetryFrame {
  const alt = prev?.position?.altitudeM ?? 120;
  const bat = prev?.batteryPercent ?? 72;
  const roll = prev?.attitude?.rollDeg ?? 0;
  const pitch = prev?.attitude?.pitchDeg ?? 0;
  const yaw = prev?.attitude?.yawDeg ?? 180;
  const lat = prev?.position?.latitude ?? 46.9481;
  const lng = prev?.position?.longitude ?? 7.4474;
  const sats = prev?.gps?.satellites ?? 12;

  return {
    nodeId: drone.nodeId,
    orgId: ORG_ID,
    baseId: drone.baseId,
    timestampMs: Date.now(),
    attitude: {
      rollDeg: randomWalk(roll, 2, -15, 15),
      pitchDeg: randomWalk(pitch, 1.5, -10, 10),
      yawDeg: randomWalk(yaw, 5, 0, 360),
    },
    position: {
      latitude: randomWalk(lat, 0.0001, 46.94, 46.96),
      longitude: randomWalk(lng, 0.0001, 7.44, 7.46),
      altitudeM: randomWalk(alt, 3, 50, 200),
    },
    batteryVoltage: randomWalk(bat * 0.168, 0.1, 10, 16.8),
    batteryPercent: randomWalk(bat, 0.5, 10, 100),
    flightMode: "LOITER",
    armed: true,
    gps: {
      fixType: 3,
      satellites: Math.round(randomWalk(sats, 1, 6, 16)),
      hdop: randomWalk(1.2, 0.2, 0.5, 3.0),
    },
  };
}

function emptyHistory(): TelemetryHistory {
  return { altitude: [], battery: [], voltage: [], satellites: [] };
}

function pushHistory(h: TelemetryHistory, f: TelemetryFrame) {
  const push = (arr: number[], val: number) => {
    arr.push(val);
    if (arr.length > HISTORY_SIZE) arr.shift();
  };
  push(h.altitude, f.position?.altitudeM ?? 0);
  push(h.battery, f.batteryPercent);
  push(h.voltage, f.batteryVoltage);
  push(h.satellites, f.gps?.satellites ?? 0);
}

function averageHistory(histories: TelemetryHistory[]): TelemetryHistory {
  if (histories.length === 0) return emptyHistory();
  const len = Math.max(...histories.map((h) => h.altitude.length));
  const avg = (key: keyof TelemetryHistory) => {
    const result: number[] = [];
    for (let i = 0; i < len; i++) {
      let sum = 0;
      let count = 0;
      for (const h of histories) {
        if (i < h[key].length) { sum += h[key][i]; count++; }
      }
      result.push(count > 0 ? sum / count : 0);
    }
    return result;
  };
  return { altitude: avg("altitude"), battery: avg("battery"), voltage: avg("voltage"), satellites: avg("satellites") };
}

// ── Preview page (overview + detail) ────────────────────────────

export default function TelemetryPreview() {
  const [frames, setFrames] = useState<Map<string, TelemetryFrame>>(new Map());
  const [histories, setHistories] = useState<Map<string, TelemetryHistory>>(new Map());
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);
  const [detailDrone, setDetailDrone] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"telemetry" | "fleet">("fleet");

  useEffect(() => {
    const interval = setInterval(() => {
      setFrames((prev) => {
        const next = new Map(prev);
        for (const drone of MOCK_DRONES) {
          const prevFrame = prev.get(drone.nodeId);
          const frame = generateFrame(drone, prevFrame);
          next.set(drone.nodeId, frame);
        }
        return next;
      });
      setHistories((prev) => {
        const next = new Map(prev);
        for (const drone of MOCK_DRONES) {
          const h = next.get(drone.nodeId) ?? emptyHistory();
          // Use the latest frame from frames state
          const frame = generateFrame(drone);
          pushHistory(h, frame);
          next.set(drone.nodeId, { ...h });
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const droneIds = Array.from(frames.keys()).sort();
  const detailFrame = detailDrone ? frames.get(detailDrone) : null;
  const history = useMemo(() => {
    if (selectedDrone) return histories.get(selectedDrone) ?? emptyHistory();
    return averageHistory(droneIds.map((id) => histories.get(id) ?? emptyHistory()));
  }, [selectedDrone, droneIds, histories]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#080808] text-[#e8e8e8]">
      {/* Tab switcher */}
      <div className="shrink-0 flex border-b border-[#1a1a1a] bg-[#0f0f0f]">
        <button
          onClick={() => setActiveTab("fleet")}
          className={`flex-1 py-2.5 text-center font-mono text-[10px] tracking-wider uppercase border-b-2 transition-colors ${activeTab === "fleet" ? "text-foreground border-foreground" : "text-[#555] border-transparent hover:text-[#888]"}`}
        >
          Fleet (with detail panel)
        </button>
        <button
          onClick={() => setActiveTab("telemetry")}
          className={`flex-1 py-2.5 text-center font-mono text-[10px] tracking-wider uppercase border-b-2 transition-colors ${activeTab === "telemetry" ? "text-foreground border-foreground" : "text-[#555] border-transparent hover:text-[#888]"}`}
        >
          Telemetry (charts)
        </button>
      </div>

      {activeTab === "fleet" ? (
        /* ── Fleet view ── */
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-5 pt-4 pb-0 shrink-0">
            <h1 className="text-[15px] font-semibold text-white tracking-tight">Fleet</h1>
            <p className="font-mono text-[11px] text-[#555] mt-0.5">Click a drone to open the detail panel</p>
          </div>
          <div className="mt-4 flex-1 flex overflow-hidden">
            {/* Drone list */}
            <div className="flex-1 overflow-y-auto">
              {droneIds.map((id) => {
                const f = frames.get(id);
                if (!f) return null;
                return (
                  <button
                    key={id}
                    onClick={() => setDetailDrone(detailDrone === id ? null : id)}
                    className={`w-full flex items-center px-5 py-3 border-b border-[#1a1a1a] gap-3 hover:bg-[#0f0f0f] transition-colors cursor-pointer text-left ${detailDrone === id ? "bg-[#0f0f0f]" : ""}`}
                  >
                    <div className="w-[7px] h-[7px] rounded-full shrink-0 bg-fleet-green shadow-[0_0_4px_#22c55e88]" />
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[12px] font-medium text-neutral-200">{id.slice(0, 8)}…</span>
                      <div className="text-[10px] text-[#555] mt-0.5">SN-004{droneIds.indexOf(id) + 2} · {f.flightMode}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <div className="w-[28px] h-[4px] bg-[#252525] rounded-sm overflow-hidden">
                          <div
                            className={`h-full rounded-sm ${f.batteryPercent > 50 ? "bg-fleet-green" : f.batteryPercent > 20 ? "bg-fleet-amber" : "bg-fleet-red"}`}
                            style={{ width: `${f.batteryPercent}%` }}
                          />
                        </div>
                        <span className={f.batteryPercent > 50 ? "text-[#555]" : "text-fleet-amber"}>
                          {f.batteryPercent.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Detail panel */}
            {detailDrone && detailFrame && (
              <DroneDetailPanel
                nodeId={detailDrone}
                nodeName={detailDrone.slice(0, 8) + "…"}
                frame={detailFrame}
                onClose={() => setDetailDrone(null)}
              />
            )}
          </div>
        </div>
      ) : (
        /* ── Telemetry view ── */
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-5 pt-4 pb-0 shrink-0 flex items-start justify-between">
            <div>
              <h1 className="text-[15px] font-semibold text-white tracking-tight">Telemetry</h1>
              <p className="font-mono text-[11px] text-neutral-500 mt-0.5">Live drone telemetry streams (preview with simulated data)</p>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-fleet-green px-2 py-1 bg-fleet-green-dim border border-fleet-green/15 rounded-full mt-1">
              <div className="w-[5px] h-[5px] rounded-full bg-fleet-green animate-pulse" />
              Live (simulated)
            </div>
          </div>

          <div className="mt-4">
            <StatsRow frames={frames} />
          </div>

          <div className="px-5 py-2.5 border-b border-[#1a1a1a] flex items-center gap-3 shrink-0">
            <span className="font-mono text-[11px] text-neutral-500">Drone:</span>
            <DroneSelector droneIds={droneIds} selected={selectedDrone} onSelect={setSelectedDrone} />
          </div>

          <div className="flex-1 grid grid-cols-2 gap-px bg-[#1a1a1a] overflow-hidden">
            <SparklineChart data={history.altitude} label="Altitude" unit="m" color="#3b82f6" />
            <SparklineChart data={history.battery} label="Battery" unit="%" color="#22c55e" decimals={0} />
            <SparklineChart data={history.voltage} label="Voltage" unit="V" color="#f59e0b" decimals={1} />
            <SparklineChart data={history.satellites} label="GPS Satellites" unit="" color="#a78bfa" decimals={0} />
          </div>
        </div>
      )}
    </div>
  );
}
