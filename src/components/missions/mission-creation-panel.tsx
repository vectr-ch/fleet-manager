"use client";

import type { MissionConfig } from "@/app/(dashboard)/missions/new/page";
import type { LatLng, GeneratedWaypoint } from "@/lib/waypoints";
import { TypeSelectStep } from "./steps/type-select-step";
import { ConfigureStep } from "./steps/configure-step";
import { BaseFleetStep } from "./steps/base-fleet-step";
import { ReviewStep } from "./steps/review-step";

const STEPS = ["Type", "Configure", "Base & Fleet", "Review"];

interface MissionCreationPanelProps {
  config: MissionConfig;
  onConfigChange: (config: MissionConfig) => void;
  currentStep: number;
  onStepChange: (step: number) => void;
  polygon: LatLng[];
  polygonClosed: boolean;
  waypoints: GeneratedWaypoint[];
  onCreate: () => void;
  isCreating: boolean;
  error: string | null;
}

export function MissionCreationPanel({
  config,
  onConfigChange,
  currentStep,
  onStepChange,
  polygon,
  polygonClosed,
  waypoints,
  onCreate,
  isCreating,
  error,
}: MissionCreationPanelProps) {
  const canNext = (() => {
    switch (currentStep) {
      case 0: return config.type !== "";
      case 1: return polygonClosed && polygon.length >= 3;
      case 2: return config.baseId !== null;
      case 3: return true;
      default: return false;
    }
  })();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-800">
        <h2 className="text-lg font-semibold text-white tracking-tight">New Mission</h2>
        <p className="font-mono text-[11px] text-neutral-500 mt-0.5">
          Step {currentStep + 1} of {STEPS.length} — {STEPS[currentStep]}
        </p>
      </div>

      {/* Step progress */}
      <div className="px-5 py-3 border-b border-neutral-800 flex gap-1">
        {STEPS.map((step, i) => (
          <button
            key={step}
            onClick={() => i < currentStep && onStepChange(i)}
            disabled={i > currentStep}
            className={`flex-1 h-1 rounded-full transition-colors ${
              i <= currentStep ? "bg-blue-500" : "bg-neutral-800"
            } ${i < currentStep ? "cursor-pointer hover:bg-blue-400" : ""}`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {currentStep === 0 && (
          <TypeSelectStep
            selectedType={config.type}
            onSelect={(type) => onConfigChange({ ...config, type })}
          />
        )}
        {currentStep === 1 && (
          <ConfigureStep
            missionType={config.type}
            config={config}
            onConfigChange={onConfigChange}
            polygonClosed={polygonClosed}
            waypointCount={waypoints.length}
          />
        )}
        {currentStep === 2 && (
          <BaseFleetStep
            config={config}
            onConfigChange={onConfigChange}
          />
        )}
        {currentStep === 3 && (
          <ReviewStep
            config={config}
            polygon={polygon}
            waypoints={waypoints}
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-5 py-2 bg-red-900/20 border-t border-red-900/50">
          <span className="font-mono text-[11px] text-red-400">{error}</span>
        </div>
      )}

      {/* Navigation */}
      <div className="px-5 py-4 border-t border-neutral-800 flex gap-3">
        {currentStep > 0 && (
          <button
            onClick={() => onStepChange(currentStep - 1)}
            className="font-mono text-[11px] tracking-wider uppercase px-4 py-2 rounded-[5px] border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
          >
            Back
          </button>
        )}
        <div className="flex-1" />
        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={() => onStepChange(currentStep + 1)}
            disabled={!canNext}
            className={`font-mono text-[11px] tracking-wider uppercase px-4 py-2 rounded-[5px] transition-colors ${
              canNext
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        ) : (
          <button
            onClick={onCreate}
            disabled={isCreating}
            className="font-mono text-[11px] tracking-wider uppercase px-4 py-2 rounded-[5px] bg-green-600 text-white hover:bg-green-500 disabled:bg-neutral-800 disabled:text-neutral-500 transition-colors"
          >
            {isCreating ? "Creating\u2026" : "Create Draft"}
          </button>
        )}
      </div>
    </div>
  );
}
