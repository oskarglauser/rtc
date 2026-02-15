import type { TripPreferences } from "@/types/trip";

interface GeneratePromptInput {
  origin: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  preferences: Partial<TripPreferences>;
  additionalNotes?: string;
}

export function buildGeneratePrompt(input: GeneratePromptInput): string {
  const {
    origin,
    destination,
    startDate,
    endDate,
    preferences,
    additionalNotes,
  } = input;

  const parts: string[] = [
    `Plan a road trip from **${origin}** to **${destination}**.`,
  ];

  if (startDate && endDate) {
    parts.push(`Travel dates: ${startDate} to ${endDate}.`);
  } else if (startDate) {
    parts.push(`Starting: ${startDate}. Plan a reasonable number of days.`);
  } else {
    parts.push(`Plan a reasonable number of days for this distance.`);
  }

  if (preferences.evMake || preferences.evModel) {
    parts.push(
      `Vehicle: ${[preferences.evMake, preferences.evModel].filter(Boolean).join(" ")}.`
    );
  }
  if (preferences.batteryCapacityKwh) {
    parts.push(`Battery: ${preferences.batteryCapacityKwh} kWh.`);
  }
  if (preferences.rangeKm) {
    parts.push(`Estimated range: ${preferences.rangeKm} km (real-world).`);
  }
  if (preferences.connectorType) {
    parts.push(`Connector: ${preferences.connectorType}.`);
  }

  if (preferences.childrenAges && preferences.childrenAges.length > 0) {
    parts.push(
      `Traveling with children ages: ${preferences.childrenAges.join(", ")}. Include kid-friendly stops.`
    );
  }

  if (
    preferences.dietaryRestrictions &&
    preferences.dietaryRestrictions.length > 0
  ) {
    parts.push(
      `Dietary restrictions: ${preferences.dietaryRestrictions.join(", ")}.`
    );
  }

  if (preferences.interests && preferences.interests.length > 0) {
    parts.push(`Interests: ${preferences.interests.join(", ")}.`);
  }

  if (preferences.travelStyle) {
    const styles = {
      relaxed: "Relaxed pace — shorter drives, more stops, leisure time.",
      balanced: "Balanced pace — mix of driving and exploring.",
      fast: "Fast pace — maximize distance, fewer but efficient stops.",
    };
    parts.push(`Travel style: ${styles[preferences.travelStyle]}`);
  }

  if (preferences.maxDrivingHoursPerDay) {
    parts.push(
      `Maximum driving per day: ${preferences.maxDrivingHoursPerDay} hours.`
    );
  }

  if (additionalNotes) {
    parts.push(`Additional notes: ${additionalNotes}`);
  }

  return parts.join("\n");
}
