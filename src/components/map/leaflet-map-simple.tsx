"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { Base } from "@/lib/types";

// Fix Leaflet default icon paths broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [32.253, -110.911];
const DEFAULT_ZOOM = 12;

// ── Status helpers (mirrored from bases page) ────────────────────────────────

function connectionStatus(lastSeenAt?: string | null): "active" | "delayed" | "offline" | "unknown" {
  if (!lastSeenAt) return "unknown";
  const diffMs = Date.now() - new Date(lastSeenAt).getTime();
  if (diffMs < 60_000) return "active";
  if (diffMs < 600_000) return "delayed";
  return "offline";
}

function deviceStatusLabel(device: { cert_serial?: string | null; enrolled_at?: string | null; decommissioned_at?: string | null }): string {
  if (device.decommissioned_at) return "Decommissioned";
  if (device.enrolled_at && device.cert_serial) return "Enrolled";
  if (device.enrolled_at && !device.cert_serial) return "Revoked";
  if (device.cert_serial && !device.enrolled_at) return "Awaiting Connection";
  return "Awaiting Certificate";
}

function formatRelativeTime(iso: string): string {
  try {
    const diffMs = Date.now() - new Date(iso).getTime();
    if (diffMs < 60_000) return "just now";
    if (diffMs < 3600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
    if (diffMs < 86400_000) return `${Math.floor(diffMs / 3600_000)}h ago`;
    return `${Math.floor(diffMs / 86400_000)}d ago`;
  } catch {
    return iso;
  }
}

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute bottom-3 right-3 flex gap-1 z-[1000]">
      <button
        onClick={() => map.zoomIn()}
        className="w-7 h-7 bg-neutral-950/80 border border-neutral-700 rounded flex items-center justify-center text-neutral-400 text-xs backdrop-blur-sm hover:text-white"
      >
        +
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-7 h-7 bg-neutral-950/80 border border-neutral-700 rounded flex items-center justify-center text-neutral-400 text-xs backdrop-blur-sm hover:text-white"
      >
        −
      </button>
    </div>
  );
}

type BaseWithCoords = Base & { lat: number; lng: number };

interface LeafletMapSimpleProps {
  bases: BaseWithCoords[];
}

export default function LeafletMapSimple({ bases }: LeafletMapSimpleProps) {
  const center: [number, number] =
    bases.length > 0 ? [bases[0].lat, bases[0].lng] : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={DEFAULT_ZOOM}
      zoomControl={false}
      attributionControl={false}
      className="w-full h-full"
      style={{ background: "#0a0a0a" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {bases.map((base) => {
        const status = deviceStatusLabel(base);
        const conn = status === "Enrolled" ? connectionStatus(base.last_seen_at) : null;

        const connColors: Record<string, { dot: string; text: string; label: string }> = {
          active: { dot: "bg-[#22c55e] shadow-[0_0_4px_#22c55e88]", text: "text-[#22c55e]", label: "Active" },
          delayed: { dot: "bg-[#f59e0b] shadow-[0_0_4px_#f59e0b88]", text: "text-[#f59e0b]", label: "Delayed" },
          offline: { dot: "bg-[#555]", text: "text-[#555]", label: "Offline" },
        };
        const connInfo = conn && conn !== "unknown" ? connColors[conn] : null;

        return (
          <Marker key={base.id} position={[base.lat, base.lng]}>
            <Popup>
              <div className="font-mono text-[11px] leading-relaxed min-w-35">
                {/* Name + status */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  {connInfo && <span className={`inline-block size-1.5 rounded-full shrink-0 ${connInfo.dot}`} />}
                  <span className="font-semibold text-[#e8e8e8]">{base.name}</span>
                </div>

                {/* Status label */}
                <div className="text-[#888] text-[10px] mb-1">{status}</div>

                {/* Connection + latency row */}
                {connInfo && (
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className={connInfo.text}>{connInfo.label}</span>
                    {base.rtt_ms != null && (
                      <>
                        <span className="text-[#3a3a3a]">·</span>
                        <span className={base.rtt_ms > 200 ? "text-fleet-red" : base.rtt_ms >= 50 ? "text-fleet-amber" : "text-fleet-green"}>
                          {base.rtt_ms}ms
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Last seen */}
                {base.last_seen_at && (
                  <div className="text-[10px] text-[#3a3a3a] mt-0.5">
                    seen {formatRelativeTime(base.last_seen_at)}
                  </div>
                )}

                {/* View details link */}
                <Link
                  href="/bases"
                  className="block text-[10px] text-fleet-blue hover:text-[#60a5fa] mt-2 no-underline"
                >
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {bases.length === 0 && (
        <div
          className="absolute inset-0 flex items-end justify-center pb-6 z-[1000] pointer-events-none"
        >
          <div className="bg-neutral-950/80 border border-neutral-800 rounded px-3 py-1.5 font-mono text-[11px] text-neutral-400">
            No bases with coordinates configured
          </div>
        </div>
      )}

      <ZoomControls />
    </MapContainer>
  );
}
