CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  origin_name TEXT,
  origin_location GEOGRAPHY(POINT, 4326),
  destination_name TEXT,
  destination_location GEOGRAPHY(POINT, 4326),
  total_distance_km NUMERIC,
  total_driving_hours NUMERIC,
  preferences JSONB DEFAULT '{}',
  ai_conversation JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.itinerary_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date DATE,
  summary TEXT,
  driving_km NUMERIC,
  driving_hours NUMERIC,
  UNIQUE(trip_id, day_number)
);

CREATE TABLE public.itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES public.itinerary_days(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  item_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location_name TEXT,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  arrival_time TIMESTAMPTZ,
  departure_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  metadata JSONB DEFAULT '{}',
  external_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_items_day ON public.itinerary_items(day_id);
CREATE INDEX idx_items_trip ON public.itinerary_items(trip_id);
CREATE INDEX idx_items_location ON public.itinerary_items USING GIST(location);
