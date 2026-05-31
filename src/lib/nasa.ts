export type ApodResponse = {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: "image" | "video";
  copyright?: string;
};

export type MarsPhoto = {
  id: number;
  sol: number;
  camera: { name: string; full_name: string };
  img_src: string;
  earth_date: string;
  rover: { name: string };
  title?: string;
  nasa_id?: string;
};

export type MarsPhotosResponse = {
  photos: MarsPhoto[];
};

export type EpicImage = {
  identifier: string;
  caption: string;
  image: string;
  date: string;
  coords: { centroid_coordinates: { lat: number; lon: number } };
};

export type NeoAsteroid = {
  id: string;
  name: string;
  is_potentially_hazardous_asteroid: boolean;
  estimated_diameter: {
    kilometers: { estimated_diameter_min: number; estimated_diameter_max: number };
  };
  close_approach_data: Array<{
    close_approach_date: string;
    miss_distance: { lunar: string; kilometers: string };
    relative_velocity: { kilometers_per_hour: string };
  }>;
};

export type NeoFeedResponse = {
  element_count: number;
  near_earth_objects: Record<string, NeoAsteroid[]>;
};

export type EonetGeometry = {
  type?: string;
  date?: string;
  coordinates?: number[] | number[][] | number[][][];
  magnitudeValue?: number;
  magnitudeUnit?: string;
};

export type EonetEvent = {
  id: string;
  title: string;
  categories: Array<{ id: string; title: string }>;
  geometry?: EonetGeometry[];
  geometries?: EonetGeometry[];
  sources?: Array<{ url: string }>;
};

export type EonetResponse = {
  events: EonetEvent[];
};

export type DonkiEvent = {
  activityID?: string;
  flrID?: string;
  cmeID?: string;
  gstID?: string;
  beginTime?: string;
  peakTime?: string;
  endTime?: string;
  sourceLocation?: string;
  classType?: string;
  note?: string;
  linkedEvents?: Array<{ activityID: string }>;
  kpIndex?: number;
  allKpIndex?: Array<{ kpIndex: number; observedTime: string }>;
};

export type EarthImageryResponse = {
  url: string;
  date: string;
  layer?: string;
  source?: string;
  id?: string;
};

export type Patent = {
  id: string;
  title: string;
  abstract: string;
  category: string;
  status: string;
  center: string;
  patent_number?: string;
};

type PatentRow = [
  string,
  string,
  string,
  string,
  string,
  string,
  ...string[],
];

export type PatentsResponse = {
  count: number;
  results: Patent[];
};

async function nasaFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const search = new URLSearchParams(params);
  const query = search.toString();
  const url = `/api/nasa/${path}${query ? `?${query}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { error?: string }).error ?? `NASA API error: ${response.status}`
    );
  }
  return response.json();
}

export async function getApod(date?: string): Promise<ApodResponse> {
  return nasaFetch<ApodResponse>("planetary/apod", date ? { date } : undefined);
}

export async function getMarsPhotos(
  rover: string,
  earthDate: string,
  camera?: string
): Promise<MarsPhotosResponse> {
  const params = new URLSearchParams({
    rover,
    earth_date: earthDate,
  });
  if (camera && camera !== "all") params.set("camera", camera);

  const response = await fetch(`/api/mars?${params.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { error?: string }).error ?? `Mars API error: ${response.status}`
    );
  }
  return response.json();
}

export async function getEpicImages(date?: string): Promise<EpicImage[]> {
  const params = date ? `?date=${date}` : "";
  const response = await fetch(`/api/epic${params}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { error?: string }).error ?? `EPIC API error: ${response.status}`
    );
  }
  return response.json();
}

export function getEpicImageUrl(image: EpicImage): string {
  const [year, month, day] = image.date.split(" ")[0].split("-");
  return `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/png/${image.image}.png`;
}

