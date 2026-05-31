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

  try {
    const imagery = await resolveEarthImagery(lat, lon, date, zoom);

    return new NextResponse(imagery.buffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
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
