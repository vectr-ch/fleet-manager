"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Search, X, Crosshair } from "lucide-react";
import dynamic from "next/dynamic";
import { geocodeSearch, type GeocodingResult } from "@/lib/geocode";
import { ActionButton } from "./action-button";

// ── Types ────────────────────────────────────────────────────────────────────

interface LocationPickerModalProps {
  initialLat?: number;
  initialLng?: number;
  onConfirm: (lat: number, lng: number) => void;
  onCancel: () => void;
}

// ── Dynamic map import (avoids SSR, loads Leaflet CSS properly) ──────────────

const LocationPickerMap = dynamic(
  () => import("./location-picker-map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-[#0a0a0a]">
        <span className="font-mono text-[11px] text-[#3a3a3a]">Loading map...</span>
      </div>
    ),
  },
);

// ── Search results dropdown ──────────────────────────────────────────────────

function SearchResults({
  results,
  onSelect,
}: {
  results: GeocodingResult[];
  onSelect: (r: GeocodingResult) => void;
}) {
  if (results.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-[10000] mt-1 bg-[#0f0f0f] border border-[#252525] rounded-md shadow-xl overflow-hidden max-h-48 overflow-y-auto">
      {results.map((r, i) => (
        <button
          key={i}
          onClick={() => onSelect(r)}
          className="w-full text-left px-3 py-2 text-[11px] text-[#888] hover:bg-[#1a1a1a] hover:text-foreground transition-colors border-b border-[#1a1a1a] last:border-0 flex items-start gap-2"
        >
          <MapPin className="size-3 text-[#3a3a3a] shrink-0 mt-0.5" />
          <span className="line-clamp-2">{r.display_name}</span>
        </button>
      ))}
    </div>
  );
}

// ── Main modal ───────────────────────────────────────────────────────────────

export function LocationPickerModal({
  initialLat,
  initialLng,
  onConfirm,
  onCancel,
}: LocationPickerModalProps) {
  const hasInitial =
    initialLat !== undefined &&
    initialLng !== undefined &&
    !isNaN(initialLat) &&
    !isNaN(initialLng);

  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(
    hasInitial ? { lat: initialLat!, lng: initialLng! } : null,
  );
  const [flyTo, setFlyTo] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const res = await geocodeSearch(value);
      setResults(res);
      setIsSearching(false);
    }, 300);
  }, []);

  // Close results on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (r: GeocodingResult) => {
    setPin({ lat: r.lat, lng: r.lng });
    setFlyTo({ lat: r.lat, lng: r.lng, zoom: 14 });
    setResults([]);
    setQuery(r.display_name);
  };

  const handlePinChange = (lat: number, lng: number) => {
    setPin({ lat, lng });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f0f0f] border border-[#252525] rounded-lg w-full max-w-2xl mx-4 shadow-2xl overflow-visible flex flex-col">
        {/* Header */}
        <div className="px-5 py-3 border-b border-[#1a1a1a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 text-foreground" />
            <span className="font-mono text-[10px] tracking-[.08em] text-foreground uppercase font-medium">
              Choose Location
            </span>
          </div>
          <button
            onClick={onCancel}
            className="text-[#555] hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-[#1a1a1a] shrink-0 relative z-20">
          <div ref={searchRef} className="relative z-20">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#3a3a3a]" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search address or place..."
                className="w-full bg-[#080808] border border-[#1a1a1a] rounded-md pl-8 pr-3 py-2 font-mono text-[12px] text-foreground placeholder:text-[#3a3a3a] focus:outline-none focus:border-[#555] focus:ring-1 focus:ring-[#555]/25 transition-all"
              />
              {isSearching && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <div className="size-3.5 border-2 border-[#252525] border-t-[#666] rounded-full animate-spin" />
                </div>
              )}
            </div>
            <SearchResults results={results} onSelect={handleSelectResult} />
          </div>
        </div>

        {/* Map */}
        <div className="h-[400px] relative z-0 overflow-hidden">
          <LocationPickerMap pin={pin} onPinChange={handlePinChange} flyTo={flyTo} />
        </div>

        {/* Coordinate readout + footer */}
        <div className="px-5 py-3 border-t border-[#1a1a1a] flex items-center justify-between shrink-0">
          <div>
            {pin ? (
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <Crosshair className="size-3 text-[#3a3a3a]" />
                <span className="text-[#555]">LAT</span>
                <span className="text-foreground font-medium">
                  {pin.lat.toFixed(6)}
                </span>
                <span className="text-[#252525]">|</span>
                <span className="text-[#555]">LNG</span>
                <span className="text-foreground font-medium">
                  {pin.lng.toFixed(6)}
                </span>
              </div>
            ) : (
              <span className="font-mono text-[10px] text-[#3a3a3a]">
                Click the map to place a pin
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ActionButton onClick={onCancel}>Cancel</ActionButton>
            <ActionButton
              variant="primary"
              icon={<MapPin className="size-3" />}
              onClick={() => pin && onConfirm(pin.lat, pin.lng)}
              disabled={!pin}
            >
              Confirm Location
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
