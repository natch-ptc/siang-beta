import type { Metadata } from "next";
import CodePad from "@/components/CodePad";

export const metadata: Metadata = { title: "Type a work code · Siang.co" };

// siang.co/w: the keypad for the six-digit code on a work's label, and the scanner.
export default function CodePage() {
  return <CodePad />;
}
