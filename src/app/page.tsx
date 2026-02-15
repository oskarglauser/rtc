"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HomeMap } from "@/components/map/home-map";
import { SearchCard } from "@/components/search/search-card";
import { SettingsSheet } from "@/components/settings/settings-sheet";
import { ItineraryPanel } from "@/components/trip/itinerary-panel";
import { useGeolocation } from "@/hooks/use-geolocation";
import { usePreferences } from "@/hooks/use-preferences";
import type { Trip } from "@/types/trip";

export default function HomePage() {
  const router = useRouter();
  const { position } = useGeolocation();
  const { preferences, updatePreferences, resetPreferences } = usePreferences();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  async function handleGenerate(
    origin: string,
    destination: string,
    startDate?: string,
    endDate?: string
  ) {
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

      // Fetch the full trip to display in the panel
      const tripRes = await fetch(`/api/trips/${data.tripId}`);
      if (!tripRes.ok) {
        // Fallback: navigate to the trip page
        router.push(`/trip/${data.tripId}`);
        return;
      }

      const tripData: Trip = await tripRes.json();
      setTrip(tripData);
      setShowPanel(true);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="relative h-[calc(100vh-3.5rem)]">
      {/* Full-screen map */}
      <HomeMap center={position} trip={trip} />

      {/* Floating search card */}
      <div className="absolute top-4 left-1/2 z-20 -translate-x-1/2">
        <SearchCard
          onGenerate={handleGenerate}
          onOpenSettings={() => setSettingsOpen(true)}
          isGenerating={isGenerating}
        />
      </div>

      {/* Itinerary panel (slides in from left) */}
      {showPanel && trip && (
        <ItineraryPanel trip={trip} onClose={() => setShowPanel(false)} />
      )}

      {/* Settings sheet */}
      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        preferences={preferences}
        onUpdate={updatePreferences}
        onReset={resetPreferences}
      />
    </div>
  );
}
