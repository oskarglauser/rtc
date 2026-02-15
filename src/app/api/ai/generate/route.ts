import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient } from "@/lib/ai/client";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts/system";
import { buildGeneratePrompt } from "@/lib/ai/prompts/generate";
import {
  aiItinerarySchema,
  itineraryJsonSchema,
} from "@/lib/ai/schemas/itinerary";
import { tripPreferencesSchema } from "@/types/trip";
import { createServiceRoleClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  preferences: tripPreferencesSchema.partial().default({}),
  additionalNotes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = requestSchema.parse(body);

    const openai = getOpenAIClient();
    const userPrompt = buildGeneratePrompt(input);

    // Create initial trip record
    const supabase = createServiceRoleClient();
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .insert({
        title: `${input.origin} to ${input.destination}`,
        status: "generating",
        origin_name: input.origin,
        destination_name: input.destination,
        start_date: input.startDate || null,
        end_date: input.endDate || null,
        preferences: input.preferences,
        ai_conversation: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      })
      .select("id")
      .single();

    if (tripError || !trip) {
      return NextResponse.json(
        { error: "Failed to create trip" },
        { status: 500 }
      );
    }

    // Generate with OpenAI Responses API
    const response = await openai.responses.create({
      model: "gpt-5.2",
      instructions: SYSTEM_PROMPT,
      input: userPrompt,
      text: {
        format: {
          type: "json_schema",
          ...itineraryJsonSchema,
        },
      },
      temperature: 0.7,
    });

    const content = response.output_text;
    if (!content) {
      await supabase
        .from("trips")
        .update({ status: "draft" })
        .eq("id", trip.id);
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content);
    const itinerary = aiItinerarySchema.parse(parsed);

    // Save itinerary to DB
    await supabase
      .from("trips")
      .update({
        title: itinerary.title,
        description: itinerary.description || null,
        total_distance_km: itinerary.total_distance_km || null,
        total_driving_hours: itinerary.total_driving_hours || null,
        status: "ready",
        ai_conversation: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
          { role: "assistant", content },
        ],
      })
      .eq("id", trip.id);

    // Insert days and items
    for (const day of itinerary.days) {
      const { data: dayRow } = await supabase
        .from("itinerary_days")
        .insert({
          trip_id: trip.id,
          day_number: day.day_number,
          summary: day.summary,
          driving_km: day.driving_km || null,
          driving_hours: day.driving_hours || null,
        })
        .select("id")
        .single();

      if (!dayRow) continue;

      const items = day.stops.map((stop, i) => ({
        day_id: dayRow.id,
        trip_id: trip.id,
        sort_order: i + 1,
        item_type: stop.item_type,
        title: stop.title,
        description: stop.description || null,
        location_name: stop.location_name || null,
        location: `SRID=4326;POINT(${stop.longitude} ${stop.latitude})`,
        address: stop.address || null,
        duration_minutes: stop.duration_minutes || null,
        metadata: (stop.metadata || {}) as import("@/types/database").Json,
      }));

      if (items.length > 0) {
        await supabase.from("itinerary_items").insert(items);
      }
    }

    return NextResponse.json({ tripId: trip.id });
  } catch (error) {
    console.error("Generate error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
