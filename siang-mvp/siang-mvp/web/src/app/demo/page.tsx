import type { Metadata } from "next";
import TabPage from "@/components/TabPage";

export const metadata: Metadata = { title: "Demo · Siang.co" };

// siang.co/demo: the same app filled with example artists, to show what Siang is.
export default function Page() {
  return <TabPage tab="art" set="examples" />;
}
