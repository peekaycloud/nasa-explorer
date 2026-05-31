import { NextRequest, NextResponse } from "next/server";

const EONET_BASE = "https://eonet.gsfc.nasa.gov/api/v3";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path") ?? "events";
  const params = new URLSearchParams(url.searchParams);
  params.delete("path");

  const eonetUrl = `${EONET_BASE}/${path}?${params.toString()}`;

  try {
    const response = await fetch(eonetUrl, {
      next: { revalidate: 1800 },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch EONET data", details: String(error) },
      { status: 502 }
    );
  }
}
