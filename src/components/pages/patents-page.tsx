"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { searchPatents } from "@/lib/nasa";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";

export function PatentsPage() {
  const [query, setQuery] = useState("robot");
  const [searchTerm, setSearchTerm] = useState("robot");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["patents", searchTerm],
    queryFn: () => searchPatents(searchTerm),
  });

  return (
    <div>
      <PageHeader
        icon="lab"
        title="NASA Patents"
        description="Search NASA's technology transfer database for patents and innovations available for licensing."
        api="TechTransfer"
      />

      <form
        className="mb-8 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSearchTerm(query);
        }}
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patents (e.g. propulsion, robotics, materials)..."
          className="border-white/10 bg-white/5"
        />
        <Button type="submit">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </form>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          message={
            error instanceof Error ? error.message : "Failed to search patents"
          }
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-400">
            {data?.count ?? 0} results for &ldquo;{searchTerm}&rdquo;
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {data?.results.map((patent) => (
              <Card key={patent.id} className="border-white/10 bg-white/5">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{patent.category}</Badge>
                    <Badge
                      variant="outline"
                      className={
                        patent.status === "Available"
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }
                    >
                      {patent.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-base leading-snug text-white">
                    {patent.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-slate-400">
                    {patent.abstract}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {patent.center}
                    {patent.patent_number && ` · ${patent.patent_number}`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
