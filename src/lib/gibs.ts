const GIBS_BASE = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi";
const MIN_IMAGE_BYTES = 10_000;

function buildBbox(lat: number, lon: number, delta = 0.45) {
  const south = Math.max(-90, lat - delta);
  const north = Math.min(90, lat + delta);
  const west = Math.max(-180, lon - delta);
  const east = Math.min(180, lon + delta);
  return `${south},${west},${north},${east}`;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function offsetDate(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return formatDate(date);
}

function buildGibsUrl(
  lat: number,
  lon: number,
  layer: string,
  time: string,
  zoom = 1
) {
  const delta = 0.45 / Math.max(zoom, 1);
  const width = Math.min(2400, Math.round(1200 * Math.sqrt(zoom)));
  const height = Math.min(1600, Math.round(800 * Math.sqrt(zoom)));

  const params = new URLSearchParams({
    SERVICE: "WMS",
    VERSION: "1.3.0",
    REQUEST: "GetMap",
    LAYERS: layer,
    BBOX: buildBbox(lat, lon, delta),
    CRS: "EPSG:4326",
    WIDTH: String(width),
    HEIGHT: String(height),
    FORMAT: "image/jpeg",
    TIME: time,
  });

  return `${GIBS_BASE}?${params.toString()}`;
}

async function fetchGibsImage(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || !contentType.includes("image")) {
    return null;
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength < MIN_IMAGE_BYTES) {
    return null;
  }

  return buffer;
}

export async function resolveEarthImagery(
  lat: number,
  lon: number,
  date?: string | null,
  zoom = 1
) {
  if (date) {
    const layer = "Landsat_WELD_CorrectedReflectance_TrueColor_Global_Monthly";
    const time = `${date.slice(0, 7)}-01`;
    const url = buildGibsUrl(lat, lon, layer, time, zoom);
    const buffer = await fetchGibsImage(url);

    if (!buffer) {
      throw new Error("No Landsat imagery available for this location or date");
    }

    return {
      buffer,
      date: time,
      layer: "Landsat WELD (monthly)",
      source: "NASA GIBS",
      zoom,
    };
  }

  const layer = "MODIS_Terra_CorrectedReflectance_TrueColor";

  for (let daysAgo = 3; daysAgo <= 30; daysAgo += 1) {
    const time = offsetDate(-daysAgo);
    const url = buildGibsUrl(lat, lon, layer, time, zoom);
    const buffer = await fetchGibsImage(url);
    if (buffer) {
      return {
        buffer,
        date: time,
        layer: "MODIS Terra (daily)",
        source: "NASA GIBS",
        zoom,
      };
    }
  }

  throw new Error("No recent MODIS imagery available for this location");
}
