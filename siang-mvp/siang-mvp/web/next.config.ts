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
      // The old waitlist pages: joining now makes the account straight away.
      { source: "/join-beta", destination: "/join", permanent: false },
      { source: "/claim-your-link", destination: "/join", permanent: false },
      // The demo with its made-up artists is gone; the examples now live on Siang's own page.
      { source: "/demo", destination: "/siang", permanent: false },
      { source: "/demo/:path*", destination: "/siang", permanent: false },
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
