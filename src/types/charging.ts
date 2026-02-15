export interface ChargingStation {
  id: string;
  source: "ocm" | "nobil";
  name: string | null;
  operator: string | null;
  location: { lat: number; lng: number };
  address: string | null;
  countryCode: string | null;
  connectors: ChargingConnector[];
  isFastCharge: boolean;
  maxPowerKw: number | null;
  status: string | null;
}

export interface ChargingConnector {
  type: string;
  powerKw: number | null;
  quantity: number;
}

export interface ChargingSearchParams {
  lat: number;
  lng: number;
  radiusKm?: number;
  minPowerKw?: number;
  connectorType?: string;
}
