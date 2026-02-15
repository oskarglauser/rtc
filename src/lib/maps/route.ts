const OSRM_BASE = process.env.OSRM_BASE_URL || "https://router.project-osrm.org";

export interface OSRMRoute {
  geometry: GeoJSON.LineString;
  distance: number; // meters
  duration: number; // seconds
}

export async function fetchDrivingRoute(
  coordinates: [number, number][]
): Promise<OSRMRoute | null> {
  if (coordinates.length < 2) return null;

  const coordString = coordinates.map((c) => `${c[0]},${c[1]}`).join(";");
  const url = `${OSRM_BASE}/route/v1/driving/${coordString}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) return null;

    return {
      geometry: route.geometry,
      distance: route.distance,
      duration: route.duration,
    };
  } catch {
    return null;
  }
}

export function buildGeoJSONFromCoordinates(
  coordinates: [number, number][]
): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates,
    },
  };
}
