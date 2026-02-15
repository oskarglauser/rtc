import { z } from "zod";

export const aiStopSchema = z.object({
  item_type: z.enum(["drive", "charge", "eat", "stay", "visit", "rest"]),
  title: z.string(),
  description: z.string().optional(),
  location_name: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
  duration_minutes: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const aiDayPlanSchema = z.object({
  day_number: z.number().int().positive(),
  summary: z.string(),
  driving_km: z.number().optional(),
  driving_hours: z.number().optional(),
  stops: z.array(aiStopSchema),
});

export const aiItinerarySchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  total_distance_km: z.number().optional(),
  total_driving_hours: z.number().optional(),
  days: z.array(aiDayPlanSchema),
});

export type AIStop = z.infer<typeof aiStopSchema>;
export type AIDayPlan = z.infer<typeof aiDayPlanSchema>;
export type AIItinerary = z.infer<typeof aiItinerarySchema>;

// JSON Schema for OpenAI structured outputs
export const itineraryJsonSchema = {
  name: "itinerary",
  strict: true,
  schema: {
    type: "object" as const,
    required: ["title", "days"],
    additionalProperties: false,
    properties: {
      title: { type: "string" as const },
      description: { type: "string" as const },
      total_distance_km: { type: "number" as const },
      total_driving_hours: { type: "number" as const },
      days: {
        type: "array" as const,
        items: {
          type: "object" as const,
          required: ["day_number", "summary", "stops"],
          additionalProperties: false,
          properties: {
            day_number: { type: "integer" as const },
            summary: { type: "string" as const },
            driving_km: { type: "number" as const },
            driving_hours: { type: "number" as const },
            stops: {
              type: "array" as const,
              items: {
                type: "object" as const,
                required: ["item_type", "title", "latitude", "longitude"],
                additionalProperties: false,
                properties: {
                  item_type: {
                    type: "string" as const,
                    enum: ["drive", "charge", "eat", "stay", "visit", "rest"],
                  },
                  title: { type: "string" as const },
                  description: { type: "string" as const },
                  location_name: { type: "string" as const },
                  latitude: { type: "number" as const },
                  longitude: { type: "number" as const },
                  address: { type: "string" as const },
                  duration_minutes: { type: "integer" as const },
                  metadata: {
                    type: "object" as const,
                    additionalProperties: true,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
