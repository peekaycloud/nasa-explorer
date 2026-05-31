# NASA Explorer

Interactive space dashboard powered by NASA's free public APIs.

## Setup

1. Get a free API key at [api.nasa.gov](https://api.nasa.gov/)
2. Copy this file to `.env.local`:

```bash
cp .env.example .env.local
```

3. Add your key:

```
NASA_API_KEY=your_key_here
```

> `DEMO_KEY` works for testing but is limited to 30 requests/hour and 50/day.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/peekaycloud/nasa-explorer&env=NASA_API_KEY&envDescription=Free%20API%20key%20from%20api.nasa.gov&project-name=nasa-explorer)

1. Import this repo in [Vercel](https://vercel.com/new)
2. Set **Root Directory** to `.` (default)
3. Add environment variable: `NASA_API_KEY` = your key from [api.nasa.gov](https://api.nasa.gov/)
4. Deploy — build command `npm run build`, output is auto-detected for Next.js

Or use the Vercel CLI:

```bash
npm i -g vercel
vercel link
vercel env add NASA_API_KEY
vercel deploy --prod
```

## Modules

| Route | API | Description |
|-------|-----|-------------|
| `/` | APOD | Astronomy Picture of the Day |
| `/mars` | Mars Rover Photos | Curiosity, Perseverance gallery |
| `/earth` | EPIC | Full-Earth daily images |
| `/asteroids` | NeoWs | Near-Earth asteroid tracker |
| `/events` | EONET | Natural events world map |
| `/weather` | DONKI | Space weather dashboard |
| `/imagery` | Earth Imagery | Landsat by coordinates |
| `/patents` | TechTransfer | NASA patent search |

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS + shadcn/ui
- TanStack React Query
- Recharts, Leaflet, tsparticles
