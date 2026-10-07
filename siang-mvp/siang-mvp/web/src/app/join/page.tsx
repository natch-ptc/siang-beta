import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import JoinClient from "./JoinClient";

export const metadata: Metadata = { title: "Join the beta · Siang.co" };

// siang.co/join: the one way in for an artist. It replaces the old waitlist
// (/join-beta and /claim-your-link redirect here, see next.config.ts): the
// details people gave there now make their account straight away, and the
// Studio carries on with their link, profile, first work and exhibition.
export default async function JoinPage({ searchParams }: { searchParams: Promise<{ email?: string | string[] }> }) {
  const { data } = await (await createClient()).auth.getClaims();
  if (data?.claims?.sub) redirect("/studio"); // already in: carry on where they left off
  const { email } = await searchParams;
  return <JoinClient initialEmail={typeof email === "string" ? email : ""} />;
}
