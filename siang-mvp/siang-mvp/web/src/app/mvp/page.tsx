import HomeClient from "@/components/HomeClient";
import { createClient } from "@/lib/supabase/server";
import { fetchArtists } from "@/lib/queries";
import { OWNED } from "@/lib/mock-artists";

export default async function Home() {
  const supabase = await createClient();
  let cards = OWNED;
  try {
    const fetched = await fetchArtists(supabase);
    if (fetched.length > 0) cards = fetched;
  } catch {
    // Supabase not reachable or not seeded yet — fall back to mock data
    // rather than showing an empty stack.
  }

  return <HomeClient cards={cards} />;
}
