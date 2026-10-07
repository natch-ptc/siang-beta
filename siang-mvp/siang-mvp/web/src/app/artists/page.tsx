import type { Metadata } from "next";
import TabPage from "@/components/TabPage";

export const metadata: Metadata = { title: "Artists · Siang.co" };

// The Artist tab.
export default function Page() {
  return <TabPage tab="artists" />;
}
