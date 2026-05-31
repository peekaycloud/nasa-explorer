"use client";

import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { useMemo, useState } from "react";
import { getEpicImageUrl, getEpicImages } from "@/lib/nasa";
import { MediaViewer } from "@/components/media/media-viewer";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";

export function EarthPage() {
  const [date, setDate] = useState("");
  const [index, setIndex] = useState(0);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["epic", date],
    queryFn: () => getEpicImages(date || undefined),
  });

  const images = useMemo(() => data ?? [], [data]);

  const mediaItems = useMemo(
    () =>
      images.map((image) => ({
        src: getEpicImageUrl(image),
        type: "image" as const,
        title: image.caption,
        caption: format(parseISO(image.date.split(" ")[0]), "MMMM d, yyyy · HH:mm") + " UTC",
        thumbnail: getEpicImageUrl(image),
      })),
    [images]
  );

  return (
    <div>
      <PageHeader
        icon="🌍"
        title="Earth from Space"
        description="Daily full-disk images of Earth captured by NASA's EPIC instrument aboard the DSCOVR satellite at the L1 Lagrange point."
        api="EPIC"
      />

      <div className="mb-8 flex flex-wrap items-end gap-4 rounded-xl glass p-4">
        <div className="space-y-2">
          <Label>Date (optional)</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setIndex(0);
            }}
            className="border-white/10 bg-white/5"
          />
        </div>
        {date && (
          <Button variant="ghost" onClick={() => setDate("")}>
            Latest available
          </Button>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="aspect-square max-h-[600px] w-full rounded-2xl" />
      ) : error ? (
        <ErrorState
          message={
            error instanceof Error ? error.message : "Failed to load EPIC images"
          }
          onRetry={() => refetch()}
        />
      ) : images.length === 0 ? (
        <div className="rounded-xl glass p-8 text-center text-slate-400">
          No EPIC images for this date. Try another day or leave blank for the
          latest collection.
        </div>
      ) : (
        <MediaViewer
          items={mediaItems}
          index={index}
          onIndexChange={setIndex}
          aspectRatio="aspect-square max-h-[640px]"
          showThumbnails
          showSlideshow
          autoPlayMs={4000}
        />
      )}
    </div>
  );
}
