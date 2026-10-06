import type { Metadata } from "next";
import TabPage from "@/components/TabPage";

export const metadata: Metadata = { title: "Demo · Siang.co" };

// The demo's Exhibition tab.
export default function Page() {
  return <TabPage tab="exhibitions" set="examples" />;
}
