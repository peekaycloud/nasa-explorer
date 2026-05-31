import { NextRequest, NextResponse } from "next/server";

const EPIC_BASE = "https://epic.gsfc.nasa.gov/api";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  const epicPath = date ? `/natural/date/${date}` : "/natural";
  const epicUrl = `${EPIC_BASE}${epicPath}`;

  try {
    const response = await fetch(epicUrl, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `EPIC API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch EPIC data", details: String(error) },
      { status: 502 }
    );
  }
}
