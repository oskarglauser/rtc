import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchOCMStations } from "@/lib/charging/ocm-client";
import { searchNOBILStations } from "@/lib/charging/nobil-client";
import type { ChargingStation } from "@/types/charging";

const searchSchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radiusKm: z.coerce.number().optional().default(25),
  minPowerKw: z.coerce.number().optional(),
  connectorType: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const search = searchSchema.parse(params);

    // Fetch from both sources in parallel
    const [ocmStations, nobilStations] = await Promise.all([
      searchOCMStations(search),
      searchNOBILStations(search),
    ]);

    // Deduplicate by proximity (within 50m)
    const all: ChargingStation[] = [...ocmStations];
    for (const nobil of nobilStations) {
      const isDuplicate = all.some(
        (existing) =>
          Math.abs(existing.location.lat - nobil.location.lat) < 0.0005 &&
          Math.abs(existing.location.lng - nobil.location.lng) < 0.0005
      );
      if (!isDuplicate) all.push(nobil);
    }

    return NextResponse.json(all);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
