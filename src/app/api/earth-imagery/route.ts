import { NextRequest, NextResponse } from "next/server";
import { resolveEarthImagery } from "@/lib/gibs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const lat = parseFloat(url.searchParams.get("lat") ?? "");
  const lon = parseFloat(url.searchParams.get("lon") ?? "");
  const date = url.searchParams.get("date");
  const zoom = Math.min(
    4,
    Math.max(1, parseFloat(url.searchParams.get("zoom") ?? "1") || 1)
  );

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json(
      { error: "Valid lat and lon are required" },
      { status: 400 }
    );
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: "Coordinates out of range" },
      { status: 400 }
    );
  }

  try {
    const imagery = await resolveEarthImagery(lat, lon, date, zoom);
    const imageParams = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      zoom: zoom.toString(),
    });
    if (date) imageParams.set("date", date);

    return NextResponse.json({
      url: `/api/earth-imagery/image?${imageParams.toString()}`,
      date: imagery.date,
      layer: imagery.layer,
      source: imagery.source,
      zoom: imagery.zoom,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No satellite imagery available for this location or date",
      },
      { status: 404 }
    );
  }
}
