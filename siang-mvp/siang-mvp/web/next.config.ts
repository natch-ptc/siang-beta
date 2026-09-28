import type { NextConfig } from "next";

// The live beta lives at a fixed address, /beta-version-<BETA_VERSION>. Bump
// this by hand when a new beta round starts; older addresses redirect here.
// (It used to be /beta-1.<commit count>, which changed on every push.)
const BETA_VERSION = "1.0";
const betaPath = `/beta-version-${BETA_VERSION}`;
const escaped = BETA_VERSION.replace(/\./g, "\\.");

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_BETA_PATH: betaPath, NEXT_PUBLIC_BETA_VERSION: BETA_VERSION },
  async redirects() {
    return [
      { source: "/mvp", destination: betaPath, permanent: false },
      // Old auto-numbered links (/beta-1.N) and any other beta version go to the current one.
      { source: "/beta-:old(\\d+\\.\\d+)", destination: betaPath, permanent: false },
      { source: `/beta-version-:v((?!${escaped}$).+)`, destination: betaPath, permanent: false },
    ];
  },
  async rewrites() {
    return [
      // The live beta: registered artists only (app/mvp). The example cards are at /demo.
      { source: betaPath, destination: "/mvp" },
      // siang.co/app is the artist's own space: the studio (which sends signed-out visitors to /login).
      { source: "/app", destination: "/studio" },
    ];
  },
};

export default nextConfig;
