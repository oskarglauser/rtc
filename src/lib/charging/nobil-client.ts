import type { ChargingStation, ChargingConnector, ChargingSearchParams } from "@/types/charging";

const NOBIL_BASE = "https://nobil.no/api/server/search.php";

interface NOBILStation {
  csmd: {
    id: number;
    name: string;
    Street: string;
    City: string;
    Zipcode: string;
    County: string;
    Country_code: string;
    Position: string; // "(lat, lng)"
    Owned_by: string;
    Available_charging_points: number;
  };
  attr: Record<
    string,
    {
      attrtypeid: string;
      attrname: string;
      attrvalid: string;
      attrval: string;
      trans: string;
    }
  >;
}

export async function searchNOBILStations(
  params: ChargingSearchParams
): Promise<ChargingStation[]> {
  const apiKey = process.env.NOBIL_API_KEY;
  if (!apiKey) return [];

  const body = {
    apikey: apiKey,
    apiversion: "3",
    action: "search",
    type: "near",
    lat: params.lat,
    long: params.lng,
    distance: String((params.radiusKm ?? 25) * 1000), // NOBIL uses meters
    limit: 50,
  };

  try {
    const res = await fetch(NOBIL_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return [];

    const data = await res.json();
    const stations: NOBILStation[] = data.chargerstations ?? [];
    return stations.map(normalizeNOBILStation);
  } catch {
    return [];
  }
}

function normalizeNOBILStation(raw: NOBILStation): ChargingStation {
  // Parse position "(lat, lng)"
  const posMatch = raw.csmd.Position?.match(
    /\(([0-9.]+),\s*([0-9.]+)\)/
  );
  const lat = posMatch ? parseFloat(posMatch[1]) : 0;
  const lng = posMatch ? parseFloat(posMatch[2]) : 0;

  // Extract connectors from attributes
  const connectors: ChargingConnector[] = [];
  let maxPower = 0;
  let isFastCharge = false;

  for (const attr of Object.values(raw.attr)) {
    if (attr.attrtypeid === "4") {
      // Connector type
      const powerMatch = attr.attrval?.match(/(\d+)\s*kW/);
      const power = powerMatch ? parseInt(powerMatch[1]) : null;
      if (power && power > maxPower) maxPower = power;
      if (power && power >= 50) isFastCharge = true;

      connectors.push({
        type: attr.trans || attr.attrval || "Unknown",
        powerKw: power,
        quantity: 1,
      });
    }
  }

  return {
    id: `nobil-${raw.csmd.id}`,
    source: "nobil",
    name: raw.csmd.name,
    operator: raw.csmd.Owned_by || null,
    location: { lat, lng },
    address: [raw.csmd.Street, raw.csmd.City, raw.csmd.Zipcode]
      .filter(Boolean)
      .join(", "),
    countryCode: raw.csmd.Country_code || null,
    connectors,
    isFastCharge,
    maxPowerKw: maxPower > 0 ? maxPower : null,
    status: null,
  };
}
