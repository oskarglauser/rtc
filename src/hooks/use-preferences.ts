"use client";

import { useState, useCallback, useEffect } from "react";
import type { TripPreferences } from "@/types/trip";

const STORAGE_KEY = "rtc-preferences";

const DEFAULTS: TripPreferences = {
  travelStyle: "balanced",
  maxDrivingHoursPerDay: 6,
  childrenAges: [],
  dietaryRestrictions: [],
  interests: [],
};

function load(): TripPreferences {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function save(prefs: TripPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // storage full or unavailable
  }
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<TripPreferences>(DEFAULTS);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setPreferences(load());
  }, []);

  const updatePreferences = useCallback(
    (partial: Partial<TripPreferences>) => {
      setPreferences((prev) => {
        const next = { ...prev, ...partial };
        save(next);
        return next;
      });
    },
    []
  );

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULTS);
    save(DEFAULTS);
  }, []);

  return { preferences, updatePreferences, resetPreferences };
}
