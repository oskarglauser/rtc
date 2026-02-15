import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { Trip, ItineraryDay, ItineraryItem } from "@/types/trip";

type TripRow = Database["public"]["Tables"]["trips"]["Row"];
type DayRow = Database["public"]["Tables"]["itinerary_days"]["Row"];
type ItemRow = Database["public"]["Tables"]["itinerary_items"]["Row"];

interface RouteParams {
  params: Promise<{ tripId: string }>;
}

function parseLocation(loc: unknown): { lat: number; lng: number } | null {
  if (!loc || typeof loc !== "object") return null;
  const g = loc as Record<string, unknown>;
  if (
    g.type === "Point" &&
    Array.isArray(g.coordinates) &&
    g.coordinates.length >= 2
  ) {
    return { lng: g.coordinates[0] as number, lat: g.coordinates[1] as number };
  }
  if (typeof g.lat === "number" && typeof g.lng === "number") {
    return { lat: g.lat, lng: g.lng };
  }
  return null;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { tripId } = await params;
    const supabase = createServiceRoleClient();

    const { data: tripRow, error: tripError } = await supabase
      .from("trips")
      .select()
      .eq("id", tripId)
      .single();

    if (tripError || !tripRow) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const { data: dayRows } = await supabase
      .from("itinerary_days")
      .select()
      .eq("trip_id", tripId)
      .order("day_number");

    const { data: itemRows } = await supabase
      .from("itinerary_items")
      .select()
      .eq("trip_id", tripId)
      .order("sort_order");

    const tr = tripRow as TripRow;
    const dRows = (dayRows ?? []) as DayRow[];
    const iRows = (itemRows ?? []) as ItemRow[];

    const days: ItineraryDay[] = dRows.map((day) => {
      const dayItems: ItineraryItem[] = iRows
        .filter((item) => item.day_id === day.id)
        .map((item) => ({
          id: item.id,
          dayId: item.day_id,
          tripId: item.trip_id,
          sortOrder: item.sort_order,
          itemType: item.item_type as ItineraryItem["itemType"],
          title: item.title,
          description: item.description,
          locationName: item.location_name,
          location: parseLocation(item.location),
          address: item.address,
          arrivalTime: item.arrival_time,
          departureTime: item.departure_time,
          durationMinutes: item.duration_minutes,
          metadata: (item.metadata as Record<string, unknown>) ?? {},
          externalUrl: item.external_url,
          imageUrl: item.image_url,
        }));

      return {
        id: day.id,
        tripId: day.trip_id,
        dayNumber: day.day_number,
        date: day.date,
        summary: day.summary,
        drivingKm: day.driving_km,
        drivingHours: day.driving_hours,
        items: dayItems,
      };
    });

    const trip: Trip = {
      id: tr.id,
      title: tr.title,
      description: tr.description,
      status: tr.status as Trip["status"],
      startDate: tr.start_date,
      endDate: tr.end_date,
      originName: tr.origin_name ?? "",
      originLocation: parseLocation(tr.origin_location),
      destinationName: tr.destination_name ?? "",
      destinationLocation: parseLocation(tr.destination_location),
      totalDistanceKm: tr.total_distance_km,
      totalDrivingHours: tr.total_driving_hours,
      preferences: (tr.preferences as Trip["preferences"]) ?? {},
      createdAt: tr.created_at,
      updatedAt: tr.updated_at,
      days,
    };

    return NextResponse.json(trip);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { tripId } = await params;
    const supabase = createServiceRoleClient();

    const { error } = await supabase
      .from("trips")
      .delete()
      .eq("id", tripId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
