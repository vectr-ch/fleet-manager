"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { renderToStaticMarkup } from "react-dom/server";
import Link from "next/link";
import { RadioTower, Search } from "lucide-react";
import type { Base } from "@/lib/types";
import type { TelemetryFrame } from "@/lib/nats/types";

const DEFAULT_CENTER: [number, number] = [32.253, -110.911];
const DEFAULT_ZOOM = 12;
const FIT_PADDING: [number, number] = [50, 50];

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

function baseConnectionStatus(base: BaseWithCoords): "active" | "delayed" | "offline" | "unknown" {
  const status = deviceStatusLabel(base);
  return status === "Enrolled" ? connectionStatus(base.last_seen_at) : "unknown";
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

function connMeta(base: BaseWithCoords): string {
  const conn = baseConnectionStatus(base);
  if (conn === "active" && base.rtt_ms != null) return `${base.rtt_ms}ms`;
  if (conn === "active") return "active";
  if (conn === "delayed") return "delayed";
  if (conn === "offline") return "offline";
  return "";
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

function createDroneIcon(name: string, batteryPercent: number, armed: boolean) {
  const color = batteryPercent < 20 ? "#ef4444" : batteryPercent < 40 ? "#f59e0b" : "#22c55e";
  const glow = batteryPercent < 20 ? "#ef444444" : batteryPercent < 40 ? "#f59e0b44" : "#22c55e44";

  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer">
        <div style="width:10px;height:10px;border-radius:50%;background:${color};border:1.5px solid ${color};box-shadow:0 0 8px ${glow}"></div>
        <div style="display:flex;align-items:center;gap:3px;font-family:monospace;font-size:9px;color:#888;background:#080808dd;padding:1px 5px;border-radius:2px;border:1px solid #252525;white-space:nowrap;backdrop-filter:blur(4px)">
          ${name}${armed ? " ▲" : ""}
        </div>
      </div>`,
    iconSize: [60, 28],
    iconAnchor: [30, 14],
    popupAnchor: [0, -12],
  });
}

// ── Auto-fit controller ─────────────────────────────────────────────────────

function AutoFit({ bases, drones }: { bases: BaseWithCoords[]; drones: DroneOnMap[] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current) return;

    const points: L.LatLngExpression[] = bases.map((b) => [b.lat, b.lng]);
    for (const d of drones) {
      if (d.frame.position) {
        points.push([d.frame.position.latitude, d.frame.position.longitude]);
      }
    }

    if (points.length === 0) return;

    fitted.current = true;

    if (points.length === 1) {
      map.setView(points[0], DEFAULT_ZOOM);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: FIT_PADDING });
    }
  }, [map, bases, drones]);

  return null;
}

// ── Base overlay panel ──────────────────────────────────────────────────────

function BaseOverlay({ bases, markerRefs }: { bases: BaseWithCoords[]; markerRefs: React.RefObject<Map<string, L.Marker>> }) {
  const map = useMap();
  const [search, setSearch] = useState("");
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  const updateVisibleBases = useCallback(() => {
    const bounds = map.getBounds();
    const ids = new Set<string>();
    for (const base of bases) {
      if (bounds.contains([base.lat, base.lng])) {
        ids.add(base.id);
      }
    }
    setVisibleIds(ids);
  }, [map, bases]);

  useMapEvents({
    moveend: updateVisibleBases,
    zoomend: updateVisibleBases,
  });

  useEffect(() => {
    updateVisibleBases();
  }, [updateVisibleBases]);

  // Status counts across all bases
  const counts = { active: 0, delayed: 0, offline: 0, other: 0 };
  for (const base of bases) {
    const conn = baseConnectionStatus(base);
    if (conn === "active") counts.active++;
    else if (conn === "delayed") counts.delayed++;
    else if (conn === "offline") counts.offline++;
    else counts.other++;
  }

  const isSearching = search.trim().length > 0;
  const searchLower = search.trim().toLowerCase();

  // When searching: filter all bases by name. Otherwise: show only in-view bases.
  const displayBases = isSearching
    ? bases.filter((b) => b.name.toLowerCase().includes(searchLower))
    : bases.filter((b) => visibleIds.has(b.id));

  function flyToBase(base: BaseWithCoords) {
    map.flyTo([base.lat, base.lng], Math.max(map.getZoom(), 14), { duration: 0.8 });
    setSearch("");

    // Open the marker's popup after the fly animation
    setTimeout(() => {
      const marker = markerRefs.current?.get(base.id);
      if (marker) marker.openPopup();
    }, 900);
  }

  if (bases.length === 0) return null;

  return (
    <div
      className="absolute top-2.5 left-2.5 z-1000 min-w-45 max-w-52.5 rounded-md border border-[#252525] bg-[#0a0a0a]/80 font-mono backdrop-blur-md"
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {/* Header with status badges */}
      <div className="flex items-center gap-1.5 px-2.5 pt-2 pb-1">
        <span className="text-[9px] tracking-[.08em] uppercase text-[#555]">Bases</span>
        <div className="ml-auto flex items-center gap-1.5 text-[9px] text-[#555]">
          {counts.active > 0 && (
            <span className="flex items-center gap-1">
              <span className="inline-block size-1 rounded-full bg-fleet-green" />{counts.active}
            </span>
          )}
          {counts.delayed > 0 && (
            <span className="flex items-center gap-1">
              <span className="inline-block size-1 rounded-full bg-fleet-amber" />{counts.delayed}
            </span>
          )}
          {counts.offline > 0 && (
            <span className="flex items-center gap-1">
              <span className="inline-block size-1 rounded-full bg-[#555]" />{counts.offline}
            </span>
          )}
          {counts.other > 0 && (
            <span className="flex items-center gap-1">
              <span className="inline-block size-1 rounded-full bg-[#3a3a3a]" />{counts.other}
            </span>
          )}
        </div>
      </div>

      {/* Search input */}
      <div className="relative px-2 pb-1">
        <Search size={10} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a3a3a]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search or jump to base..."
          className="w-full rounded border border-[#252525] bg-[#0f0f0f] py-1 pl-6 pr-2 text-[10px] text-[#888] placeholder-[#3a3a3a] outline-none focus:border-[#333]"
        />
      </div>

      {/* Section label */}
      {!isSearching && displayBases.length > 0 && (
        <div className="px-2.5 pt-1 pb-0.5 text-[8px] tracking-[.06em] uppercase text-[#3a3a3a]">
          In view · {displayBases.length}
        </div>
      )}
      {isSearching && (
        <div className="px-2.5 pt-1 pb-0.5 text-[8px] tracking-[.06em] uppercase text-[#3a3a3a]">
          {displayBases.length} match{displayBases.length !== 1 ? "es" : ""}
        </div>
      )}

      {/* Base list */}
      <div className="max-h-50 overflow-y-auto px-1 pb-1 scrollbar-thin scrollbar-thumb-[#252525] scrollbar-track-transparent">
        {displayBases.map((base) => {
          const conn = baseConnectionStatus(base);
          const dotClass =
            conn === "active" ? "bg-fleet-green shadow-[0_0_4px_#22c55e88]" :
            conn === "delayed" ? "bg-fleet-amber" :
            conn === "offline" ? "bg-[#555]" : "bg-[#3a3a3a]";

          return (
            <button
              key={base.id}
              onClick={() => flyToBase(base)}
              className="flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-[10px] text-[#888] transition-colors hover:bg-[#1a1a1a] hover:text-[#e8e8e8]"
            >
              <span className={`inline-block size-1.25 shrink-0 rounded-full ${dotClass}`} />
              <span className="truncate">{base.name}</span>
              <span className="ml-auto shrink-0 text-[9px] text-[#3a3a3a]">{connMeta(base)}</span>
            </button>
          );
        })}
        {displayBases.length === 0 && (
          <div className="px-1.5 py-2 text-center text-[10px] text-[#3a3a3a]">
            {isSearching ? "No bases found" : "No bases in view"}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#1a1a1a] px-2.5 py-1 text-[9px] text-[#3a3a3a]">
        {isSearching
          ? `${displayBases.length} of ${bases.length} bases`
          : `${visibleIds.size} in view · ${bases.length} total`
        }
      </div>
    </div>
  );
}

// ── Zoom controls ───────────────────────────────────────────────────────────

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

// ── Main component ──────────────────────────────────────────────────────────

type BaseWithCoords = Base & { lat: number; lng: number };

export interface DroneOnMap {
  nodeId: string;
  name: string;
  frame: TelemetryFrame;
}

interface LeafletMapSimpleProps {
  bases: BaseWithCoords[];
  drones?: DroneOnMap[];
}

export default function LeafletMapSimple({ bases, drones = [] }: LeafletMapSimpleProps) {
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  return (
    <MapContainer
      center={DEFAULT_CENTER}
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

      <AutoFit bases={bases} drones={drones} />
      <BaseOverlay bases={bases} markerRefs={markerRefs} />

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
          <Marker
            key={base.id}
            position={[base.lat, base.lng]}
            icon={icon}
            ref={(el) => {
              if (el) markerRefs.current.set(base.id, el);
              else markerRefs.current.delete(base.id);
            }}
          >
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

      {/* Drone markers from live telemetry */}
      {drones.map((drone) => {
        const { frame } = drone;
        if (!frame.position) return null;

        const icon = createDroneIcon(drone.name, frame.batteryPercent, frame.armed);
        const alt = frame.position.altitudeM;
        const sats = frame.gps?.satellites;

        return (
          <Marker
            key={drone.nodeId}
            position={[frame.position.latitude, frame.position.longitude]}
            icon={icon}
          >
            <Popup>
              <div className="font-mono text-[11px] leading-relaxed min-w-35">
                <div className="font-semibold text-[#e8e8e8] mb-1.5">{drone.name}</div>

                {/* Flight mode + armed */}
                <div className="text-[10px] text-[#888] mb-1">
                  {frame.flightMode}{frame.armed ? " · Armed" : ""}
                </div>

                {/* Battery */}
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-[#555]">Battery</span>
                  <span className={frame.batteryPercent < 20 ? "text-fleet-red" : frame.batteryPercent < 40 ? "text-fleet-amber" : "text-fleet-green"}>
                    {Math.round(frame.batteryPercent)}%
                  </span>
                  {frame.batteryVoltage > 0 && (
                    <span className="text-[#3a3a3a]">{frame.batteryVoltage.toFixed(1)}V</span>
                  )}
                </div>

                {/* Altitude + satellites */}
                <div className="flex items-center gap-2 text-[10px] mt-0.5">
                  {alt > 0 && (
                    <>
                      <span className="text-[#555]">Alt</span>
                      <span className="text-[#888]">{alt.toFixed(1)}m</span>
                    </>
                  )}
                  {sats != null && (
                    <>
                      <span className="text-[#3a3a3a]">·</span>
                      <span className="text-[#555]">Sats</span>
                      <span className={sats < 6 ? "text-fleet-amber" : "text-[#888]"}>{sats}</span>
                    </>
                  )}
                </div>

                {/* Link to fleet page */}
                <Link
                  href="/fleet"
                  className="block text-[10px] text-fleet-blue hover:text-[#60a5fa] mt-2 no-underline"
                >
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {bases.length === 0 && drones.length === 0 && (
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
