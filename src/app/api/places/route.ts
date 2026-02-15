import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchPlacesWithCache } from "@/lib/places/cache";

const searchSchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radiusKm: z.coerce.number().optional().default(10),
  category: z.enum(["restaurant", "hotel", "attraction"]).optional(),
  keyword: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const search = searchSchema.parse(params);

    const places = await searchPlacesWithCache(search);
    return NextResponse.json(places);
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
