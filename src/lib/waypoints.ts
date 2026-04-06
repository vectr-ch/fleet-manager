export interface LatLng {
  lat: number;
  lng: number;
}

export interface WaypointParams {
  spacingM: number;
  altitudeM: number;
  speedMS: number;
}

export interface GeneratedWaypoint {
  lat: number;
  lng: number;
  altitude_m: number;
  speed_ms: number;
  index: number;
}

export function generateWaypoints(
  polygon: LatLng[],
  params: WaypointParams
): GeneratedWaypoint[] {
  if (polygon.length < 3 || params.spacingM <= 0) return [];

  let minLat = polygon[0].lat, maxLat = polygon[0].lat;
  for (const p of polygon) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
  }

  const spacingDeg = params.spacingM / 111320;
  const waypoints: GeneratedWaypoint[] = [];
  let idx = 0;
  let leftToRight = true;

  for (let lat = minLat; lat <= maxLat; lat += spacingDeg) {
    const intersections = scanLineIntersections(polygon, lat);
    if (intersections.length < 2) continue;
    intersections.sort((a, b) => a - b);

    for (let i = 0; i + 1 < intersections.length; i += 2) {
      let startLng = intersections[i];
      let endLng = intersections[i + 1];
      if (!leftToRight) [startLng, endLng] = [endLng, startLng];

      waypoints.push(
        { lat, lng: startLng, altitude_m: params.altitudeM, speed_ms: params.speedMS, index: idx },
        { lat, lng: endLng, altitude_m: params.altitudeM, speed_ms: params.speedMS, index: idx + 1 }
      );
      idx += 2;
    }
    leftToRight = !leftToRight;
  }

  return waypoints;
}

function scanLineIntersections(polygon: LatLng[], lat: number): number[] {
  const xs: number[] = [];
  const n = polygon.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    let a = polygon[i], b = polygon[j];
    if (a.lat > b.lat) [a, b] = [b, a];
    if (lat < a.lat || lat >= b.lat) continue;
    const t = (lat - a.lat) / (b.lat - a.lat);
    xs.push(a.lng + t * (b.lng - a.lng));
  }
  return xs;
}
