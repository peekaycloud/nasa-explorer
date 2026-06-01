"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { getMarsPhotos } from "@/lib/nasa";
import { MediaViewer } from "@/components/media/media-viewer";
import { PageHeader } from "@/components/ui/page-header";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/error-state";

const ROVERS = ["curiosity", "perseverance", "opportunity", "spirit"] as const;
const CAMERAS = [
  { value: "all", label: "All cameras" },
  { value: "FHAZ", label: "Front Hazard Avoidance" },
  { value: "RHAZ", label: "Rear Hazard Avoidance" },
  { value: "MAST", label: "Mast Camera" },
  { value: "CHEMCAM", label: "ChemCam" },
  { value: "NAVCAM", label: "Navigation Camera" },
];

export function MarsPage() {
  const [rover, setRover] = useState<string>("curiosity");
  const [camera, setCamera] = useState("all");
  const [earthDate, setEarthDate] = useState("2020-06-01");
  const [viewerIndex, setViewerIndex] = useState(0);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["mars", rover, earthDate, camera],
    queryFn: () => getMarsPhotos(rover, earthDate, camera),
  });

  const mediaItems = useMemo(
    () =>
      (data?.photos ?? []).map((photo) => ({
        src: photo.img_src,
        type: "image" as const,
        title: photo.title ?? `${photo.rover.name} · ${photo.camera.name}`,
        caption: `${photo.earth_date} · ${photo.camera.full_name}`,
        thumbnail: photo.img_src,
      })),
    [data?.photos]
  );

  return (
    <div>
      <PageHeader
        icon="mars"
        title="Mars Rover Gallery"
        description="Browse photos captured by NASA's Mars rovers. Select a rover, date, and camera to explore the Red Planet."
        api="Mars Rover Photos"
      />

      <div className="mb-6 grid gap-4 rounded-xl glass p-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Rover</Label>
          <Select
            value={rover}
            onValueChange={(value) => {
              setRover(value);
              setViewerIndex(0);
            }}
          >
            <SelectTrigger className="border-white/10 bg-white/5 capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROVERS.map((r) => (
                <SelectItem key={r} value={r} className="capitalize">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Earth date</Label>
          <Input
            type="date"
            value={earthDate}
            onChange={(e) => {
              setEarthDate(e.target.value);
              setViewerIndex(0);
            }}
            className="border-white/10 bg-white/5"
          />
        </div>
        <div className="space-y-2">
          <Label>Camera</Label>
          <Select
            value={camera}
            onValueChange={(value) => {
              setCamera(value);
              setViewerIndex(0);
            }}
          >
            <SelectTrigger className="border-white/10 bg-white/5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAMERAS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <p className="text-center text-sm text-slate-500">Loading rover photos…</p>
        </div>
      ) : error ? (
        <ErrorState
          message={
            error instanceof Error ? error.message : "Failed to load Mars photos"
          }
          onRetry={() => refetch()}
        />
      ) : mediaItems.length === 0 ? (
        <div className="rounded-xl glass p-8 text-center text-slate-400">
          No photos found for this rover and year. Try a different date.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-[var(--matrix-green)]/10 text-[var(--matrix-green)]">
              {mediaItems.length} photos loaded
            </Badge>
            <Badge variant="outline">{format(new Date(earthDate), "yyyy")}</Badge>
            <Badge variant="outline" className="capitalize">
              {rover}
            </Badge>
          </div>
          <MediaViewer
            items={mediaItems}
            index={viewerIndex}
            onIndexChange={setViewerIndex}
            showThumbnails
            showSlideshow
            autoPlayMs={3500}
          />
        </div>
      )}
    </div>
  );
}
