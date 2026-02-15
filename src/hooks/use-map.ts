"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { Map as MaplibreMap } from "maplibre-gl";

export function useMap(containerRef: React.RefObject<HTMLDivElement | null>) {
  const mapRef = useRef<MaplibreMap | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    async function init() {
      const maplibregl = await import("maplibre-gl");

      if (cancelled || !containerRef.current) return;

      const map = new maplibregl.default.Map({
        container: containerRef.current,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [18.07, 59.33],
        zoom: 4,
      });

      map.addControl(new maplibregl.default.NavigationControl());

      map.on("load", () => {
        if (!cancelled) setIsLoaded(true);
      });

      mapRef.current = map;
    }

    init();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      setIsLoaded(false);
    };
  }, [containerRef]);

  const fitBounds = useCallback(
    async (coordinates: [number, number][], padding = 50) => {
      const map = mapRef.current;
      if (!map || coordinates.length === 0) return;

      const maplibregl = await import("maplibre-gl");

      if (coordinates.length === 1) {
        map.setCenter(coordinates[0]);
        map.setZoom(12);
        return;
      }

      const bounds = coordinates.reduce(
        (b, coord) => b.extend(coord),
        new maplibregl.default.LngLatBounds(coordinates[0], coordinates[0])
      );
      map.fitBounds(bounds, { padding });
    },
    []
  );

  return { map: mapRef.current, isLoaded, fitBounds };
}
