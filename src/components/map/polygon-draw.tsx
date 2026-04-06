"use client";

import { useCallback } from "react";
import { useMapEvents, Polyline, Polygon, Marker } from "react-leaflet";
import L from "leaflet";
import type { LatLng } from "@/lib/waypoints";

interface PolygonDrawProps {
  polygon: LatLng[];
  onPolygonChange: (vertices: LatLng[]) => void;
  closed: boolean;
  onClose: () => void;
}

// Small invisible icon for draggable vertices
const vertexIcon = L.divIcon({
  className: "",
  html: '<div style="width:10px;height:10px;background:#3b82f6;border:2px solid #fff;border-radius:50%;"></div>',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

export function PolygonDraw({ polygon, onPolygonChange, closed, onClose }: PolygonDrawProps) {
  useMapEvents({
    click(e) {
      if (closed) return;
      const newVertices = [...polygon, { lat: e.latlng.lat, lng: e.latlng.lng }];
      onPolygonChange(newVertices);
    },
    dblclick(e) {
      if (polygon.length >= 3 && !closed) {
        L.DomEvent.stopPropagation(e);
        onClose();
      }
    },
  });

  const handleVertexDrag = useCallback(
    (index: number, lat: number, lng: number) => {
      const updated = [...polygon];
      updated[index] = { lat, lng };
      onPolygonChange(updated);
    },
    [polygon, onPolygonChange]
  );

  const positions = polygon.map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <>
      {/* Filled polygon when we have 3+ vertices */}
      {polygon.length >= 3 && (
        <Polygon
          positions={positions}
          pathOptions={{
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.15,
            weight: 2,
          }}
        />
      )}

      {/* Edge lines */}
      {polygon.length >= 2 && (
        <Polyline
          positions={closed ? [...positions, positions[0]] : positions}
          pathOptions={{ color: "#3b82f6", weight: 2, dashArray: closed ? undefined : "5 5" }}
        />
      )}

      {/* Draggable vertex markers */}
      {polygon.map((vertex, i) => (
        <Marker
          key={`vertex-${i}`}
          position={[vertex.lat, vertex.lng]}
          icon={vertexIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target as L.Marker;
              const pos = marker.getLatLng();
              handleVertexDrag(i, pos.lat, pos.lng);
            },
          }}
        />
      ))}
    </>
  );
}
