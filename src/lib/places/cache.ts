import { createServiceRoleClient } from "@/lib/supabase/server";
import type { POI, PlaceSearchParams } from "@/types/places";
import type { Database, Json } from "@/types/database";
import { searchGooglePlaces } from "./google-places";

type POICacheRow = Database["public"]["Tables"]["poi_cache"]["Row"];

function rowToPOI(row: POICacheRow): POI {
  const loc = row.location as { coordinates?: [number, number] } | null;
  return {
    id: row.id,
    source: row.source,
    name: row.name,
    category: row.category,
    location: loc?.coordinates
      ? { lng: loc.coordinates[0], lat: loc.coordinates[1] }
      : { lat: 0, lng: 0 },
    address: row.address,
    rating: row.rating,
    priceLevel: row.price_level,
    cuisineTypes: row.cuisine_types ?? [],
    isKidFriendly: row.is_kid_friendly,
    openingHours: (row.opening_hours as Record<string, string>) ?? null,
    photos: ((row.photos as string[]) ?? []),
  };
}

export async function searchPlacesWithCache(
  params: PlaceSearchParams
): Promise<POI[]> {
  const supabase = createServiceRoleClient();

  // Check cache: search within radius using PostGIS
  const radiusM = (params.radiusKm ?? 10) * 1000;
  const point = `SRID=4326;POINT(${params.lng} ${params.lat})`;

  const { data: cached } = await supabase
    .from("poi_cache")
    .select()
    .filter("expires_at", "gt", new Date().toISOString());

  // If we have enough cached results, return them
  const cachedRows = (cached ?? []) as POICacheRow[];
  if (cachedRows.length >= 5) {
    // Filter by distance on the client side (PostGIS ST_DWithin would be better but
    // requires an RPC function)
    const nearby = cachedRows.filter((row) => {
      const loc = row.location as { coordinates?: [number, number] } | null;
      if (!loc?.coordinates) return false;
      const dlat = loc.coordinates[1] - params.lat;
      const dlng = loc.coordinates[0] - params.lng;
      const approxDistM = Math.sqrt(dlat ** 2 + dlng ** 2) * 111000;
      return approxDistM < radiusM;
    });

    if (nearby.length >= 5) {
      return nearby.map(rowToPOI);
    }
  }

  // Fetch from Google Places
  const places = await searchGooglePlaces(params);

  // Cache results
  if (places.length > 0) {
    const rows = places.map((p) => ({
      id: p.id,
      source: p.source,
      name: p.name,
      category: p.category,
      location: `SRID=4326;POINT(${p.location.lng} ${p.location.lat})` as unknown,
      address: p.address,
      rating: p.rating,
      price_level: p.priceLevel,
      cuisine_types: p.cuisineTypes,
      is_kid_friendly: p.isKidFriendly,
      opening_hours: p.openingHours as Json,
      photos: p.photos as unknown as Json,
      raw_data: null,
    }));

    await supabase.from("poi_cache").upsert(rows, { onConflict: "id" });
  }

  return places;
}
