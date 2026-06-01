"use client";

import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MediaItem = {
  src: string;
  type?: "image" | "video";
  title?: string;
  caption?: string;
  thumbnail?: string;
};

type MediaViewerProps = {
  items: MediaItem[];
  index?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
  aspectRatio?: string;
  showThumbnails?: boolean;
  showSlideshow?: boolean;
  autoPlayMs?: number;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

export function MediaViewer({
  items,
  index: controlledIndex,
  onIndexChange,
  className,
  aspectRatio = "aspect-video",
  showThumbnails = true,
  showSlideshow = true,
  autoPlayMs = 0,
}: MediaViewerProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null
  );

  const index = controlledIndex ?? internalIndex;
  const setIndex = onIndexChange ?? setInternalIndex;
  const current = items[index];
  const hasMultiple = items.length > 1;
  const isVideo = current?.type === "video";

  const resetView = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (!items.length) return;
      const wrapped = (next + items.length) % items.length;
      setIndex(wrapped);
      resetView();
    },
    [items.length, resetView, setIndex]
  );

  useEffect(() => {
    if (!isPlaying || !showSlideshow || !hasMultiple || autoPlayMs <= 0) return;
    const timer = setInterval(() => goTo(index + 1), autoPlayMs);
    return () => clearInterval(timer);
  }, [autoPlayMs, goTo, hasMultiple, index, isPlaying, showSlideshow]);

  useEffect(() => {
    if (!isFullscreen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsFullscreen(false);
      if (event.key === "ArrowLeft") goTo(index - 1);
      if (event.key === "ArrowRight") goTo(index + 1);
      if (event.key === "+" || event.key === "=") {
        setZoom((z) => Math.min(MAX_ZOOM, +(z + 0.25).toFixed(2)));
      }
      if (event.key === "-") {
        setZoom((z) => Math.max(MIN_ZOOM, +(z - 0.25).toFixed(2)));
      }
      if (event.key === "0") resetView();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo, index, isFullscreen, resetView]);

  useEffect(() => {
    resetView();
  }, [current?.src, resetView]);

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    if (isVideo) return;
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.2 : 0.2;
    setZoom((z) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z + delta).toFixed(2)));
      if (next === MIN_ZOOM) setOffset({ x: 0, y: 0 });
      return next;
    });
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (zoom <= 1 || isVideo) return;
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      ox: offset.x,
      oy: offset.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    setOffset({
      x: dragRef.current.ox + (event.clientX - dragRef.current.x),
      y: dragRef.current.oy + (event.clientY - dragRef.current.y),
    });
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  if (!current) return null;

  const viewerBody = (
    <div className={cn("flex flex-col", isFullscreen && "h-full")}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <div className="min-w-0 flex-1">
          {current.title && (
            <p className="truncate text-sm font-medium text-white">{current.title}</p>
          )}
          {current.caption && (
            <p className="truncate text-xs text-slate-400">{current.caption}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {!isVideo && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() =>
                  setZoom((z) => Math.max(MIN_ZOOM, +(z - 0.25).toFixed(2)))
                }
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-xs text-slate-400">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() =>
                  setZoom((z) => Math.min(MAX_ZOOM, +(z + 0.25).toFixed(2)))
                }
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={resetView}
                aria-label="Reset zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
          {showSlideshow && hasMultiple && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setIsPlaying((p) => !p)}
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setIsFullscreen((f) => !f)}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={cn(
          "relative w-full overflow-hidden bg-black",
          isFullscreen ? "min-h-0 flex-1" : aspectRatio
        )}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {isVideo ? (
          <div
            className="flex h-full w-full items-center justify-center p-4"
            style={{
              transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
            }}
          >
            <iframe
              src={current.src}
              title={current.title ?? "Video"}
              className="aspect-video w-full max-w-5xl rounded-lg"
              allowFullScreen
            />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.src}
            alt={current.title ?? "Media"}
            draggable={false}
            className="absolute inset-0 m-auto max-h-full max-w-full select-none object-contain transition-transform duration-75"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              cursor: zoom > 1 ? "grab" : "zoom-in",
            }}
            onClick={() => {
              if (zoom === 1) setZoom(2);
            }}
          />
        )}

        {hasMultiple && (
          <>
            <Button
              size="icon"
              variant="secondary"
              className="absolute left-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/60"
              onClick={() => goTo(index - 1)}
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/60"
              onClick={() => goTo(index + 1)}
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {hasMultiple && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
            {index + 1} / {items.length}
          </div>
        )}
      </div>

      {showThumbnails && hasMultiple && (
        <div className="flex gap-2 overflow-x-auto border-t border-white/10 p-3">
          {items.map((item, i) => (
            <button
              key={`${item.src}-${i}`}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                i === index ? "border-[var(--matrix-green)]" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              {item.type === "video" ? (
                <div className="flex h-full w-full items-center justify-center bg-slate-900 text-xs text-white">
                  Video
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnail ?? item.src}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm">
        <div className="flex items-center justify-end p-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsFullscreen(false)}
            aria-label="Close fullscreen"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-hidden px-3 pb-3">{viewerBody}</div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border border-white/10", className)}>
      {viewerBody}
    </div>
  );
}
