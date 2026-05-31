import { NextRequest, NextResponse } from "next/server";

const PATENTS_BASE = "https://technology.nasa.gov/api/api/patent";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "robot";

  try {
    const response = await fetch(`${PATENTS_BASE}/${encodeURIComponent(query)}`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Patents API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch patent data", details: String(error) },
      { status: 502 }
    );
  }
}
