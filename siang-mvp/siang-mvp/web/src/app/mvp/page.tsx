import PocketPage from "@/components/PocketPage";

// Served at /beta-version-<n> (see next.config.ts): the live beta, registered artists only.
export default function LiveBeta() {
  return <PocketPage set="registered" />;
}
