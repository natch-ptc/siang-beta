import type { NextConfig } from "next";

// siang.co opens straight on the app (PRD v3, D10). The addresses the beta
// used to live at (/beta-version-1.0, /beta-1.N, /mvp) were shared and
// printed, so they redirect home instead of breaking.
const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/mvp", destination: "/", permanent: false },
      { source: "/beta-:old(\\d+\\.\\d+)", destination: "/", permanent: false },
      { source: "/beta-version-:v", destination: "/", permanent: false },
    ];
  },
  async rewrites() {
    return [
      // siang.co/app is the artist's own space: the studio (which sends signed-out visitors to /login).
      { source: "/app", destination: "/studio" },
    ];
  },
};

export default nextConfig;
