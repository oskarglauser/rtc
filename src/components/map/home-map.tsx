"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Map as MaplibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_CONFIG, MARKER_COLORS } from "@/lib/maps/config";
import type { Trip } from "@/types/trip";

interface HomeMapProps {
  center: { lat: number; lng: number } | null;
  trip?: Trip | null;
}

export function HomeMap({ center, trip }: HomeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markersRef = useRef<unknown[]>([]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    async function init() {
      const maplibregl = await import("maplibre-gl");
      if (cancelled || !containerRef.current) return;

      const map = new maplibregl.default.Map({
        container: containerRef.current,
        style: MAP_CONFIG.styleUrl,
        center: center
          ? [center.lng, center.lat]
          : MAP_CONFIG.defaultCenter,
        zoom: center ? MAP_CONFIG.homeZoom : MAP_CONFIG.defaultZoom,
      });

      map.addControl(new maplibregl.default.NavigationControl(), "bottom-right");
      mapRef.current = map;
    }

    init();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Only init once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center when geolocation resolves
  useEffect(() => {
    if (!center || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [center.lng, center.lat],
      zoom: MAP_CONFIG.homeZoom,
      duration: 1500,
    });
  }, [center]);

  // Render trip route + markers
  const renderTrip = useCallback(async (tripData: Trip) => {
    const map = mapRef.current;
    if (!map) return;

    const maplibregl = await import("maplibre-gl");

    // Clear previous markers
    for (const m of markersRef.current) {
      (m as { remove: () => void }).remove();
    }
    markersRef.current = [];

    // Remove previous route layer/source
    if (map.getLayer("route")) map.removeLayer("route");
    if (map.getSource("route")) map.removeSource("route");

    const coordinates: [number, number][] = [];
    for (const day of tripData.days) {
      for (const item of day.items) {
        if (item.location) {
          coordinates.push([item.location.lng, item.location.lat]);
        }
      }
    }

    if (coordinates.length === 0) return;

    // Route line
    if (coordinates.length >= 2) {
      const coordString = coordinates.map((c) => `${c[0]},${c[1]}`).join(";");
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`
        );
        const data = await res.json();
        if (data.routes?.[0]?.geometry) {
          map.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: data.routes[0].geometry,
            },
          });
          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#3b82f6", "line-width": 4, "line-opacity": 0.8 },
          });
        }
      } catch {
        // Fallback: straight lines
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates },
          },
        });
        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          paint: { "line-color": "#3b82f6", "line-width": 3, "line-dasharray": [2, 2] },
        });
      }
    }

    // Markers
    for (const day of tripData.days) {
      for (const item of day.items) {
        if (!item.location) continue;

        const el = document.createElement("div");
        el.style.cssText = `
          width: 24px; height: 24px; border-radius: 50%;
          background: ${MARKER_COLORS[item.itemType] ?? "#6b7280"};
          border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        `;

        const popup = new maplibregl.default.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 4px">
            <strong>${item.title}</strong>
            ${item.description ? `<p style="margin:4px 0 0;font-size:12px;color:#666">${item.description}</p>` : ""}
          </div>
        `);

        const marker = new maplibregl.default.Marker({ element: el })
          .setLngLat([item.location.lng, item.location.lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      }
    }

    // Fit bounds
    if (coordinates.length >= 2) {
      const bounds = coordinates.reduce(
        (b, coord) => b.extend(coord),
        new maplibregl.default.LngLatBounds(coordinates[0], coordinates[0])
      );
      map.fitBounds(bounds, { padding: 80 });
    } else if (coordinates.length === 1) {
      map.setCenter(coordinates[0]);
      map.setZoom(12);
    }
  }, []);

  // When trip data changes, render it
  useEffect(() => {
    if (!trip || !mapRef.current) return;

    const map = mapRef.current;
    if (map.isStyleLoaded()) {
      renderTrip(trip);
    } else {
      map.on("load", () => renderTrip(trip));
    }
  }, [trip, renderTrip]);

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-3.5rem)] w-full"
    />
  );
}
