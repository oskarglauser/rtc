import type { ChargingStation, ChargingConnector, ChargingSearchParams } from "@/types/charging";

const OCM_BASE = "https://api.openchargemap.io/v3/poi";

interface OCMResponse {
  ID: number;
  AddressInfo: {
    Title: string;
    AddressLine1?: string;
    Town?: string;
    StateOrProvince?: string;
    Postcode?: string;
    Country?: { ISOCode?: string };
    Latitude: number;
    Longitude: number;
  };
  OperatorInfo?: { Title?: string };
  Connections?: Array<{
    ConnectionType?: { Title?: string };
    PowerKW?: number;
    Quantity?: number;
    Level?: { IsFastChargeCapable?: boolean };
  }>;
  StatusType?: { Title?: string };
}

export async function searchOCMStations(
  params: ChargingSearchParams
): Promise<ChargingStation[]> {
  const apiKey = process.env.OCM_API_KEY;
  if (!apiKey) return [];

  const searchParams = new URLSearchParams({
    key: apiKey,
    latitude: String(params.lat),
    longitude: String(params.lng),
    distance: String(params.radiusKm ?? 25),
    distanceunit: "KM",
    maxresults: "50",
    compact: "true",
    verbose: "false",
    output: "json",
  });

  if (params.minPowerKw) {
    searchParams.set("minpowerkw", String(params.minPowerKw));
  }

  try {
    const res = await fetch(`${OCM_BASE}?${searchParams}`);
    if (!res.ok) return [];

    const data: OCMResponse[] = await res.json();
    return data.map(normalizeOCMStation);
  } catch {
    return [];
  }
}

function normalizeOCMStation(raw: OCMResponse): ChargingStation {
  const connectors: ChargingConnector[] = (raw.Connections ?? []).map((c) => ({
    type: c.ConnectionType?.Title ?? "Unknown",
    powerKw: c.PowerKW ?? null,
    quantity: c.Quantity ?? 1,
  }));

  const maxPower = Math.max(
    0,
    ...connectors.map((c) => c.powerKw ?? 0)
  );

  const isFastCharge =
    maxPower >= 50 ||
    (raw.Connections ?? []).some((c) => c.Level?.IsFastChargeCapable);

  return {
    id: `ocm-${raw.ID}`,
    source: "ocm",
    name: raw.AddressInfo.Title,
    operator: raw.OperatorInfo?.Title ?? null,
    location: {
      lat: raw.AddressInfo.Latitude,
      lng: raw.AddressInfo.Longitude,
    },
    address: [
      raw.AddressInfo.AddressLine1,
      raw.AddressInfo.Town,
      raw.AddressInfo.Postcode,
    ]
      .filter(Boolean)
      .join(", "),
    countryCode: raw.AddressInfo.Country?.ISOCode ?? null,
    connectors,
    isFastCharge,
    maxPowerKw: maxPower > 0 ? maxPower : null,
    status: raw.StatusType?.Title ?? null,
  };
}
