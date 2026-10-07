import { cache } from "react";
import { createClient } from "./supabase/server";
import { fetchArtistBySlug, fetchOwnSlug } from "./queries";

// One artist with everything on their page. Cached for the request, so a
// page and its metadata share a single read. Finds the artist under a handle
// they have since changed, too: pages compare `artist.slug` with the address
// they were asked for and redirect to the new one.
export const loadArtist = cache(async (slug: string) => {
  const supabase = await createClient();
  return fetchArtistBySlug(supabase, decodeURIComponent(slug).toLowerCase());
});

// The signed-in visitor's own handle, if they are an artist. Their visits to
// their own pages are not counted as views.
export const loadOwnSlug = cache(async () => (await fetchOwnSlug(await createClient())).slug);
