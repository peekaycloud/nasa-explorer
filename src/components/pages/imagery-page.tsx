"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { getEarthImagery } from "@/lib/nasa";
import { MediaViewer } from "@/components/media/media-viewer";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Badge } from "@/components/ui/badge";

const PRESETS = [
  { name: "Grand Canyon", lat: 36.1, lon: -112.1 },
  { name: "Amazon Rainforest", lat: -3.4, lon: -62.0 },
  { name: "Sahara Desert", lat: 23.8, lon: 2.9 },
  { name: "Himalayas", lat: 27.9, lon: 86.9 },
  { name: "New York City", lat: 40.7, lon: -74.0 },
];

const ZOOM_LABELS: Record<number, string> = {
  1: "Regional (~100 km)",
  2: "City (~50 km)",
  3: "District (~25 km)",
  4: "Neighborhood (~10 km)",
};

export function ImageryPage() {
  const [lat, setLat] = useState("36.1");
  const [lon, setLon] = useState("-112.1");
  const [date, setDate] = useState("");
  const [zoomLevel, setZoomLevel] = useState([2]);
  const [search, setSearch] = useState<{
    lat: number;
    lon: number;
    date?: string;
    zoom: number;
  } | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["earth-imagery", search],
    queryFn: () =>
      getEarthImagery(search!.lat, search!.lon, search!.date, search!.zoom),
    enabled: !!search,
  });

  const mediaItems = useMemo(() => {
    if (!data || !search) return [];
    return [
      {
        src: data.url,
        type: "image" as const,
        title: `${search.lat}, ${search.lon}`,
        caption: `${data.layer ?? "Satellite"} · ${data.date}${data.source ? ` · ${data.source}` : ""}`,
      },
    ];
  }, [data, search]);

  function runSearch(next?: { lat: number; lon: number; date?: string }) {
    setSearch({
      lat: next?.lat ?? parseFloat(lat),
      lon: next?.lon ?? parseFloat(lon),
      date: next?.date ?? (date || undefined),
      zoom: zoomLevel[0],
    });
  }

  return (
    <div>
      <PageHeader
        icon="🛰️"
        title="Earth Imagery Explorer"
        description="High-resolution satellite imagery from NASA GIBS. Adjust zoom level, pick a location, and explore with pan/zoom controls."
        api="Earth Imagery"
      />

      <div className="mb-6 space-y-4 rounded-xl glass p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Latitude</Label>
            <Input
              type="number"
              step="0.1"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="border-white/10 bg-white/5"
            />
          </div>
          <div className="space-y-2">
            <Label>Longitude</Label>
            <Input
              type="number"
              step="0.1"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              className="border-white/10 bg-white/5"
            />
          </div>
          <div className="space-y-2">
            <Label>Date (optional — Landsat monthly)</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-white/10 bg-white/5"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={() => runSearch()} className="w-full" disabled={isFetching}>
              <Search className="mr-2 h-4 w-4" />
              Search imagery
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Capture zoom · {ZOOM_LABELS[zoomLevel[0] as keyof typeof ZOOM_LABELS]}</Label>
            <Badge variant="outline">Level {zoomLevel[0]}</Badge>
          </div>
          <Slider
            value={zoomLevel}
            onValueChange={setZoomLevel}
            min={1}
            max={4}
            step={1}
          />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            size="sm"
            onClick={() => {
              setLat(String(preset.lat));
              setLon(String(preset.lon));
              runSearch({
                lat: preset.lat,
                lon: preset.lon,
                date: date || undefined,
              });
            }}
          >
            <MapPin className="mr-1 h-3 w-3" />
            {preset.name}
          </Button>
        ))}
      </div>

      {!search ? (
        <div className="rounded-xl glass p-12 text-center text-slate-400">
          Enter coordinates or pick a preset location. Use the viewer zoom controls
          to inspect details, or fullscreen for a closer look.
        </div>
      ) : isLoading || isFetching ? (
        <Skeleton className="aspect-video w-full rounded-xl" />
      ) : error ? (
        <ErrorState
          message={
            error instanceof Error
              ? error.message
              : "No imagery available for this location/date"
          }
          onRetry={() => refetch()}
        />
      ) : data ? (
        <div className="space-y-4">
          <MediaViewer
            items={mediaItems}
            showThumbnails={false}
            showSlideshow={false}
          />
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {search.lat}, {search.lon}
            </Badge>
            <Badge variant="outline">Captured {data.date}</Badge>
            {data.layer && <Badge variant="outline">{data.layer}</Badge>}
            <Badge variant="outline">{ZOOM_LABELS[search.zoom as keyof typeof ZOOM_LABELS]}</Badge>
          </div>
        </div>
      ) : null}
    </div>
  );
}
