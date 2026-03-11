"use client";

import dynamic from "next/dynamic";

const MapContent = dynamic(() => import("./map-content").then((m) => m.MapContent), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-background flex items-center justify-center text-subtle font-mono text-xs">
      Loading map...
    </div>
  ),
});

export function MapPanel() {
  return (
    <div className="bg-background relative overflow-hidden h-full">
      <MapContent />
    </div>
  );
}
