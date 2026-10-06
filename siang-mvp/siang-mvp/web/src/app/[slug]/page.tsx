import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ArtistProfile from "@/components/ArtistProfile";
import PageTransition from "@/components/PageTransition";
import ViewBeacon from "@/components/ViewBeacon";
import { loadArtist, loadOwnSlug } from "@/lib/load";
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
  const { slug } = await params;
  const artist = await loadArtist(slug);
  if (!artist) notFound();
  // The artist changed their handle: the old address leads to the new one.
  if (artist.slug !== decodeURIComponent(slug).toLowerCase()) redirect("/" + artist.slug);
  const own = (await loadOwnSlug()) === artist.slug;
  return (
    <main className={app.app}>
      {!own && <ViewBeacon kind="artist" id={artist.id} />}
      <PageTransition>
        <ArtistProfile artist={artist} today={todayInThailand()} own={own} share={artistShare(artist)} />
      </PageTransition>
    </main>
  );
}
