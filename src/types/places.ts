export interface POI {
  id: string;
  source: string;
  name: string;
  category: string | null;
  location: { lat: number; lng: number };
  address: string | null;
  rating: number | null;
  priceLevel: number | null;
  cuisineTypes: string[];
  isKidFriendly: boolean | null;
  openingHours: Record<string, string> | null;
  photos: string[];
}

export interface PlaceSearchParams {
  lat: number;
  lng: number;
  radiusKm?: number;
  category?: "restaurant" | "hotel" | "attraction";
  keyword?: string;
}
