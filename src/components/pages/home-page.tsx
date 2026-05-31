"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { format, subDays } from "date-fns";
import { Calendar, ChevronRight } from "lucide-react";
import { getApod, MODULES } from "@/lib/nasa";
import { MediaViewer } from "@/components/media/media-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
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
    <div className="space-y-12">
      <section>
        {isLoading ? (
          <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
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
              <Badge className="mb-3 bg-indigo-500/30 text-indigo-200 hover:bg-indigo-500/30">
                APOD · {data.date}
              </Badge>
              <h1 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                {data.title}
              </h1>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                {data.explanation}
              </p>
            </div>
          </div>
        ) : null}
      </section>

      <div className="flex flex-wrap items-end gap-4 rounded-xl glass p-4">
        <div className="space-y-2">
          <Label htmlFor="apod-date" className="text-slate-300">
            Browse another date
          </Label>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-400" />
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

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white sm:text-2xl">
              Explore the Universe
            </h2>
            <p className="text-sm text-slate-400">
              Eight NASA data modules, one dashboard
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.filter((m) => m.href !== "/").map((module) => (
            <Link key={module.href} href={module.href}>
              <Card className="group h-full border-white/10 bg-white/5 transition-all hover:border-indigo-400/30 hover:bg-indigo-500/10">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{module.icon}</span>
                    <ChevronRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-300" />
                  </div>
                  <CardTitle className="text-base text-white">
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-xs text-slate-400">
                    {module.description}
                  </p>
                  <Badge variant="outline" className="border-indigo-400/30 text-indigo-300">
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
