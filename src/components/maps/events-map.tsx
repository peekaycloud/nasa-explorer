"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import type { EonetEvent, EonetGeometry } from "@/lib/nasa";
import "leaflet/dist/leaflet.css";

type Props = {
  events: EonetEvent[];
  categoryColors: Record<string, string>;
};

function parseCoordinates(
  coords: number[] | number[][] | number[][][],
  type?: string
): [number, number] | null {
  if (!coords) return null;

  if (type === "Point" || typeof coords[0] === "number") {
    const [lon, lat] = coords as number[];
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return [lat, lon];
    }
    return null;
  }

  if (Array.isArray(coords[0]) && Array.isArray((coords as number[][])[0][0])) {
    const point = (coords as number[][][])[0][0];
    return [point[1], point[0]];
  }

  if (Array.isArray(coords[0])) {
    const point = (coords as number[][])[0];
    return [point[1], point[0]];
  }

  return null;
}

function getGeometryEntries(event: EonetEvent): EonetGeometry[] {
  if (event.geometry?.length) return event.geometry;
  if (event.geometries?.length) return event.geometries;
  return [];
}

function getEventCoords(event: EonetEvent): [number, number] | null {
  const entries = getGeometryEntries(event);
  if (!entries.length) return null;

  const geom = entries[entries.length - 1];
  return parseCoordinates(
    geom.coordinates ?? [],
    geom.type
  );
}

export function EventsMap({ events, categoryColors }: Props) {
  const markers = events
    .map((event) => {
      const pos = getEventCoords(event);
      if (!pos) return null;
      const categoryId = event.categories?.[0]?.id ?? "default";
      const color = categoryColors[categoryId] ?? categoryColors.default;
      return { event, pos, color };
    })
    .filter(Boolean) as Array<{
    event: EonetEvent;
    pos: [number, number];
    color: string;
  }>;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="h-[500px] w-full z-0"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {markers.map(({ event, pos, color }) => (
          <CircleMarker
            key={event.id}
            center={pos}
            radius={8}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.8 }}
          >
            <Popup>
              <strong>{event.title}</strong>
              <br />
              {(event.categories ?? []).map((c) => c.title).join(", ")}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {markers.length === 0 && (
        <p className="border-t border-white/10 p-4 text-center text-sm text-slate-400">
          No mappable coordinates found for the current events.
        </p>
      )}
    </div>
  );
}
