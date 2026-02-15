import { z } from "zod";

export const itemTypes = [
  "drive",
  "charge",
  "eat",
  "stay",
  "visit",
  "rest",
] as const;

export type ItemType = (typeof itemTypes)[number];

export const tripStatusValues = [
  "draft",
  "generating",
  "ready",
  "archived",
] as const;

export type TripStatus = (typeof tripStatusValues)[number];

export const evConnectorTypes = [
  "CCS",
  "CHAdeMO",
  "Type 2",
  "Tesla",
] as const;

export type EVConnectorType = (typeof evConnectorTypes)[number];

export const tripPreferencesSchema = z.object({
  evMake: z.string().optional(),
  evModel: z.string().optional(),
  batteryCapacityKwh: z.coerce.number().positive().optional(),
  rangeKm: z.coerce.number().positive().optional(),
  connectorType: z.enum(evConnectorTypes).optional(),
  childrenAges: z.array(z.coerce.number().int().min(0).max(18)).default([]),
  dietaryRestrictions: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  travelStyle: z
    .enum(["relaxed", "balanced", "fast"])
    .default("balanced"),
  maxDrivingHoursPerDay: z.coerce.number().min(1).max(12).default(6),
});

export type TripPreferences = z.infer<typeof tripPreferencesSchema>;

export interface Trip {
  id: string;
  title: string;
  description: string | null;
  status: TripStatus;
  startDate: string | null;
  endDate: string | null;
  originName: string;
  originLocation: { lat: number; lng: number } | null;
  destinationName: string;
  destinationLocation: { lat: number; lng: number } | null;
  totalDistanceKm: number | null;
  totalDrivingHours: number | null;
  preferences: TripPreferences;
  createdAt: string;
  updatedAt: string;
  days: ItineraryDay[];
}

export interface ItineraryDay {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string | null;
  summary: string | null;
  drivingKm: number | null;
  drivingHours: number | null;
  items: ItineraryItem[];
}

export interface ItineraryItem {
  id: string;
  dayId: string;
  tripId: string;
  sortOrder: number;
  itemType: ItemType;
  title: string;
  description: string | null;
  locationName: string | null;
  location: { lat: number; lng: number } | null;
  address: string | null;
  arrivalTime: string | null;
  departureTime: string | null;
  durationMinutes: number | null;
  metadata: Record<string, unknown>;
  externalUrl: string | null;
  imageUrl: string | null;
}
