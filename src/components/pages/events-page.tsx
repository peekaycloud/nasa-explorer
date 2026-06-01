"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { getEonetEvents } from "@/lib/nasa";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Badge } from "@/components/ui/badge";

const EventsMap = dynamic(
  () => import("@/components/maps/events-map").then((m) => m.EventsMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[500px] w-full rounded-xl" />,
  }
);

const CATEGORY_COLORS: Record<string, string> = {
  wildfires: "#ef4444",
  severeStorms: "#3b82f6",
  volcanoes: "#f97316",
  earthquakes: "#a855f7",
  floods: "#06b6d4",
  seaLakeIce: "#67e8f9",
  default: "#818cf8",
};

export function EventsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["eonet"],
    queryFn: () => getEonetEvents(30),
  });

  const events = data?.events ?? [];

  return (
    <div>
      <PageHeader
        icon="events"
        title="Natural Events"
        description="Active wildfires, storms, volcanoes, and other natural events tracked globally via NASA's EONET."
        api="EONET"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(CATEGORY_COLORS)
          .filter(([k]) => k !== "default")
          .map(([key, color]) => (
            <Badge
              key={key}
              variant="outline"
              className="gap-1.5 border-white/10"
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              {key.replace(/([A-Z])/g, " $1").trim()}
            </Badge>
          ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-[500px] w-full rounded-xl" />
      ) : error ? (
        <ErrorState
          message={
            error instanceof Error ? error.message : "Failed to load events"
          }
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-400">
            {events.length} open events in the last 30 days
          </p>
          <EventsMap events={events} categoryColors={CATEGORY_COLORS} />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {events.slice(0, 9).map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <p className="font-medium text-white">{event.title}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {(event.categories ?? []).map((c) => c.title).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
