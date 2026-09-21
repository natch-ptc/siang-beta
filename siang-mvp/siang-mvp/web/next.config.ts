import { execSync } from "node:child_process";
import type { NextConfig } from "next";

// The beta number is 1.<commits since BASE>, so every commit that lands bumps
// it and the public URL becomes /beta-1.N. BASE is the commit count at the
// point /beta-1.1 was introduced.
const BASE_COMMIT_COUNT = 39;

function betaVersion() {
  try {
    const count = Number(execSync("git rev-list --count HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim());
    if (Number.isInteger(count) && count > BASE_COMMIT_COUNT) return `1.${count - BASE_COMMIT_COUNT}`;
  } catch {
    // No git history available at build time (e.g. a source-only deploy).
  }
  return process.env.BETA_VERSION ?? "1.1";
}

const version = betaVersion();
const betaPath = `/beta-${version}`;

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_BETA_PATH: betaPath },
  async redirects() {
    return [
      { source: "/mvp", destination: betaPath, permanent: false },
      { source: "/demo", destination: betaPath, permanent: false },
      // Any older /beta-x.y goes to the current one (the current path is excluded to avoid a loop).
      { source: `/beta-:old((?!${version.replace(".", "\\.")}$)\\d+\\.\\d+)`, destination: betaPath, permanent: false },
    ];
  },
  async rewrites() {
    return [{ source: betaPath, destination: "/mvp" }];
  },
};

export default nextConfig;
