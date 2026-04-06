"use client";

import type { MissionConfig } from "@/app/(dashboard)/missions/new/page";
import { abortActionLabels } from "@/lib/mission-types";

const inputClass =
  "bg-neutral-900 border border-neutral-700 rounded-[5px] px-2.5 py-1.5 font-mono text-[11px] text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 w-full";

interface SurveillanceParamsProps {
  config: MissionConfig;
  onConfigChange: (config: MissionConfig) => void;
}

export function SurveillanceParams({ config, onConfigChange }: SurveillanceParamsProps) {
  const updateParam = (key: string, value: number | boolean) => {
    onConfigChange({
      ...config,
      params: { ...config.params, [key]: value },
    });
  };

  const updateAbortAction = (action: string) => {
    onConfigChange({
      ...config,
      abortAction: { action, options: { land_at: "takeoff_position" } },
    });
  };

  return (
    <div className="space-y-5">
      {/* Flight parameters */}
      <div>
        <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-3">
          Flight Parameters
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="font-mono text-[10px] text-neutral-500 block mb-1">Spacing (m)</label>
            <input
              type="number"
              value={config.params.spacing_m}
              onChange={(e) => updateParam("spacing_m", parseFloat(e.target.value) || 30)}
              className={inputClass}
              min={5}
              max={200}
              step={5}
            />
          </div>
          <div>
            <label className="font-mono text-[10px] text-neutral-500 block mb-1">Altitude (m)</label>
            <input
              type="number"
              value={config.params.altitude_m}
              onChange={(e) => updateParam("altitude_m", parseFloat(e.target.value) || 50)}
              className={inputClass}
              min={10}
              max={120}
              step={5}
            />
          </div>
          <div>
            <label className="font-mono text-[10px] text-neutral-500 block mb-1">Speed (m/s)</label>
            <input
              type="number"
              value={config.params.speed_ms}
              onChange={(e) => updateParam("speed_ms", parseFloat(e.target.value) || 5)}
              className={inputClass}
              min={1}
              max={20}
              step={0.5}
            />
          </div>
        </div>
      </div>

      {/* Loop toggle */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] text-white">Loop Mission</div>
          <div className="font-mono text-[10px] text-neutral-500">Restart path after completion</div>
        </div>
        <button
          onClick={() => updateParam("loop", !config.params.loop)}
          className={`w-10 h-5 rounded-full transition-colors relative ${
            config.params.loop ? "bg-blue-600" : "bg-neutral-700"
          }`}
        >
          <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
            config.params.loop ? "translate-x-5" : "translate-x-0.5"
          }`} />
        </button>
      </div>

      {/* Abort action */}
      <div>
        <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-3">
          Abort Action
        </div>
        <div className="space-y-2">
          {Object.entries(abortActionLabels).map(([action, label]) => (
            <button
              key={action}
              onClick={() => updateAbortAction(action)}
              className={`w-full text-left px-3 py-2.5 rounded-[5px] border font-mono text-[11px] transition-colors ${
                config.abortAction.action === action
                  ? "border-blue-500 bg-blue-900/20 text-white"
                  : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
