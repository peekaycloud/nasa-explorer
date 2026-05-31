import { NextRequest, NextResponse } from "next/server";

const IMAGES_BASE = "https://images-api.nasa.gov/search";

const ROVER_QUERIES: Record<string, string> = {
  curiosity: "curiosity mars rover",
  perseverance: "perseverance mars rover",
  opportunity: "opportunity mars rover",
  spirit: "spirit mars rover",
};

function pickImageUrl(links: Array<{ href: string; rel?: string }> = []) {
  const preferred = links.find((l) => l.href.includes("~large."))
    ?? links.find((l) => l.href.includes("~medium."))
    ?? links.find((l) => l.href.includes("~orig."))
    ?? links[0];
  return preferred?.href?.replace(/^http:/, "https:") ?? "";
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const rover = url.searchParams.get("rover") ?? "curiosity";
  const earthDate = url.searchParams.get("earth_date") ?? "2020-06-01";
  const camera = url.searchParams.get("camera") ?? "all";
  const page = url.searchParams.get("page") ?? "1";

  const year = earthDate.split("-")[0];
  const query = ROVER_QUERIES[rover] ?? `${rover} mars rover`;

  const params = new URLSearchParams({
    q: query,
    media_type: "image",
    year_start: year,
    year_end: year,
    page,
    page_size: "25",
  });

  try {
    const response = await fetch(`${IMAGES_BASE}?${params.toString()}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Images API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const items = data?.collection?.items ?? [];

    let photos = items
      .map(
        (
          item: {
            data: Array<{
              nasa_id: string;
              title: string;
              date_created?: string;
              keywords?: string[];
              photographer?: string;
            }>;
            links?: Array<{ href: string; rel?: string }>;
          },
          index: number
        ) => {
          const meta = item.data?.[0];
          if (!meta) return null;

          const imgSrc = pickImageUrl(item.links);
          if (!imgSrc) return null;

          return {
            id: index,
            sol: 0,
            camera: {
              name: meta.keywords?.[0] ?? "NASA",
              full_name: meta.keywords?.join(", ") ?? "NASA Image Library",
            },
            img_src: imgSrc,
            earth_date: meta.date_created?.split("T")[0] ?? earthDate,
            rover: { name: rover },
            title: meta.title,
            nasa_id: meta.nasa_id,
          };
        }
      )
      .filter(Boolean);

    if (camera !== "all") {
      const cameraLower = camera.toLowerCase();
      photos = photos.filter(
        (photo: { camera: { name: string; full_name: string }; title: string }) =>
          photo.camera.name.toLowerCase().includes(cameraLower) ||
          photo.camera.full_name.toLowerCase().includes(cameraLower) ||
          photo.title.toLowerCase().includes(cameraLower)
      );
    }

    return NextResponse.json({ photos });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch Mars images", details: String(error) },
      { status: 502 }
    );
  }
}
