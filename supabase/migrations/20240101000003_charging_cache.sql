CREATE TABLE public.charging_stations_cache (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  name TEXT,
  operator TEXT,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address TEXT,
  country_code TEXT,
  connectors JSONB,
  is_fast_charge BOOLEAN,
  max_power_kw NUMERIC,
  status TEXT,
  raw_data JSONB,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '24 hours'
);

CREATE INDEX idx_charging_location ON public.charging_stations_cache USING GIST(location);
