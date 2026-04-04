"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { renderToStaticMarkup } from "react-dom/server";
import Link from "next/link";
import { RadioTower } from "lucide-react";
import type { Base } from "@/lib/types";

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

// ── Custom base marker icon ──────────────────────────────────────────────────

const radioTowerSvg = renderToStaticMarkup(
  <RadioTower size={14} strokeWidth={1.5} color="#888" />
);

function createBaseIcon(name: string, conn: "active" | "delayed" | "offline" | "unknown" | null) {
  const dotColor =
    conn === "active" ? "#22c55e" :
    conn === "delayed" ? "#f59e0b" :
    conn === "offline" ? "#555" : "#3a3a3a";

  const dotShadow = conn === "active" ? "box-shadow:0 0 4px #22c55e88;" : "";

  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
        <div style="width:28px;height:28px;background:#0f0f0f;border:1.5px solid #252525;border-radius:5px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #000a">
          ${radioTowerSvg}
        </div>
        <div style="display:flex;align-items:center;gap:4px;font-family:monospace;font-size:9px;color:#888;background:#080808dd;padding:1px 6px;border-radius:2px;border:1px solid #252525;white-space:nowrap;backdrop-filter:blur(4px)">
          <span style="width:5px;height:5px;border-radius:50%;background:${dotColor};display:inline-block;flex-shrink:0;${dotShadow}"></span>
          ${name}
        </div>
      </div>`,
    iconSize: [80, 46],
    iconAnchor: [40, 23],
    popupAnchor: [0, -20],
  });
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
        const icon = createBaseIcon(base.name, conn);

        const connColors: Record<string, { text: string; label: string }> = {
          active: { text: "text-[#22c55e]", label: "Active" },
          delayed: { text: "text-[#f59e0b]", label: "Delayed" },
          offline: { text: "text-[#555]", label: "Offline" },
        };
        const connInfo = conn && conn !== "unknown" ? connColors[conn] : null;

        return (
          <Marker key={base.id} position={[base.lat, base.lng]} icon={icon}>
            <Popup>
              <div className="font-mono text-[11px] leading-relaxed min-w-35">
                {/* Name */}
                <div className="font-semibold text-[#e8e8e8] mb-1.5">{base.name}</div>

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
