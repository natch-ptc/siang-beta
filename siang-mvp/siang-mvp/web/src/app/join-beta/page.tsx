import type { Metadata } from "next";
import JoinBeta from "@/components/landing/JoinBeta";
import "@/styles/siang-tokens.css";

export const metadata: Metadata = {
  title: "Join the beta · Siang.co",
};

export default function JoinBetaPage() {
  return <JoinBeta />;
}
