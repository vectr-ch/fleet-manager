"use client";

import { trpc } from "@/lib/trpc/client";
import type { MissionConfig } from "@/app/(dashboard)/missions/new/page";

const inputClass =
  "bg-neutral-900 border border-neutral-700 rounded-[5px] px-2.5 py-1.5 font-mono text-[11px] text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 w-full";

interface BaseFleetStepProps {
  config: MissionConfig;
  onConfigChange: (config: MissionConfig) => void;
}

export function BaseFleetStep({ config, onConfigChange }: BaseFleetStepProps) {
  const { data: bases = [], isLoading } = trpc.bases.list.useQuery();

  const enrolledBases = bases.filter((b) => b.status === "enrolled" && !b.maintenance_mode);

  if (isLoading) {
    return <div className="font-mono text-[11px] text-neutral-500">Loading bases...</div>;
  }

  return (
    <div className="space-y-5">
      {/* Base selection */}
      <div>
        <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-3">
          Select Base Station
        </div>
        {enrolledBases.length === 0 ? (
          <div className="bg-neutral-800 rounded-[5px] p-4 font-mono text-[11px] text-neutral-500">
            No enrolled bases available. Bases must be enrolled and not in maintenance mode.
          </div>
        ) : (
          <div className="space-y-2">
            {enrolledBases.map((base) => (
              <button
                key={base.id}
                onClick={() => onConfigChange({ ...config, baseId: base.id })}
                className={`w-full text-left px-3 py-2.5 rounded-[5px] border font-mono transition-colors ${
                  config.baseId === base.id
                    ? "border-blue-500 bg-blue-900/20"
                    : "border-neutral-800 bg-neutral-900 hover:border-neutral-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-semibold text-white">{base.name}</div>
                    {base.lat != null && base.lng != null && (
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        {base.lat.toFixed(4)}, {base.lng.toFixed(4)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-neutral-400">Online</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Drone count */}
      <div>
        <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-3">
          Fleet Size
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[10px] text-neutral-500 block mb-1">Drone Count</label>
            <input
              type="number"
              value={config.droneCount}
              onChange={(e) => onConfigChange({ ...config, droneCount: parseInt(e.target.value) || 1 })}
              className={inputClass}
              min={1}
              max={10}
            />
          </div>
          <div>
            <label className="font-mono text-[10px] text-neutral-500 block mb-1">Minimum Required</label>
            <input
              type="number"
              value={config.minDroneCount}
              onChange={(e) => onConfigChange({ ...config, minDroneCount: parseInt(e.target.value) || 1 })}
              className={inputClass}
              min={1}
              max={config.droneCount}
            />
          </div>
        </div>
        <p className="font-mono text-[10px] text-neutral-600 mt-2">
          Fleet assignment will auto-select the healthiest drones from the base.
        </p>
      </div>
    </div>
  );
}
