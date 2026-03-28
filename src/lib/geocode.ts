const NOMINATIM_URL =
  process.env.NEXT_PUBLIC_NOMINATIM_URL ?? "https://nominatim.openstreetmap.org";

export interface GeocodingResult {
  display_name: string;
  lat: number;
  lng: number;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

/**
 * Client-side geocoding via Nominatim.
 * Calls are made directly from the browser so rate limits are per-user IP.
 */
export async function geocodeSearch(query: string): Promise<GeocodingResult[]> {
  if (!query.trim()) return [];

  try {
    const params = new URLSearchParams({
      q: query,
      format: "json",
      limit: "5",
    });

    const res = await fetch(`${NOMINATIM_URL}/search?${params}`, {
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) return [];

    const data: NominatimResult[] = await res.json();

    return data.map((r) => ({
      display_name: r.display_name,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    }));
  } catch {
    return [];
  }
}
