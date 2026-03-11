"use client";

import { Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import type { BaseStation, Drone } from "@/lib/types";

function createBaseIcon(base: BaseStation): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:3px">
      <div style="width:24px;height:24px;background:#0f0f0f;border:1.5px solid #252525;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 0 10px #00000088">⬡</div>
      <div style="font-family:monospace;font-size:9px;color:#888;background:#080808cc;padding:1px 5px;border-radius:2px;border:1px solid #252525;white-space:nowrap">${base.id}</div>
    </div>`,
    iconSize: [60, 42],
    iconAnchor: [30, 21],
  });
}

interface BaseMarkerLayerProps {
  base: BaseStation;
  drones: Drone[];
}

export function BaseMarkerLayer({ base, drones }: BaseMarkerLayerProps) {
  // Uplink lines to D-01 and D-04 (matching mock)
  const uplinkDrones = drones.filter((d) => d.id === "D-01" || d.id === "D-04");

  return (
    <>
      <Marker
        position={[base.position.lat, base.position.lng]}
        icon={createBaseIcon(base)}
      >
        <Popup>
          <span style={{ fontFamily: "monospace", fontSize: "11px" }}>
            {base.id} · {base.status} · {base.uplinkLatency}ms
          </span>
        </Popup>
      </Marker>

      {uplinkDrones.map((drone) => (
        <Polyline
          key={`uplink-${drone.id}`}
          positions={[
            [base.position.lat, base.position.lng],
            [drone.position.lat, drone.position.lng],
          ]}
          pathOptions={{
            color: "#3b82f6",
            weight: 1,
            opacity: 0.12,
            dashArray: "2,6",
          }}
        />
      ))}
    </>
  );
}
