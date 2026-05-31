import { NextRequest, NextResponse } from "next/server";

const NASA_BASE = "https://api.nasa.gov";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> }
) {
  const { route } = await params;
  const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.searchParams);
  searchParams.set("api_key", apiKey);

  const nasaPath = route.join("/");
  const nasaUrl = `${NASA_BASE}/${nasaPath}?${searchParams.toString()}`;

  try {
    const response = await fetch(nasaUrl, {
      next: { revalidate: 3600 },
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch from NASA API", details: String(error) },
      { status: 502 }
    );
  }
}
