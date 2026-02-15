"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, MessageSquare, Star } from "lucide-react";
import type { Trip, ItemType } from "@/types/trip";
import { ITEM_ICONS, ITEM_COLORS } from "@/components/trip/trip-detail";

interface ItineraryPanelProps {
  trip: Trip;
  onClose: () => void;
}

export function ItineraryPanel({ trip, onClose }: ItineraryPanelProps) {
  return (
    <div className="absolute inset-y-0 left-0 z-30 flex w-[420px] max-w-[calc(100vw-2rem)] flex-col bg-background/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/90 border-r">
      {/* Header */}
      <div className="flex items-start gap-3 border-b p-4">
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg leading-tight">{trip.title}</h2>
          {trip.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {trip.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2 text-xs">
            <Badge variant="secondary">{trip.originName}</Badge>
            <span className="text-muted-foreground">&rarr;</span>
            <Badge variant="secondary">{trip.destinationName}</Badge>
          </div>
          {trip.totalDistanceKm && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              {Math.round(trip.totalDistanceKm)} km total
              {trip.totalDrivingHours &&
                ` \u00B7 ~${Math.round(trip.totalDrivingHours)} hr driving`}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 -mr-2 -mt-1">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Day-by-day timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {trip.days.map((day) => (
          <div key={day.id}>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {day.dayNumber}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">Day {day.dayNumber}</h3>
                {day.summary && (
                  <p className="text-xs text-muted-foreground truncate">{day.summary}</p>
                )}
              </div>
              {day.drivingKm && (
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {Math.round(day.drivingKm)} km
                </Badge>
              )}
            </div>

            <div className="ml-3.5 border-l-2 pl-5 space-y-2">
              {day.items.map((item, i) => {
                const Icon = ITEM_ICONS[item.itemType] ?? Star;
                const color = ITEM_COLORS[item.itemType] ?? "text-gray-500";
                return (
                  <div key={item.id}>
                    <div className="relative flex gap-2">
                      <div
                        className={`absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full bg-background border ${color}`}
                      >
                        <Icon className="h-3 w-3" />
                      </div>
                      <Card className="flex-1">
                        <CardHeader className="p-3 pb-1">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {item.itemType}
                            </Badge>
                            <CardTitle className="text-sm leading-tight">
                              {item.title}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                            {item.locationName && <span>{item.locationName}</span>}
                            {item.durationMinutes && (
                              <span>
                                {item.durationMinutes < 60
                                  ? `${item.durationMinutes} min`
                                  : `${Math.round((item.durationMinutes / 60) * 10) / 10} hr`}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    {i < day.items.length - 1 && <Separator className="my-1.5" />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <Button variant="outline" className="w-full gap-2" asChild>
          <a href={`/trip/${trip.id}`}>
            <MessageSquare className="h-4 w-4" />
            Refine with AI
          </a>
        </Button>
      </div>
    </div>
  );
}
