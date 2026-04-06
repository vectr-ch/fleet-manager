"use client";

import { trpc } from "@/lib/trpc/client";

interface TypeSelectStepProps {
  selectedType: string;
  onSelect: (type: string) => void;
}

export function TypeSelectStep({ selectedType, onSelect }: TypeSelectStepProps) {
  const { data: types = [], isLoading } = trpc.missionTypes.list.useQuery();

  if (isLoading) {
    return <div className="font-mono text-[11px] text-neutral-500">Loading mission types...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">
        Select Mission Type
      </div>

      {types.map((type) => {
        const isSelected = selectedType === type.name;
        const isDisabled = !type.enabled;

        return (
          <button
            key={type.name}
            onClick={() => !isDisabled && onSelect(type.name)}
            disabled={isDisabled}
            className={`w-full text-left p-4 rounded-[5px] border transition-colors ${
              isSelected
                ? "border-blue-500 bg-blue-900/20"
                : isDisabled
                  ? "border-neutral-800 bg-neutral-900/50 opacity-50 cursor-not-allowed"
                  : "border-neutral-800 bg-neutral-900 hover:border-neutral-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                isSelected ? "bg-blue-500/20 text-blue-400" : "bg-neutral-800 text-neutral-400"
              }`}>
                {type.name === "surveillance" ? "\u25CE" : type.name === "search_rescue" ? "\u2316" : "\u25A3"}
              </div>
              <div className="flex-1">
                <div className="font-mono text-[12px] font-semibold text-white">
                  {type.display_name}
                  {isDisabled && (
                    <span className="ml-2 text-[10px] text-neutral-500 font-normal">Coming soon</span>
                  )}
                </div>
                <div className="font-mono text-[11px] text-neutral-500 mt-0.5 line-clamp-2">
                  {type.description}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