export async function getNeoFeed(
  startDate: string,
  endDate: string
): Promise<NeoFeedResponse> {
  return nasaFetch<NeoFeedResponse>("neo/rest/v1/feed", {
    start_date: startDate,
    end_date: endDate,
  });
}

export async function getEonetEvents(days = 30): Promise<EonetResponse> {
  const response = await fetch(`/api/eonet?path=events&days=${days}&status=open`);
  if (!response.ok) throw new Error("Failed to fetch natural events");
  return response.json();
}

export async function getSolarFlares(
  startDate: string,
  endDate: string
): Promise<DonkiEvent[]> {
  return nasaFetch<DonkiEvent[]>("DONKI/FLR", {
    startDate,
    endDate,
  });
}

export async function getCmeEvents(
  startDate: string,
  endDate: string
): Promise<DonkiEvent[]> {
  return nasaFetch<DonkiEvent[]>("DONKI/CME", {
    startDate,
    endDate,
  });
}

export async function getGeomagneticStorms(
  startDate: string,
  endDate: string
): Promise<DonkiEvent[]> {
  return nasaFetch<DonkiEvent[]>("DONKI/GST", {
    startDate,
    endDate,
  });
}

export async function getEarthImagery(
  lat: number,
  lon: number,
  date?: string,
  zoom = 1
): Promise<EarthImageryResponse> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    zoom: zoom.toString(),
  });
  if (date) params.set("date", date);

  const response = await fetch(`/api/earth-imagery?${params.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { error?: string }).error ??
        `Earth imagery error: ${response.status}`
    );
  }
  return response.json();
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "");
}

function mapPatentRow(row: PatentRow): Patent {
  return {
    id: row[0],
    title: stripHtml(row[2] ?? row[1]),
    abstract: stripHtml(row[3] ?? ""),
    category: row[5] ?? row[3] ?? "general",
    status: row[4]?.startsWith("patent_") ? "Available" : (row[4] ?? "Unknown"),
    center: row[9] ?? row[5] ?? "NASA",
    patent_number: row[1],
  };
}

export async function searchPatents(query: string): Promise<PatentsResponse> {
  const response = await fetch(
    `/api/patents?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { error?: string }).error ?? `Patents API error: ${response.status}`
    );
  }

  const data = (await response.json()) as {
    count: number;
    total?: number;
    results: PatentRow[];
  };

  return {
    count: data.total ?? data.count,
    results: data.results.map(mapPatentRow),
  };
}

export const MODULES = [
  {
    href: "/",
    title: "Daily Space Photo",
    description: "Astronomy Picture of the Day with full explanation",
    icon: "🌌",
    api: "APOD",
  },
  {
    href: "/mars",
    title: "Mars Gallery",
    description: "Rover photos from Curiosity, Perseverance & more",
    icon: "🔴",
    api: "Mars Rover",
  },
  {
    href: "/earth",
    title: "Earth from Space",
    description: "Daily full-Earth photos from the DSCOVR satellite",
    icon: "🌍",
    api: "EPIC",
  },
  {
    href: "/asteroids",
    title: "Asteroid Tracker",
    description: "Near-Earth asteroids, size, distance & hazard status",
    icon: "☄️",
    api: "NeoWs",
  },
  {
    href: "/events",
    title: "Natural Events",
    description: "Wildfires, storms & volcanoes tracked worldwide",
    icon: "🌪️",
    api: "EONET",
  },
  {
    href: "/weather",
    title: "Space Weather",
    description: "Solar flares, CMEs & geomagnetic storms",
    icon: "🌤️",
    api: "DONKI",
  },
  {
    href: "/imagery",
    title: "Earth Imagery",
    description: "Landsat satellite imagery by coordinates & date",
    icon: "🛰️",
    api: "Landsat",
  },
  {
    href: "/patents",
    title: "NASA Patents",
    description: "Searchable NASA technology transfer database",
    icon: "🧪",
    api: "TechTransfer",
  },
] as const;
