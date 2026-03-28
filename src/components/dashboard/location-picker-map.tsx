"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const TILE_URL =
  process.env.NEXT_PUBLIC_TILE_URL ??
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const DEFAULT_CENTER: [number, number] = [47.37, 8.54];
const DEFAULT_ZOOM = 4;

interface LocationPickerMapProps {
  pin: { lat: number; lng: number } | null;
  onPinChange: (lat: number, lng: number) => void;
  flyTo: { lat: number; lng: number; zoom: number } | null;
}

function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    // Leaflet needs a size recalculation after the modal renders
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function ClickHandler({ onPinChange }: { onPinChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPinChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyController({ flyTo }: { flyTo: LocationPickerMapProps["flyTo"] }) {
  const map = useMap();
  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom, { duration: 0.8 });
    }
  }, [flyTo, map]);
  return null;
}

export default function LocationPickerMap({ pin, onPinChange, flyTo }: LocationPickerMapProps) {
  const center: [number, number] = pin ? [pin.lat, pin.lng] : DEFAULT_CENTER;
  const zoom = pin ? 14 : DEFAULT_ZOOM;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={false}
      attributionControl={false}
      className="w-full h-full"
      style={{ background: "#0a0a0a" }}
    >
      <TileLayer url={TILE_URL} maxZoom={19} />
      <InvalidateSizeOnMount />
      <ClickHandler onPinChange={onPinChange} />
      <FlyController flyTo={flyTo} />
      {pin && <Marker position={[pin.lat, pin.lng]} />}
    </MapContainer>
  );
}
