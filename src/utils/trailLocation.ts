import type { Segment } from "../types";

const EARTH_RADIUS_M = 6_371_000;

/** Haversine distance between two WGS84 points in metres. */
export function haversineDistanceM(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

export interface NearestOnTrail {
  segmentId: number;
  distanceMeters: number;
}

/** Find the segment whose trackpoints are closest to the given position. */
export function findNearestSegment(
  segments: Segment[],
  lat: number,
  lon: number,
): NearestOnTrail | null {
  if (segments.length === 0) return null;

  let bestSegmentId = segments[0].id;
  let bestDistance = Infinity;

  for (const seg of segments) {
    for (const pt of seg.points) {
      const d = haversineDistanceM(lat, lon, pt.lat, pt.lon);
      if (d < bestDistance) {
        bestDistance = d;
        bestSegmentId = seg.id;
      }
    }
  }

  return { segmentId: bestSegmentId, distanceMeters: bestDistance };
}

/** Distance in metres beyond which the user is considered off-trail. */
export const OFF_TRAIL_THRESHOLD_M = 500;

/** Format a distance for compact UI (e.g. "450 m", "1.2 km"). */
export function formatDistanceShort(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Show "X to trail" hint only when reasonably close. */
export const NEAR_TRAIL_HINT_M = 1_000;
