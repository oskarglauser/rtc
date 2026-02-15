"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Map,
  Car,
  Zap,
  Utensils,
  Bed,
  Star,
  Coffee,
  Loader2,
} from "lucide-react";
import type { Trip, ItemType } from "@/types/trip";
import { ChatInterface } from "@/components/ai/chat-interface";

export const ITEM_ICONS: Record<ItemType, React.ElementType> = {
  drive: Car,
  charge: Zap,
  eat: Utensils,
  stay: Bed,
  visit: Star,
  rest: Coffee,
};

export const ITEM_COLORS: Record<ItemType, string> = {
  drive: "text-blue-500",
  charge: "text-green-500",
  eat: "text-orange-500",
  stay: "text-purple-500",
  visit: "text-yellow-500",
  rest: "text-gray-500",
};

async function fetchTrip(tripId: string): Promise<Trip> {
  const res = await fetch(`/api/trips/${tripId}`);
  if (!res.ok) throw new Error("Failed to fetch trip");
  return res.json();
}

export function TripDetail({ tripId }: { tripId: string }) {
  const { data: trip, isLoading, error } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => fetchTrip(tripId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Trip not found or failed to load.
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      {/* Main content */}
      <div>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{trip.title}</h1>
            {trip.description && (
              <p className="mt-1 text-muted-foreground">{trip.description}</p>
            )}
            <div className="mt-2 flex gap-2">
              <Badge variant="secondary">{trip.originName}</Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="secondary">{trip.destinationName}</Badge>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/trip/${tripId}/map`}>
              <Map className="mr-2 h-4 w-4" />
              View Map
            </Link>
          </Button>
        </div>

        {/* Day-by-day timeline */}
        {trip.days.map((day) => (
          <div key={day.id} className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {day.dayNumber}
              </div>
              <div>
                <h2 className="font-semibold">Day {day.dayNumber}</h2>
                {day.summary && (
                  <p className="text-sm text-muted-foreground">{day.summary}</p>
                )}
              </div>
              {day.drivingKm && (
                <Badge variant="outline" className="ml-auto">
                  {Math.round(day.drivingKm)} km
                </Badge>
              )}
            </div>

            <div className="ml-4 border-l-2 pl-6">
              {day.items.map((item, i) => {
                const Icon = ITEM_ICONS[item.itemType] ?? Star;
                const color = ITEM_COLORS[item.itemType] ?? "text-gray-500";
                return (
                  <div key={item.id}>
                    <div className="relative flex gap-3 pb-4">
                      <div
                        className={`absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full bg-background border ${color}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <Card className="flex-1">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {item.itemType}
                            </Badge>
                            <CardTitle className="text-base">
                              {item.title}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {item.locationName && (
                              <span>{item.locationName}</span>
                            )}
                            {item.durationMinutes && (
                              <span>
                                {item.durationMinutes < 60
                                  ? `${item.durationMinutes} min`
                                  : `${Math.round(item.durationMinutes / 60 * 10) / 10} hr`}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    {i < day.items.length - 1 && <Separator className="my-2" />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Chat sidebar */}
      <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
        <ChatInterface tripId={tripId} />
      </div>
    </div>
  );
}
