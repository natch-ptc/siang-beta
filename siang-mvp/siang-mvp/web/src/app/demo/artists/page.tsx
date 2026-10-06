import type { Metadata } from "next";
import TabPage from "@/components/TabPage";

export const metadata: Metadata = { title: "Demo · Siang.co" };

// The demo's Artist tab.
export default function Page() {
  return <TabPage tab="artists" set="examples" />;
}
