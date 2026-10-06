import TabPage from "@/components/TabPage";

// siang.co opens on the app (PRD v3, D10): the Art tab, newest works first. The old landing page is at /about.
export default function Page() {
  return <TabPage tab="art" set="registered" />;
}
