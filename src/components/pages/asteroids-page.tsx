"use client";

import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { getNeoFeed, type NeoAsteroid } from "@/lib/nasa";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;
type FilterType = "all" | "hazardous" | "safe";
type SortType = "distance" | "size" | "date" | "name";

function getAsteroidStats(asteroid: NeoAsteroid) {
  const approach = asteroid.close_approach_data[0];
  const minD = asteroid.estimated_diameter.kilometers.estimated_diameter_min;
  const maxD = asteroid.estimated_diameter.kilometers.estimated_diameter_max;
  const avgDiameter = (minD + maxD) / 2;
  const lunarDist = parseFloat(approach?.miss_distance.lunar ?? "0");

  return {
    approach,
    minD,
    maxD,
    avgDiameter,
    lunarDist,
    approachDate: approach?.close_approach_date ?? "",
  };
}

export function AsteroidsPage() {
  const endDate = format(new Date(), "yyyy-MM-dd");
  const startDate = format(subDays(new Date(), 6), "yyyy-MM-dd");

  const dateTabs = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return format(d, "yyyy-MM-dd");
    });
  }, []);

  const [activeDate, setActiveDate] = useState("all");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("distance");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["neo", startDate, endDate],
    queryFn: () => getNeoFeed(startDate, endDate),
  });

  const asteroids = useMemo(() => {
    if (!data) return [];
    return Object.values(data.near_earth_objects).flat();
  }, [data]);

  const filtered = useMemo(() => {
    let list = [...asteroids];

    if (activeDate !== "all") {
      list = list.filter(
        (a) => getAsteroidStats(a).approachDate === activeDate
      );
    }

    if (filter === "hazardous") {
      list = list.filter((a) => a.is_potentially_hazardous_asteroid);
    } else if (filter === "safe") {
      list = list.filter((a) => !a.is_potentially_hazardous_asteroid);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      const sa = getAsteroidStats(a);
      const sb = getAsteroidStats(b);
      if (sort === "distance") return sa.lunarDist - sb.lunarDist;
      if (sort === "size") return sb.avgDiameter - sa.avgDiameter;
      if (sort === "date") return sa.approachDate.localeCompare(sb.approachDate);
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [activeDate, asteroids, filter, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const chartData = useMemo(
    () =>
      filtered.slice(0, 12).map((a) => {
        const stats = getAsteroidStats(a);
        return {
          id: a.id,
          name: a.name.replace(/[()]/g, "").slice(0, 10),
          distance: stats.lunarDist,
          hazardous: a.is_potentially_hazardous_asteroid,
        };
      }),
    [filtered]
  );

  const countsByDate = useMemo(() => {
    const counts: Record<string, number> = { all: asteroids.length };
    for (const date of dateTabs) {
      counts[date] = asteroids.filter(
        (a) => getAsteroidStats(a).approachDate === date
      ).length;
    }
    return counts;
  }, [asteroids, dateTabs]);

  return (
    <div>
      <PageHeader
        icon="☄️"
        title="Asteroid Tracker"
        description="Near-Earth objects passing close to Earth in the next 7 days — filter by date, hazard level, and explore with improved navigation."
        api="NeoWs"
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      ) : error ? (
        <ErrorState
          message={
            error instanceof Error ? error.message : "Failed to load asteroid data"
          }
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            <Badge className="bg-indigo-500/20 text-indigo-200">
              {data?.element_count ?? 0} objects tracked
            </Badge>
            <Badge variant="outline">
              {startDate} → {endDate}
            </Badge>
            <Badge variant="destructive">
              {asteroids.filter((a) => a.is_potentially_hazardous_asteroid).length}{" "}
              potentially hazardous
            </Badge>
            <Badge variant="outline">{filtered.length} matching filters</Badge>
          </div>

          <div className="sticky top-16 z-40 mb-6 space-y-4 rounded-xl border border-white/10 bg-[#050816]/90 p-4 backdrop-blur-xl">
            <Tabs
              value={activeDate}
              onValueChange={(value) => {
                setActiveDate(value);
                setPage(0);
              }}
            >
              <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-white/5 p-1">
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  All ({countsByDate.all})
                </TabsTrigger>
                {dateTabs.map((date) => (
                  <TabsTrigger key={date} value={date} className="text-xs sm:text-sm">
                    {format(new Date(date), "MMM d")} ({countsByDate[date] ?? 0})
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Search asteroid name..."
                  className="border-white/10 bg-white/5 pl-9"
                />
              </div>
              <Select
                value={filter}
                onValueChange={(value: FilterType) => {
                  setFilter(value);
                  setPage(0);
                }}
              >
                <SelectTrigger className="border-white/10 bg-white/5">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All objects</SelectItem>
                  <SelectItem value="hazardous">Hazardous only</SelectItem>
                  <SelectItem value="safe">Safe only</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sort}
                onValueChange={(value: SortType) => setSort(value)}
              >
                <SelectTrigger className="border-white/10 bg-white/5">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Closest first</SelectItem>
                  <SelectItem value="size">Largest first</SelectItem>
                  <SelectItem value="date">Approach date</SelectItem>
                  <SelectItem value="name">Name A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="mb-8 border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white">
                Miss distance chart · click a bar to jump to asteroid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                      }}
                    />
                    <Bar
                      dataKey="distance"
                      radius={[4, 4, 0, 0]}
                      cursor="pointer"
                      onClick={(entry) => {
                        const id = (entry as { payload?: { id?: string } }).payload?.id;
                        if (id) {
                          setSelectedId(id);
                          const idx = filtered.findIndex((a) => a.id === id);
                          if (idx >= 0) setPage(Math.floor(idx / PAGE_SIZE));
                        }
                      }}
                    >
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.id}
                          fill={
                            entry.id === selectedId
                              ? "#c4b5fd"
                              : entry.hazardous
                                ? "#ef4444"
                                : "#818cf8"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {filtered.length === 0 ? (
            <div className="rounded-xl glass p-8 text-center text-slate-400">
              No asteroids match your filters. Try another date or clear the search.
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {pageItems.map((asteroid) => {
                  const stats = getAsteroidStats(asteroid);
                  const distPercent = Math.min((stats.lunarDist / 50) * 100, 100);
                  const isSelected = selectedId === asteroid.id;

                  return (
                    <Card
                      key={asteroid.id}
                      id={`asteroid-${asteroid.id}`}
                      className={cn(
                        "cursor-pointer border-white/10 bg-white/5 transition-all hover:border-indigo-400/40",
                        isSelected && "border-indigo-400 ring-1 ring-indigo-400/50"
                      )}
                      onClick={() => setSelectedId(asteroid.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base text-white">
                            {asteroid.name}
                          </CardTitle>
                          {asteroid.is_potentially_hazardous_asteroid ? (
                            <Badge variant="destructive">Hazardous</Badge>
                          ) : (
                            <Badge variant="outline" className="text-emerald-400">
                              Safe
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div>
                          <div className="mb-1 flex justify-between text-xs text-slate-400">
                            <span>Miss distance</span>
                            <span>{stats.lunarDist.toFixed(2)} LD</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                asteroid.is_potentially_hazardous_asteroid
                                  ? "bg-red-500"
                                  : "bg-indigo-500"
                              )}
                              style={{ width: `${distPercent}%` }}
                            />
                          </div>
                        </div>
                        <p className="text-slate-400">
                          Diameter: {stats.minD.toFixed(3)}–{stats.maxD.toFixed(3)} km
                        </p>
                        <p className="text-slate-400">
                          Velocity:{" "}
                          {parseFloat(
                            stats.approach?.relative_velocity.kilometers_per_hour ?? "0"
                          ).toLocaleString()}{" "}
                          km/h
                        </p>
                        <p className="text-slate-500">
                          Close approach: {stats.approachDate}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl glass px-4 py-3">
                <p className="text-sm text-slate-400">
                  Page {page + 1} of {totalPages} · showing {pageItems.length} of{" "}
                  {filtered.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
