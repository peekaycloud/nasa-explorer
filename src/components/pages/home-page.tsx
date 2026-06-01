"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { format, subDays } from "date-fns";
import { Calendar, ChevronRight } from "lucide-react";
import { getApod, MODULES } from "@/lib/nasa";
import { MediaViewer } from "@/components/media/media-viewer";
import { ChannelHero } from "@/components/layout/channel-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { SpaceIcon } from "@/components/ui/space-icon";
import { useMemo, useState } from "react";

export function HomePage() {
  const [date, setDate] = useState("");
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["apod", date],
    queryFn: () => getApod(date || undefined),
  });

  const mediaItems = useMemo(() => {
    if (!data) return [];
    return [
      {
        src: data.media_type === "image" ? data.hdurl || data.url : data.url,
        type: data.media_type === "video" ? ("video" as const) : ("image" as const),
        title: data.title,
        caption: `APOD · ${data.date}${data.copyright ? ` · © ${data.copyright}` : ""}`,
      },
    ];
  }, [data]);

  return (
    <div className="space-y-10">
      <ChannelHero />

      <section id="apod" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Astronomy Picture of the Day
          </h2>
          <p className="text-sm text-neutral-400">
            Live from NASA&apos;s APOD API — may take a few seconds to load.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="aspect-[16/9] w-full rounded-2xl bg-white/5" />
            <p className="text-center text-sm text-neutral-500">
              Loading today&apos;s image…
            </p>
          </div>
        ) : error ? (
          <ErrorState
            message={
              error instanceof Error
                ? error.message
                : "Failed to load Astronomy Picture of the Day"
            }
            onRetry={() => refetch()}
          />
        ) : data ? (
          <div className="space-y-4">
            <MediaViewer
              items={mediaItems}
              aspectRatio="aspect-[16/9]"
              showThumbnails={false}
              showSlideshow={false}
            />
            <div className="rounded-xl glass p-6">
              <Badge className="mb-3 border-[var(--matrix-green)]/30 bg-[var(--matrix-green)]/10 text-[var(--matrix-green)] hover:bg-[var(--matrix-green)]/10">
                APOD · {data.date}
              </Badge>
              <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                {data.title}
              </h2>
              <p className="text-sm leading-relaxed text-neutral-300 sm:text-base">
                {data.explanation}
              </p>
            </div>
          </div>
        ) : null}
      </section>

      <div className="flex flex-wrap items-end gap-4 rounded-xl glass p-4">
        <div className="space-y-2">
          <Label htmlFor="apod-date" className="text-neutral-300">
            Browse another date
          </Label>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--matrix-green)]" />
            <Input
              id="apod-date"
              type="date"
              value={date}
              max={format(new Date(), "yyyy-MM-dd")}
              min={format(subDays(new Date(), 365 * 30), "yyyy-MM-dd")}
              onChange={(e) => setDate(e.target.value)}
              className="w-auto border-white/10 bg-white/5"
            />
          </div>
        </div>
        {date && (
          <Button variant="ghost" onClick={() => setDate("")}>
            Today
          </Button>
        )}
      </div>

      <section id="modules">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white sm:text-2xl">
              Explore the Universe
            </h2>
            <p className="text-sm text-neutral-400">
              Eight NASA data modules, one dashboard
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.filter((m) => m.href !== "/").map((module) => (
            <Link key={module.href} href={module.href}>
              <Card className="group h-full border-white/10 bg-white/[0.04] transition-all hover:border-[var(--matrix-green)]/30 hover:bg-white/[0.06]">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <SpaceIcon name={module.icon} size={36} />
                    <ChevronRight className="h-4 w-4 text-neutral-500 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--matrix-green)]" />
                  </div>
                  <CardTitle className="text-base text-white">
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm text-neutral-400">{module.description}</p>
                  <Badge
                    variant="outline"
                    className="border-white/15 text-neutral-300"
                  >
                    {module.api}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
