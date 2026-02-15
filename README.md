# Road Trip Companion

AI-powered EV road trip planner for families in Europe. Plan routes with smart charging stops, family-friendly restaurants, and must-see attractions.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (Postgres)
- **AI**: OpenAI GPT-5.2 (Responses API)
- **Maps**: MapLibre GL + OpenFreeMap tiles
- **Routing**: OSRM

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Fill in OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.

# Run dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/              # Next.js routes and API endpoints
    api/ai/         # AI generation and refinement endpoints
    trip/           # Trip detail and map pages
  components/
    map/            # MapLibre map components
    search/         # Search card overlay
    settings/       # Preferences sheet
    trip/           # Trip wizard, detail view, itinerary panel
    layout/         # Header
    ui/             # shadcn/ui primitives
  hooks/            # Custom hooks (geolocation, preferences, map)
  lib/              # Utilities, AI prompts, Supabase clients, map config
  types/            # TypeScript type definitions
```

## Environment Variables

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key for trip generation |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
