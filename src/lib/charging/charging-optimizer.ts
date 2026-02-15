import type { ChargingStation } from "@/types/charging";

interface EVSpecs {
  batteryCapacityKwh: number;
  rangeKm: number;
  connectorType?: string;
}

interface RoutePoint {
  lat: number;
  lng: number;
  distanceFromStartKm: number;
}

interface ChargingStop {
  station: ChargingStation;
  distanceFromStartKm: number;
  estimatedBatteryOnArrival: number; // percentage
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function optimizeChargingStops(
  routePoints: RoutePoint[],
  stations: ChargingStation[],
  ev: EVSpecs,
  startBatteryPercent = 100
): ChargingStop[] {
  const stops: ChargingStop[] = [];
  const minBattery = 15; // Never go below 15%
  const kmPerPercent = ev.rangeKm / 100;

  let currentBattery = startBatteryPercent;
  let lastStopKm = 0;

  // Walk along route, check if we need to charge
  for (let i = 1; i < routePoints.length; i++) {
    const point = routePoints[i];
    const segmentKm = point.distanceFromStartKm - lastStopKm;
    const batteryUsed = segmentKm / kmPerPercent;
    const projectedBattery = currentBattery - batteryUsed;

    if (projectedBattery <= minBattery) {
      // Need to charge before this point — find closest station to previous segment
      const midKm = lastStopKm + segmentKm * 0.6; // Prefer charging at ~60% through segment
      const midPoint = routePoints.reduce((best, rp) =>
        Math.abs(rp.distanceFromStartKm - midKm) <
        Math.abs(best.distanceFromStartKm - midKm)
          ? rp
          : best
      );

      // Find nearest station to mid-point, prefer fast chargers
      const ranked = stations
        .map((s) => ({
          station: s,
          distance: haversineKm(
            midPoint.lat,
            midPoint.lng,
            s.location.lat,
            s.location.lng
          ),
        }))
        .filter((s) => s.distance < 20) // Within 20km of route
        .sort((a, b) => {
          // Prefer fast chargers
          const aFast = a.station.isFastCharge ? 0 : 1;
          const bFast = b.station.isFastCharge ? 0 : 1;
          if (aFast !== bFast) return aFast - bFast;
          return a.distance - b.distance;
        });

      if (ranked.length > 0) {
        const batteryOnArrival =
          currentBattery -
          (midPoint.distanceFromStartKm - lastStopKm) / kmPerPercent;

        stops.push({
          station: ranked[0].station,
          distanceFromStartKm: midPoint.distanceFromStartKm,
          estimatedBatteryOnArrival: Math.max(0, batteryOnArrival),
        });

        currentBattery = 80; // Assume charging to 80%
        lastStopKm = midPoint.distanceFromStartKm;
      }
    }
  }

  return stops;
}
