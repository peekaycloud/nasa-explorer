import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "apod.nasa.gov" },
      { protocol: "https", hostname: "www.nasa.gov" },
      { protocol: "https", hostname: "mars.jpl.nasa.gov" },
      { protocol: "https", hostname: "mars.nasa.gov" },
      { protocol: "https", hostname: "epic.gsfc.nasa.gov" },
      { protocol: "https", hostname: "api.nasa.gov" },
      { protocol: "https", hostname: "images-assets.nasa.gov" },
      { protocol: "https", hostname: "earthengine.googleapis.com" },
      { protocol: "https", hostname: "gibs.earthdata.nasa.gov" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
};

export default nextConfig;
