export const MAP_CONFIG = {
  // OpenFreeMap — clean, detailed OSM style, free, no API key
  styleUrl: "https://tiles.openfreemap.org/styles/liberty",
  defaultCenter: [18.07, 59.33] as [number, number], // Stockholm fallback
  defaultZoom: 4,
  homeZoom: 6, // Regional view when geolocated
  maxZoom: 18,
  minZoom: 2,
};

export const MARKER_COLORS: Record<string, string> = {
  drive: "#3b82f6",
  charge: "#22c55e",
  eat: "#f97316",
  stay: "#a855f7",
  visit: "#eab308",
  rest: "#6b7280",
};
