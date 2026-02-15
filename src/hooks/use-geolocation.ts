"use client";

import { useState, useEffect } from "react";

interface GeolocationState {
  position: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
}

const FALLBACK = { lat: 59.33, lng: 18.07 }; // Stockholm

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ position: FALLBACK, error: "Geolocation not supported", loading: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
          loading: false,
        });
      },
      (err) => {
        setState({ position: FALLBACK, error: err.message, loading: false });
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 }
    );
  }, []);

  return state;
}
