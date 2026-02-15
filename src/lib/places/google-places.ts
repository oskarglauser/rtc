import type { POI, PlaceSearchParams } from "@/types/places";

const PLACES_BASE = "https://maps.googleapis.com/maps/api/place";

interface GooglePlaceResult {
  place_id: string;
  name: string;
  geometry: { location: { lat: number; lng: number } };
  vicinity?: string;
  formatted_address?: string;
  rating?: number;
  price_level?: number;
  types?: string[];
  photos?: Array<{ photo_reference: string }>;
  opening_hours?: { open_now?: boolean; weekday_text?: string[] };
}

const CATEGORY_TYPE_MAP: Record<string, string> = {
  restaurant: "restaurant",
  hotel: "lodging",
  attraction: "tourist_attraction",
};

export async function searchGooglePlaces(
  params: PlaceSearchParams
): Promise<POI[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

  const type = params.category ? CATEGORY_TYPE_MAP[params.category] : undefined;
  const radiusM = (params.radiusKm ?? 10) * 1000;

  const searchParams = new URLSearchParams({
    key: apiKey,
    location: `${params.lat},${params.lng}`,
    radius: String(radiusM),
    ...(type && { type }),
    ...(params.keyword && { keyword: params.keyword }),
  });

  try {
    const res = await fetch(
      `${PLACES_BASE}/nearbysearch/json?${searchParams}`
    );
    if (!res.ok) return [];

    const data = await res.json();
    if (data.status !== "OK") return [];

    return (data.results as GooglePlaceResult[]).map((place) =>
      normalizePlaceResult(place, params.category ?? null)
    );
  } catch {
    return [];
  }
}

function normalizePlaceResult(
  place: GooglePlaceResult,
  category: string | null
): POI {
  const cuisineTypes =
    place.types
      ?.filter(
        (t) =>
          !["point_of_interest", "establishment", "food", "restaurant"].includes(
            t
          )
      )
      .slice(0, 3) ?? [];

  const isKidFriendly =
    place.types?.some((t) =>
      ["amusement_park", "park", "zoo", "aquarium", "playground"].includes(t)
    ) ?? null;

  return {
    id: `google-${place.place_id}`,
    source: "google",
    name: place.name,
    category,
    location: {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
    },
    address: place.vicinity ?? place.formatted_address ?? null,
    rating: place.rating ?? null,
    priceLevel: place.price_level ?? null,
    cuisineTypes,
    isKidFriendly,
    openingHours: place.opening_hours?.weekday_text
      ? Object.fromEntries(
          place.opening_hours.weekday_text.map((t, i) => [String(i), t])
        )
      : null,
    photos: (place.photos ?? [])
      .slice(0, 3)
      .map(
        (p) =>
          `${PLACES_BASE}/photo?maxwidth=400&photo_reference=${p.photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
      ),
  };
}
