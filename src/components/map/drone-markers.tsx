"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Drone } from "@/lib/types";
import { useDroneSelection } from "@/hooks/use-drone-selection";

function createDroneIcon(drone: Drone, isSelected: boolean): L.DivIcon {
  const col = drone.status === "nominal" ? "#22c55e" : drone.status === "warning" ? "#f59e0b" : "#ef4444";
  const glow = col + "44";
  const ring = isSelected ? `border: 2px solid ${col};` : "";

  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer">
      <div style="width:${isSelected ? 14 : 10}px;height:${isSelected ? 14 : 10}px;border-radius:50%;background:${col};border:1.5px solid ${col};box-shadow:0 0 8px ${glow};${ring}position:relative">
        <div style="position:absolute;inset:-4px;border-radius:50%;border:1px solid ${col};opacity:0.3;animation:drone-ring 2s infinite"></div>
      </div>
      <div style="font-family:monospace;font-size:9px;color:#888;background:#080808cc;padding:1px 4px;border-radius:2px;border:1px solid #252525;white-space:nowrap">${drone.id}${drone.status === "warning" ? " ⚡" : ""}</div>
    </div>`,
    iconSize: [50, 28],
    iconAnchor: [25, 10],
  });
}

interface DroneMarkersProps {
  drones: Drone[];
}

export function DroneMarkers({ drones }: DroneMarkersProps) {
  const { selectedDroneId, selectDrone } = useDroneSelection();

  return (
    <>
      {drones.map((drone) => (
        <Marker
          key={drone.id}
          position={[drone.position.lat, drone.position.lng]}
          icon={createDroneIcon(drone, drone.id === selectedDroneId)}
          eventHandlers={{
            click: () => selectDrone(drone.id),
          }}
        >
          <Popup>
            <div style={{ fontFamily: "monospace", fontSize: "11px", lineHeight: "1.6" }}>
              <strong style={{ color: "#e8e8e8" }}>{drone.id}</strong>
              <br />
              Role: <span style={{ color: "#888" }}>{drone.role}</span>
              <br />
              Battery: <span style={{ color: drone.battery < 25 ? "#f59e0b" : "#22c55e" }}>
                {Math.round(drone.battery)}%
              </span>
              <br />
              Status: <span style={{ color: drone.status === "nominal" ? "#22c55e" : "#f59e0b" }}>
                {drone.status}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
