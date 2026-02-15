"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { Map as MaplibreMap } from "maplibre-gl";
import type { Trip } from "@/types/trip";

async function fetchTrip(tripId: string): Promise<Trip> {
  const res = await fetch(`/api/trips/${tripId}`);
  if (!res.ok) throw new Error("Failed to fetch trip");
  return res.json();
}

export function TripMap({ tripId }: { tripId: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);

  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => fetchTrip(tripId),
  });

  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !trip) return;

    let cancelled = false;

    const tripData = trip;

    async function initMap() {
      const maplibregl = await import("maplibre-gl");

      if (cancelled || !mapContainer.current) return;

      const map = new maplibregl.default.Map({
        container: mapContainer.current,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [18.07, 59.33], // Stockholm default
        zoom: 4,
      });

      map.addControl(new maplibregl.default.NavigationControl());
      mapRef.current = map;

      // Collect all coordinates from itinerary items
      const coordinates: [number, number][] = [];
      for (const day of tripData.days) {
        for (const item of day.items) {
          if (item.location) {
            coordinates.push([item.location.lng, item.location.lat]);
          }
        }
      }

      if (coordinates.length === 0) return;

      map.on("load", async () => {
        // Add route line
        if (coordinates.length >= 2) {
          // Fetch actual route from OSRM
          const coordString = coordinates
            .map((c) => `${c[0]},${c[1]}`)
            .join(";");
          try {
            const routeRes = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`
            );
            const routeData = await routeRes.json();

            if (routeData.routes?.[0]?.geometry) {
              map.addSource("route", {
                type: "geojson",
                data: {
                  type: "Feature",
                  properties: {},
                  geometry: routeData.routes[0].geometry,
                },
              });

              map.addLayer({
                id: "route",
                type: "line",
                source: "route",
                layout: { "line-join": "round", "line-cap": "round" },
                paint: {
                  "line-color": "#3b82f6",
                  "line-width": 4,
                  "line-opacity": 0.8,
                },
              });
            }
          } catch {
            // Fallback: draw straight lines between points
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
              paint: {
                "line-color": "#3b82f6",
                "line-width": 3,
                "line-dasharray": [2, 2],
              },
            });
          }
        }

        // Add markers for each stop
        for (const day of tripData.days) {
          for (const item of day.items) {
            if (!item.location) continue;

            const colors: Record<string, string> = {
              drive: "#3b82f6",
              charge: "#22c55e",
              eat: "#f97316",
              stay: "#a855f7",
              visit: "#eab308",
              rest: "#6b7280",
            };

            const el = document.createElement("div");
            el.className = "map-marker";
            el.style.cssText = `
              width: 24px; height: 24px; border-radius: 50%;
              background: ${colors[item.itemType] ?? "#6b7280"};
              border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              cursor: pointer;
            `;

            const popup = new maplibregl.default.Popup({ offset: 25 }).setHTML(`
              <div style="padding: 4px">
                <strong>${item.title}</strong>
                ${item.description ? `<p style="margin:4px 0 0;font-size:12px;color:#666">${item.description}</p>` : ""}
              </div>
            `);

            new maplibregl.default.Marker({ element: el })
              .setLngLat([item.location.lng, item.location.lat])
              .setPopup(popup)
              .addTo(map);
          }
        }

        // Fit bounds
        if (coordinates.length >= 2) {
          const bounds = coordinates.reduce(
            (b, coord) => b.extend(coord as [number, number]),
            new maplibregl.default.LngLatBounds(coordinates[0], coordinates[0])
          );
          map.fitBounds(bounds, { padding: 50 });
        } else if (coordinates.length === 1) {
          map.setCenter(coordinates[0]);
          map.setZoom(12);
        }
      });
    }

    initMap();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [trip]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <div ref={mapContainer} className="h-full w-full" />;
}
