"use client";

import Link from "next/link";
import { ArrowRight, Radio } from "lucide-react";
import { MatrixRain } from "@/components/layout/matrix-rain";
import { MODULES } from "@/lib/nasa";

export function ChannelHero() {
  const feeds = MODULES.filter((m) => m.href !== "/").slice(0, 6);

  return (
    <section className="relative mb-12 overflow-hidden rounded-2xl border border-white/10">
      <div className="absolute inset-0 bg-black">
        <MatrixRain className="h-full w-full opacity-90" />
      </div>
      <div className="matrix-hero-vignette absolute inset-0" />

      <div className="relative z-10 flex min-h-[280px] flex-col justify-between p-6 sm:min-h-[320px] sm:p-8">
        <div className="flex items-center gap-2 text-[var(--matrix-green)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--matrix-green)] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--matrix-green)]" />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.24em]">
            Live NASA Data Feeds
          </span>
        </div>

        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Explore space with{" "}
            <span className="text-[var(--matrix-green)]">NASA open data</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-300 sm:text-lg">
            Daily imagery, rover photos, asteroid tracking, space weather, Earth
            observation, and patent search — eight modules in one dashboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="#apod" className="btn-primary">
            Today&apos;s APOD
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="#modules" className="btn-ghost">
            <Radio className="h-4 w-4" />
            Browse modules
          </Link>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/10 bg-black/80 px-6 py-3 backdrop-blur-sm sm:px-10">
        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          Active feeds
        </p>
        <div className="flex flex-wrap gap-2">
          {feeds.map((feed) => (
            <Link
              key={feed.href}
              href={feed.href}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-xs text-neutral-300 transition-colors hover:border-[var(--matrix-green)]/50 hover:text-[var(--matrix-green)]"
            >
              {feed.api}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
