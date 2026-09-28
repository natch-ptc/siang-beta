import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArtistPublicView from "@/components/ArtistPublicView";
import { createClient } from "@/lib/supabase/server";
import { fetchArtistBySlug } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const supabase = await createClient();
  return fetchArtistBySlug(supabase, slug.toLowerCase());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await load((await params).slug);
  if (!found) return { title: "Siang.co" };
  const { artist } = found;
  return {
    title: `${artist.name} · Siang.co`,
    description: artist.bio || `${artist.name} on Siang. Art you can hear.`,
  };
}

export default async function ArtistPublicPage({ params }: Props) {
  const found = await load((await params).slug);
  if (!found) notFound();
  return <ArtistPublicView artist={found.artist} links={found.links} />;
}
