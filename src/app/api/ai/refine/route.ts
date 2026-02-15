import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient } from "@/lib/ai/client";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts/system";
import {
  aiItinerarySchema,
  itineraryJsonSchema,
} from "@/lib/ai/schemas/itinerary";
import { createServiceRoleClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  tripId: z.string().uuid(),
  message: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tripId, message } = requestSchema.parse(body);

    const supabase = createServiceRoleClient();
    const openai = getOpenAIClient();

    // Load existing trip + conversation
    const { data: trip } = await supabase
      .from("trips")
      .select("id, ai_conversation")
      .eq("id", tripId)
      .single();

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const conversation = (trip.ai_conversation as Array<{ role: string; content: string }>) || [];
    conversation.push({ role: "user", content: message });

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const conversationInput = conversation
            .filter((m) => m.role !== "system")
            .map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            }));

          const stream = await openai.responses.create({
            model: "gpt-5.2",
            instructions: SYSTEM_PROMPT,
            input: conversationInput,
            text: {
              format: {
                type: "json_schema",
                ...itineraryJsonSchema,
              },
            },
            stream: true,
            temperature: 0.7,
          });

          let fullContent = "";

          for await (const event of stream) {
            if (event.type === "response.output_text.delta") {
              fullContent += event.delta;
              controller.enqueue(encoder.encode(event.delta));
            }
          }

          // Parse and save updated itinerary
          try {
            const parsed = JSON.parse(fullContent);
            const itinerary = aiItinerarySchema.parse(parsed);

            conversation.push({
              role: "assistant",
              content: fullContent,
            });

            // Delete old days + items (cascade deletes items)
            await supabase
              .from("itinerary_days")
              .delete()
              .eq("trip_id", tripId);

            // Update trip
            await supabase
              .from("trips")
              .update({
                title: itinerary.title,
                description: itinerary.description || null,
                total_distance_km: itinerary.total_distance_km || null,
                total_driving_hours: itinerary.total_driving_hours || null,
                ai_conversation: conversation,
              })
              .eq("id", tripId);

            // Re-insert days and items
            for (const day of itinerary.days) {
              const { data: dayRow } = await supabase
                .from("itinerary_days")
                .insert({
                  trip_id: tripId,
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
                trip_id: tripId,
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
          } catch (parseError) {
            console.error("Failed to parse refined itinerary:", parseError);
          }
        } catch (error) {
          console.error("Stream error:", error);
          controller.enqueue(
            encoder.encode("\n\nSorry, an error occurred during refinement.")
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Refine error:", error);
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
