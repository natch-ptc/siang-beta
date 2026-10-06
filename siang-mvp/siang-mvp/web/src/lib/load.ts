import { cache } from "react";
import { createClient } from "./supabase/server";
import { fetchArtistBySlug } from "./queries";

// One artist with everything on their page. Cached for the request, so a
// page and its metadata share a single read.
export const loadArtist = cache(async (slug: string) => {
  const supabase = await createClient();
  return fetchArtistBySlug(supabase, decodeURIComponent(slug).toLowerCase());
});
