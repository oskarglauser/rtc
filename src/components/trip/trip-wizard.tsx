"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ArrowLeft, Loader2, X } from "lucide-react";
import {
  type TripPreferences,
  evConnectorTypes,
} from "@/types/trip";

const WIZARD_STEPS = ["Route", "Dates", "EV Details", "Preferences"] as const;
type WizardStep = (typeof WIZARD_STEPS)[number];

export const INTERESTS = [
  "Nature",
  "History",
  "Architecture",
  "Food & Wine",
  "Beaches",
  "Mountains",
  "Museums",
  "Playgrounds",
  "Theme Parks",
  "Shopping",
];

export const DIETARY = [
  "Gluten-free",
  "Vegetarian",
  "Vegan",
  "Dairy-free",
  "Nut-free",
  "Halal",
  "Kosher",
];

export function TripWizard() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("Route");
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [preferences, setPreferences] = useState<Partial<TripPreferences>>({
    travelStyle: "balanced",
    maxDrivingHoursPerDay: 6,
    childrenAges: [],
    dietaryRestrictions: [],
    interests: [],
  });
  const [childAgeInput, setChildAgeInput] = useState("");

  const currentIndex = WIZARD_STEPS.indexOf(step);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === WIZARD_STEPS.length - 1;

  function goNext() {
    if (!isLast) setStep(WIZARD_STEPS[currentIndex + 1]);
  }

  function goBack() {
    if (!isFirst) setStep(WIZARD_STEPS[currentIndex - 1]);
  }

  function addChildAge() {
    const age = parseInt(childAgeInput);
    if (!isNaN(age) && age >= 0 && age <= 18) {
      setPreferences((p) => ({
        ...p,
        childrenAges: [...(p.childrenAges ?? []), age],
      }));
      setChildAgeInput("");
    }
  }

  function removeChildAge(index: number) {
    setPreferences((p) => ({
      ...p,
      childrenAges: (p.childrenAges ?? []).filter((_, i) => i !== index),
    }));
  }

  function toggleArrayItem(
    key: "dietaryRestrictions" | "interests",
    value: string
  ) {
    setPreferences((p) => {
      const arr = (p[key] ?? []) as string[];
      return {
        ...p,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  }

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          startDate,
          endDate,
          preferences,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate trip");

      const data = await res.json();
      router.push(`/trip/${data.tripId}`);
    } catch (error) {
      console.error("Generation failed:", error);
      setIsGenerating(false);
    }
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-1">
        {WIZARD_STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <button
              onClick={() => setStep(s)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                i <= currentIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </button>
            <span
              className={`whitespace-nowrap text-sm ${
                s === step ? "font-medium" : "text-muted-foreground"
              }`}
            >
              {s}
            </span>
            {i < WIZARD_STEPS.length - 1 && (
              <div className="mx-1 h-px w-8 bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {step === "Route" && "Where are you going?"}
            {step === "Dates" && "When are you traveling?"}
            {step === "EV Details" && "Tell us about your EV"}
            {step === "Preferences" && "Your preferences"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "Route" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="origin">Starting point</Label>
                <Input
                  id="origin"
                  placeholder="e.g. Stockholm, Sweden"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  placeholder="e.g. Rome, Italy"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </>
          )}

          {step === "Dates" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          )}

          {step === "EV Details" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="evMake">Make</Label>
                  <Input
                    id="evMake"
                    placeholder="e.g. Tesla"
                    value={preferences.evMake ?? ""}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, evMake: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evModel">Model</Label>
                  <Input
                    id="evModel"
                    placeholder="e.g. Model 3 Long Range"
                    value={preferences.evModel ?? ""}
                    onChange={(e) =>
                      setPreferences((p) => ({
                        ...p,
                        evModel: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="battery">Battery capacity (kWh)</Label>
                  <Input
                    id="battery"
                    type="number"
                    placeholder="e.g. 75"
                    value={preferences.batteryCapacityKwh ?? ""}
                    onChange={(e) =>
                      setPreferences((p) => ({
                        ...p,
                        batteryCapacityKwh: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="range">Estimated range (km)</Label>
                  <Input
                    id="range"
                    type="number"
                    placeholder="e.g. 500"
                    value={preferences.rangeKm ?? ""}
                    onChange={(e) =>
                      setPreferences((p) => ({
                        ...p,
                        rangeKm: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="connector">Connector type</Label>
                <Select
                  value={preferences.connectorType ?? ""}
                  onValueChange={(v) =>
                    setPreferences((p) => ({
                      ...p,
                      connectorType: v as TripPreferences["connectorType"],
                    }))
                  }
                >
                  <SelectTrigger>
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
            </>
          )}

          {step === "Preferences" && (
            <>
              {/* Children */}
              <div className="space-y-2">
                <Label>Children&apos;s ages</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={18}
                    placeholder="Age"
                    value={childAgeInput}
                    onChange={(e) => setChildAgeInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addChildAge()}
                    className="w-24"
                  />
                  <Button type="button" variant="outline" onClick={addChildAge}>
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

              {/* Travel style */}
              <div className="space-y-2">
                <Label>Travel style</Label>
                <Select
                  value={preferences.travelStyle ?? "balanced"}
                  onValueChange={(v) =>
                    setPreferences((p) => ({
                      ...p,
                      travelStyle: v as TripPreferences["travelStyle"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relaxed">
                      Relaxed — more stops, shorter drives
                    </SelectItem>
                    <SelectItem value="balanced">
                      Balanced — mix of driving and exploring
                    </SelectItem>
                    <SelectItem value="fast">
                      Fast — maximize distance per day
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max driving hours */}
              <div className="space-y-2">
                <Label htmlFor="maxDriving">
                  Max driving hours per day: {preferences.maxDrivingHoursPerDay}
                </Label>
                <Input
                  id="maxDriving"
                  type="range"
                  min={2}
                  max={10}
                  value={preferences.maxDrivingHoursPerDay ?? 6}
                  onChange={(e) =>
                    setPreferences((p) => ({
                      ...p,
                      maxDrivingHoursPerDay: Number(e.target.value),
                    }))
                  }
                />
              </div>

              {/* Dietary restrictions */}
              <div className="space-y-2">
                <Label>Dietary restrictions</Label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY.map((d) => (
                    <Badge
                      key={d}
                      variant={
                        (preferences.dietaryRestrictions ?? []).includes(d)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() =>
                        toggleArrayItem("dietaryRestrictions", d)
                      }
                    >
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-2">
                <Label>Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <Badge
                      key={interest}
                      variant={
                        (preferences.interests ?? []).includes(interest)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem("interests", interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Additional notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Anything else?</Label>
                <Textarea
                  id="notes"
                  placeholder="E.g. We want to visit the Swiss Alps, avoid toll roads, etc."
                  rows={3}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={isFirst}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {isLast ? (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !origin || !destination}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate Itinerary
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button onClick={goNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
