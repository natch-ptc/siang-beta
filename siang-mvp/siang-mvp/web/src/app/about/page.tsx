import type { Metadata } from "next";
import PaperLanding from "@/components/landing/PaperLanding";
import "@/styles/siang-tokens.css";

export const metadata: Metadata = { title: "About · Siang.co" };

// The landing page that used to be the home page; siang.co now opens on the app.
export default function About() {
  return <PaperLanding />;
}
