"use client";

interface DroneSelectorProps {
  droneIds: string[];
  selected: string | null;
  onSelect: (nodeId: string | null) => void;
}

export function DroneSelector({
  droneIds,
  selected,
  onSelect,
}: DroneSelectorProps) {
  return (
    <select
      className="bg-[#080808] border border-[#252525] rounded text-neutral-200 font-mono text-[11px] px-2 py-1 outline-none hover:border-[#3a3a3a] cursor-pointer"
      value={selected ?? "ALL"}
      onChange={(e) => onSelect(e.target.value === "ALL" ? null : e.target.value)}
    >
      <option value="ALL">All Fleet</option>
      {droneIds.map((id) => (
        <option key={id} value={id}>
          {id.slice(0, 8)}…
        </option>
      ))}
    </select>
  );
}
