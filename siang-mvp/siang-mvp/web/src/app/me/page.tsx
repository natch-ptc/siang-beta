import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ArtistProfile from "@/components/ArtistProfile";
import GuestProfile from "@/components/GuestProfile";
import TabBar from "@/components/TabBar";
import { createClient } from "@/lib/supabase/server";
import { fetchArtistBySlug, fetchArtists, fetchOwnSlug } from "@/lib/queries";
import { todayInThailand } from "@/lib/format";
import { artistShare } from "@/lib/share";
import type { Artist } from "@/lib/types";
import app from "@/components/app.module.css";

export const metadata: Metadata = { title: "Profile · Siang.co" };

// The Profile tab. An artist sees their own page with Edit Profile; everyone
// else sees how to make one, and what they saved, saw and follow on this device.
export default async function ProfileTab() {
  const supabase = await createClient();
  const { signedIn, slug } = await fetchOwnSlug(supabase);
  if (signedIn && !slug) redirect("/studio"); // signed in, no profile yet: the Studio starts one

  const artist = slug ? await fetchArtistBySlug(supabase, slug) : null;
  let artists: Artist[] = [];
  if (!artist) {
    try {
      artists = [...(await fetchArtists(supabase, "registered")), ...(await fetchArtists(supabase, "examples"))];
    } catch (error) {
      console.error("fetchArtists failed", error); // the lists below stay empty; the rest of the tab still works
    }
  }

  return (
    <main className={app.app}>
      {artist ? <ArtistProfile artist={artist} today={todayInThailand()} own share={artistShare(artist)} /> : <GuestProfile artists={artists} />}
      <TabBar />
    </main>
  );
}
