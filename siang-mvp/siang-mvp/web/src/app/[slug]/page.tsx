import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArtistProfile from "@/components/ArtistProfile";
import TabBar from "@/components/TabBar";
import { createClient } from "@/lib/supabase/server";
import { fetchOwnSlug } from "@/lib/queries";
import { loadArtist } from "@/lib/load";
import { todayInThailand } from "@/lib/format";
import { artistShare } from "@/lib/share";
import app from "@/components/app.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artist = await loadArtist((await params).slug);
  if (!artist) return { title: "Siang.co" };
  return {
    title: `${artist.name} · Siang.co`,
    description: artist.bio || `${artist.name} on Siang. Art, artists and places, with sound.`,
  };
}

// siang.co/<slug>: an artist's page.
export default async function ArtistPage({ params }: Props) {
  const artist = await loadArtist((await params).slug);
  if (!artist) notFound();
  const own = (await fetchOwnSlug(await createClient())).slug === artist.slug;
  return (
    <main className={app.app}>
      <ArtistProfile artist={artist} today={todayInThailand()} own={own} share={artistShare(artist)} />
      <TabBar />
    </main>
  );
}
