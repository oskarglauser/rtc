"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronRight, X, RotateCcw } from "lucide-react";
import type { TripPreferences } from "@/types/trip";
import { evConnectorTypes } from "@/types/trip";
import { INTERESTS, DIETARY } from "@/components/trip/trip-wizard";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: TripPreferences;
  onUpdate: (partial: Partial<TripPreferences>) => void;
  onReset: () => void;
}

export function SettingsSheet({
  open,
  onOpenChange,
  preferences,
  onUpdate,
  onReset,
}: SettingsSheetProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [childAgeInput, setChildAgeInput] = useState("");

  function addChildAge() {
    const age = parseInt(childAgeInput);
    if (!isNaN(age) && age >= 0 && age <= 18) {
      onUpdate({ childrenAges: [...(preferences.childrenAges ?? []), age] });
      setChildAgeInput("");
    }
  }

  function removeChildAge(index: number) {
    onUpdate({
      childrenAges: (preferences.childrenAges ?? []).filter((_, i) => i !== index),
    });
  }

  function toggleArrayItem(key: "dietaryRestrictions" | "interests", value: string) {
    const arr = (preferences[key] ?? []) as string[];
    onUpdate({
      [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Trip Preferences</SheetTitle>
          <SheetDescription>
            Customize your road trip experience. These are saved automatically.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4">
          {/* EV Details */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              My EV
            </h3>
            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="settings-ev-make" className="text-xs">Make</Label>
                <Input
                  id="settings-ev-make"
                  placeholder="e.g. Tesla"
                  value={preferences.evMake ?? ""}
                  onChange={(e) => onUpdate({ evMake: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-ev-model" className="text-xs">Model</Label>
                <Input
                  id="settings-ev-model"
                  placeholder="e.g. Model 3 LR"
                  value={preferences.evModel ?? ""}
                  onChange={(e) => onUpdate({ evModel: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="settings-battery" className="text-xs">Battery (kWh)</Label>
                <Input
                  id="settings-battery"
                  type="number"
                  placeholder="e.g. 75"
                  value={preferences.batteryCapacityKwh ?? ""}
                  onChange={(e) =>
                    onUpdate({
                      batteryCapacityKwh: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-range" className="text-xs">Range (km)</Label>
                <Input
                  id="settings-range"
                  type="number"
                  placeholder="e.g. 500"
                  value={preferences.rangeKm ?? ""}
                  onChange={(e) =>
                    onUpdate({
                      rangeKm: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-connector" className="text-xs">Connector</Label>
              <Select
                value={preferences.connectorType ?? ""}
                onValueChange={(v) =>
                  onUpdate({ connectorType: v as TripPreferences["connectorType"] })
                }
              >
                <SelectTrigger id="settings-connector">
                  <SelectValue placeholder="Select connector type" />
                </SelectTrigger>
                <SelectContent>
                  {evConnectorTypes.map((ct) => (
                    <SelectItem key={ct} value={ct}>
                      {ct}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <Separator />

          {/* Travel Style */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Travel Style
            </h3>
            <div className="space-y-1.5">
              <Label className="text-xs">Pace</Label>
              <Select
                value={preferences.travelStyle ?? "balanced"}
                onValueChange={(v) =>
                  onUpdate({ travelStyle: v as TripPreferences["travelStyle"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relaxed">Relaxed — more stops, shorter drives</SelectItem>
                  <SelectItem value="balanced">Balanced — mix of driving and exploring</SelectItem>
                  <SelectItem value="fast">Fast — maximize distance per day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-max-driving" className="text-xs">
                Max driving hours/day: {preferences.maxDrivingHoursPerDay}
              </Label>
              <Input
                id="settings-max-driving"
                type="range"
                min={2}
                max={10}
                value={preferences.maxDrivingHoursPerDay ?? 6}
                onChange={(e) =>
                  onUpdate({ maxDrivingHoursPerDay: Number(e.target.value) })
                }
              />
            </div>
          </section>

          <Separator />

          {/* Advanced (collapsible) */}
          <section>
            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="flex w-full items-center gap-2 py-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
            >
              {advancedOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Advanced
            </button>

            {advancedOpen && (
              <div className="mt-4 space-y-6">
                {/* Children */}
                <div className="space-y-2">
                  <Label className="text-xs">Children&apos;s ages</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={18}
                      placeholder="Age"
                      value={childAgeInput}
                      onChange={(e) => setChildAgeInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addChildAge()}
                      className="w-20"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addChildAge}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(preferences.childrenAges ?? []).map((age, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {age} yr
                        <button onClick={() => removeChildAge(i)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Dietary */}
                <div className="space-y-2">
                  <Label className="text-xs">Food & Dietary</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {DIETARY.map((d) => (
                      <Badge
                        key={d}
                        variant={
                          (preferences.dietaryRestrictions ?? []).includes(d)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer text-xs"
                        onClick={() => toggleArrayItem("dietaryRestrictions", d)}
                      >
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-2">
                  <Label className="text-xs">Interests</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {INTERESTS.map((interest) => (
                      <Badge
                        key={interest}
                        variant={
                          (preferences.interests ?? []).includes(interest)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer text-xs"
                        onClick={() => toggleArrayItem("interests", interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="settings-notes" className="text-xs">Notes</Label>
                  <Textarea
                    id="settings-notes"
                    placeholder="Anything else? e.g. We want to visit the Swiss Alps..."
                    rows={3}
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        <SheetFooter>
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to defaults
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
