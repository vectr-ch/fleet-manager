"use client";

import { useState } from "react";
import { useTelemetryStream } from "@/hooks/use-telemetry-stream";
import { SparklineChart } from "@/components/telemetry/sparkline-chart";
import { DroneSelector } from "@/components/telemetry/drone-selector";
import { StatsRow } from "@/components/telemetry/stats-row";
import type { TelemetryHistory } from "@/hooks/use-telemetry-stream";

function averageHistory(
  histories: TelemetryHistory[]
): TelemetryHistory {
  if (histories.length === 0)
    return { altitude: [], battery: [], voltage: [], satellites: [] };
  const len = Math.max(...histories.map((h) => h.altitude.length));
  const avg = (key: keyof TelemetryHistory) => {
    const result: number[] = [];
    for (let i = 0; i < len; i++) {
      let sum = 0;
      let count = 0;
      for (const h of histories) {
        if (i < h[key].length) {
          sum += h[key][i];
          count++;
        }
      }
      result.push(count > 0 ? sum / count : 0);
    }
    return result;
  };
  return {
    altitude: avg("altitude"),
    battery: avg("battery"),
    voltage: avg("voltage"),
    satellites: avg("satellites"),
  };
}

export default function TelemetryPage() {
  const { frames, droneIds, status, getHistory } = useTelemetryStream();
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);

  const history = selectedDrone
    ? getHistory(selectedDrone)
    : averageHistory(droneIds.map((id) => getHistory(id)));

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-0 shrink-0 flex items-start justify-between">
        <div>
          <h1 className="text-[15px] font-semibold text-white tracking-tight">
            Telemetry
          </h1>
          <p className="font-mono text-[11px] text-neutral-500 mt-0.5">
            Live drone telemetry streams
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {status === "connected" ? (
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-fleet-green px-2 py-1 bg-fleet-green-dim border border-fleet-green/15 rounded-full">
              <div className="w-[5px] h-[5px] rounded-full bg-fleet-green animate-pulse" />
              Live
            </div>
          ) : status === "connecting" ? (
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-fleet-amber px-2 py-1 bg-fleet-amber-dim border border-fleet-amber/15 rounded-full">
              <div className="w-[5px] h-[5px] rounded-full bg-fleet-amber animate-pulse" />
              Connecting
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-fleet-red px-2 py-1 bg-fleet-red-dim border border-fleet-red/15 rounded-full">
              <div className="w-[5px] h-[5px] rounded-full bg-fleet-red" />
              Disconnected
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4">
        <StatsRow frames={frames} />
      </div>

      {droneIds.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
          <span className="font-mono text-[13px] text-neutral-400">
            No drones reporting
          </span>
          <span className="font-mono text-[11px] text-neutral-600">
            Telemetry will appear once drones connect and begin streaming
          </span>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="px-5 py-2.5 border-b border-[#1a1a1a] flex items-center gap-3 shrink-0">
            <span className="font-mono text-[11px] text-neutral-500">
              Drone:
            </span>
            <DroneSelector
              droneIds={droneIds}
              selected={selectedDrone}
              onSelect={setSelectedDrone}
            />
          </div>

          {/* Chart grid */}
          <div className="flex-1 grid grid-cols-2 gap-px bg-[#1a1a1a] overflow-hidden">
            <SparklineChart
              data={history.altitude}
              label="Altitude"
              unit="m"
              color="#3b82f6"
            />
            <SparklineChart
              data={history.battery}
              label="Battery"
              unit="%"
              color="#22c55e"
              decimals={0}
            />
            <SparklineChart
              data={history.voltage}
              label="Voltage"
              unit="V"
              color="#f59e0b"
              decimals={1}
            />
            <SparklineChart
              data={history.satellites}
              label="GPS Satellites"
              unit=""
              color="#a78bfa"
              decimals={0}
            />
          </div>

          {/* Drone list */}
          <div className="shrink-0 border-t border-[#1a1a1a] max-h-[200px] overflow-y-auto">
            {droneIds.map((id) => {
              const f = frames.get(id);
              if (!f) return null;
              return (
                <div
                  key={id}
                  className="flex items-center px-5 py-2.5 border-b border-[#1a1a1a] gap-3 hover:bg-[#0f0f0f] transition-colors cursor-pointer"
                  onClick={() => setSelectedDrone(selectedDrone === id ? null : id)}
                >
                  <div
                    className={`w-[7px] h-[7px] rounded-full shrink-0 ${
                      f.armed
                        ? "bg-fleet-green shadow-[0_0_4px_#22c55e88]"
                        : "bg-[#3a3a3a]"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-[11px] font-medium text-neutral-200">
                      {id.slice(0, 8)}…
                    </span>
                    <span className="text-[11px] text-neutral-500 ml-2">
                      {f.flightMode}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {f.batteryPercent > 0 && (
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-500">
                        <div className="w-[28px] h-[4px] bg-[#252525] rounded-sm overflow-hidden">
                          <div
                            className={`h-full rounded-sm ${
                              f.batteryPercent > 50
                                ? "bg-fleet-green"
                                : f.batteryPercent > 20
                                  ? "bg-fleet-amber"
                                  : "bg-fleet-red"
                            }`}
                            style={{ width: `${f.batteryPercent}%` }}
                          />
                        </div>
                        <span
                          className={
                            f.batteryPercent > 50
                              ? "text-neutral-500"
                              : "text-fleet-amber"
                          }
                        >
                          {f.batteryPercent.toFixed(0)}%
                        </span>
                      </div>
                    )}
                    {f.position && (
                      <span className="font-mono text-[10px] text-neutral-500">
                        {f.position.altitudeM.toFixed(0)}m
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
