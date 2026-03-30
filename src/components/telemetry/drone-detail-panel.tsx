"use client";

import type { TelemetryFrame } from "@/lib/nats/types";
import { ArtificialHorizon } from "./artificial-horizon";
import { CompassRose } from "./compass-rose";

interface DroneDetailPanelProps {
  nodeId: string;
  nodeName: string;
  frame: TelemetryFrame | undefined;
  onClose: () => void;
}

function KvRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between items-center text-[11px]">
      <span className="text-[#888]">{label}</span>
      <span className={`font-mono text-[11px] ${color ?? "text-foreground"}`}>{value}</span>
    </div>
  );
}

function batteryColor(pct: number): string {
  if (pct > 50) return "text-fleet-green";
  if (pct > 20) return "text-fleet-amber";
  return "text-fleet-red";
}

function fixTypeLabel(ft: number): string {
  if (ft === 3) return "3D Fix";
  if (ft === 2) return "2D Fix";
  return "No Fix";
}

function fixColor(ft: number): string {
  if (ft >= 3) return "text-fleet-green";
  if (ft === 2) return "text-fleet-amber";
  return "text-fleet-red";
}

export function DroneDetailPanel({ nodeId, nodeName, frame, onClose }: DroneDetailPanelProps) {
  return (
    <div className="w-[320px] border-l border-[#1a1a1a] bg-[#0f0f0f] flex flex-col overflow-y-auto shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-[7px] h-[7px] rounded-full shrink-0 ${
                frame?.armed
                  ? "bg-fleet-green shadow-[0_0_4px_#22c55e88]"
                  : "bg-[#3a3a3a]"
              }`}
            />
            <span className="font-mono text-[13px] font-semibold text-foreground">
              {nodeName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#555] hover:text-foreground transition-colors text-sm leading-none px-1"
          >
            ✕
          </button>
        </div>
        <div className="font-mono text-[10px] text-[#555] mt-1">
          {nodeId.slice(0, 8)}…
        </div>
        {frame && (
          <div className="flex gap-1.5 mt-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-[9px] font-semibold tracking-wide ${
                frame.armed
                  ? "bg-fleet-green-dim text-fleet-green border border-fleet-green/20"
                  : "bg-[#252525] text-[#555] border border-[#333]"
              }`}
            >
              {frame.armed ? "ARMED" : "DISARMED"}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-fleet-blue-dim text-fleet-blue border border-fleet-blue/20 font-mono text-[9px] font-semibold tracking-wide">
              {frame.flightMode}
            </span>
          </div>
        )}
      </div>

      {!frame ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-12">
          <span className="font-mono text-[11px] text-[#555]">No telemetry data</span>
          <span className="font-mono text-[10px] text-[#3a3a3a]">Waiting for stream…</span>
        </div>
      ) : (
        <>
          {/* Flight instruments */}
          <div className="flex gap-px bg-[#1a1a1a] border-b border-[#1a1a1a]">
            <div className="flex-1 bg-[#080808] flex flex-col items-center py-3">
              <span className="font-mono text-[9px] tracking-wider text-[#555] uppercase mb-1.5">
                Horizon
              </span>
              <ArtificialHorizon
                rollDeg={frame.attitude?.rollDeg ?? 0}
                pitchDeg={frame.attitude?.pitchDeg ?? 0}
              />
              <div className="font-mono text-[10px] text-[#888] mt-1.5">
                R: <span className="text-foreground">{(frame.attitude?.rollDeg ?? 0).toFixed(1)}°</span>
                {" "}P: <span className="text-foreground">{(frame.attitude?.pitchDeg ?? 0).toFixed(1)}°</span>
              </div>
            </div>
            <div className="flex-1 bg-[#080808] flex flex-col items-center py-3">
              <span className="font-mono text-[9px] tracking-wider text-[#555] uppercase mb-1.5">
                Heading
              </span>
              <CompassRose headingDeg={frame.attitude?.yawDeg ?? 0} />
              <div className="font-mono text-[10px] text-[#888] mt-1.5">
                HDG: <span className="text-foreground">{(frame.attitude?.yawDeg ?? 0).toFixed(0)}°</span>
              </div>
            </div>
          </div>

          {/* Vitals */}
          <div className="px-4 py-3 border-b border-[#1a1a1a]">
            <span className="font-mono text-[9px] tracking-wider text-[#555] uppercase">
              Vitals
            </span>
            <div className="mt-2 flex flex-col gap-1.5">
              <KvRow
                label="Battery"
                value={
                  frame.batteryPercent > 0
                    ? `${frame.batteryPercent.toFixed(0)}% · ${frame.batteryVoltage.toFixed(1)}V`
                    : "—"
                }
                color={frame.batteryPercent > 0 ? batteryColor(frame.batteryPercent) : undefined}
              />
              <KvRow label="Flight Mode" value={frame.flightMode} />
              <KvRow
                label="Armed"
                value={frame.armed ? "Yes" : "No"}
                color={frame.armed ? "text-fleet-green" : "text-[#555]"}
              />
            </div>
          </div>

          {/* Position */}
          <div className="px-4 py-3 border-b border-[#1a1a1a]">
            <span className="font-mono text-[9px] tracking-wider text-[#555] uppercase">
              Position
            </span>
            <div className="mt-2 flex flex-col gap-1.5">
              <KvRow
                label="Latitude"
                value={frame.position ? frame.position.latitude.toFixed(6) + "°" : "—"}
              />
              <KvRow
                label="Longitude"
                value={frame.position ? frame.position.longitude.toFixed(6) + "°" : "—"}
              />
              <KvRow
                label="Altitude"
                value={frame.position ? frame.position.altitudeM.toFixed(1) + " m" : "—"}
              />
            </div>
          </div>

          {/* GPS */}
          <div className="px-4 py-3 border-b border-[#1a1a1a]">
            <span className="font-mono text-[9px] tracking-wider text-[#555] uppercase">
              GPS
            </span>
            <div className="mt-2 flex flex-col gap-1.5">
              <KvRow
                label="Fix"
                value={frame.gps ? fixTypeLabel(frame.gps.fixType) : "—"}
                color={frame.gps ? fixColor(frame.gps.fixType) : undefined}
              />
              <KvRow
                label="Satellites"
                value={frame.gps ? String(frame.gps.satellites) : "—"}
                color={frame.gps && frame.gps.satellites >= 6 ? "text-fleet-green" : "text-fleet-amber"}
              />
              <KvRow label="HDOP" value={frame.gps ? frame.gps.hdop.toFixed(1) : "—"} />
            </div>
          </div>

          {/* Meta */}
          <div className="px-4 py-3">
            <span className="font-mono text-[9px] tracking-wider text-[#555] uppercase">
              Meta
            </span>
            <div className="mt-2 flex flex-col gap-1.5">
              <KvRow label="Base" value={frame.baseId.slice(0, 8) + "…"} />
              <KvRow
                label="Last Update"
                value={frame.timestampMs > 0 ? new Date(frame.timestampMs).toLocaleTimeString() : "—"}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
