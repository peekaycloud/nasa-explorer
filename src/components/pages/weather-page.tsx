"use client";

import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import {
  getCmeEvents,
  getGeomagneticStorms,
  getSolarFlares,
  type DonkiEvent,
} from "@/lib/nasa";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";

function EventTimeline({
  events,
  type,
}: {
  events: DonkiEvent[];
  type: "flr" | "cme" | "gst";
}) {
  if (events.length === 0) {
    return (
      <p className="rounded-xl glass p-8 text-center text-slate-400">
        No {type.toUpperCase()} events in this period.
      </p>
    );
  }

  return (
    <div className="relative space-y-4 before:absolute before:left-4 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-indigo-500/30">
      {events.map((event, i) => {
        const id =
          event.flrID ?? event.cmeID ?? event.gstID ?? event.activityID ?? String(i);
        const time = event.peakTime ?? event.beginTime ?? event.endTime;

        return (
          <div key={id} className="relative pl-10">
            <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full bg-indigo-400 ring-4 ring-indigo-400/20" />
            <Card className="border-white/10 bg-white/5">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base text-white">{id}</CardTitle>
                  {event.classType && (
                    <Badge className="bg-amber-500/20 text-amber-200">
                      Class {event.classType}
                    </Badge>
                  )}
                  {event.kpIndex !== undefined && (
                    <Badge variant="outline">Kp {event.kpIndex}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-slate-400">
                {time && (
                  <p>{format(new Date(time), "MMM d, yyyy · HH:mm")} UTC</p>
                )}
                {event.sourceLocation && (
                  <p>Source: {event.sourceLocation}</p>
                )}
                {event.note && <p>{event.note}</p>}
                {event.linkedEvents && event.linkedEvents.length > 0 && (
                  <p>
                    Linked:{" "}
                    {event.linkedEvents.map((e) => e.activityID).join(", ")}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

export function WeatherPage() {
  const endDate = format(new Date(), "yyyy-MM-dd");
  const startDate = format(subDays(new Date(), 30), "yyyy-MM-dd");

  const flares = useQuery({
    queryKey: ["donki-flr", startDate, endDate],
    queryFn: () => getSolarFlares(startDate, endDate),
  });

  const cme = useQuery({
    queryKey: ["donki-cme", startDate, endDate],
    queryFn: () => getCmeEvents(startDate, endDate),
  });

  const gst = useQuery({
    queryKey: ["donki-gst", startDate, endDate],
    queryFn: () => getGeomagneticStorms(startDate, endDate),
  });

  const isLoading = flares.isLoading || cme.isLoading || gst.isLoading;
  const hasError = flares.error || cme.error || gst.error;

  return (
    <div>
      <PageHeader
        icon="🌤️"
        title="Space Weather"
        description="Solar flares, coronal mass ejections, and geomagnetic storms from NASA's DONKI space weather database."
        api="DONKI"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant="outline">{startDate} → {endDate}</Badge>
        <Badge className="bg-indigo-500/20 text-indigo-200">
          {flares.data?.length ?? 0} flares
        </Badge>
        <Badge className="bg-amber-500/20 text-amber-200">
          {cme.data?.length ?? 0} CMEs
        </Badge>
        <Badge className="bg-violet-500/20 text-violet-200">
          {gst.data?.length ?? 0} geomagnetic storms
        </Badge>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : hasError ? (
        <ErrorState
          message="Failed to load space weather data. DONKI may rate-limit DEMO_KEY requests."
          onRetry={() => {
            flares.refetch();
            cme.refetch();
            gst.refetch();
          }}
        />
      ) : (
        <Tabs defaultValue="flr">
          <TabsList className="mb-6 bg-white/5">
            <TabsTrigger value="flr">Solar Flares</TabsTrigger>
            <TabsTrigger value="cme">CME</TabsTrigger>
            <TabsTrigger value="gst">Geomagnetic</TabsTrigger>
          </TabsList>
          <TabsContent value="flr">
            <EventTimeline events={flares.data ?? []} type="flr" />
          </TabsContent>
          <TabsContent value="cme">
            <EventTimeline events={cme.data ?? []} type="cme" />
          </TabsContent>
          <TabsContent value="gst">
            <EventTimeline events={gst.data ?? []} type="gst" />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
