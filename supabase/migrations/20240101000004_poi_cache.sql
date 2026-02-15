CREATE TABLE public.poi_cache (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address TEXT,
  rating NUMERIC,
  price_level INTEGER,
  cuisine_types TEXT[],
  is_kid_friendly BOOLEAN,
  opening_hours JSONB,
  photos JSONB,
  raw_data JSONB,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days'
);

CREATE INDEX idx_poi_location ON public.poi_cache USING GIST(location);
