import type { Metadata } from "next";
import TabPage from "@/components/TabPage";

export const metadata: Metadata = { title: "Exhibitions · Siang.co" };

// The Place tab: exhibitions on now, closing soonest first.
export default function Page() {
  return <TabPage tab="exhibitions" />;
}
