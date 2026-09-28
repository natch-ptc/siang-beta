import type { Metadata } from "next";
import PocketPage from "@/components/PocketPage";

export const metadata: Metadata = { title: "Demo · Siang.co" };

// siang.co/demo: the Pocket filled with example artists, to show what Siang is.
export default function Demo() {
  return <PocketPage set="examples" />;
}
