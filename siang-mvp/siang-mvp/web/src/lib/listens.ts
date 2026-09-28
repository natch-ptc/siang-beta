import { createClient } from "./supabase/client";

// A play counts as a listen once someone has heard 30 seconds of a work, or
// half of it if it's shorter — tapping play and skipping straight on doesn't.
export function listenThreshold(durationSec: number) {
  return Math.min(30, Math.max(1, durationSec / 2));
}

// Each work is counted at most once per browser session, so replaying or
// scrubbing back doesn't inflate the number.
const KEY = "siang:listened";
let counted: Set<string> | null = null;

function loadCounted() {
  if (counted) return counted;
  try {
    counted = new Set(JSON.parse(sessionStorage.getItem(KEY) ?? "[]") as string[]);
  } catch {
    counted = new Set();
  }
  return counted;
}

// Feed every timeupdate here. Only time actually played adds up (small forward
// steps between updates), so scrubbing ahead doesn't earn a listen.
const heard = new Map<string, { last: number; secs: number }>();
export function noteHeard(artworkId: string, currentTime: number, durationSec: number) {
  if (!durationSec || loadCounted().has(artworkId)) return;
  const h = heard.get(artworkId) ?? { last: currentTime, secs: 0 };
  const step = currentTime - h.last;
  if (step > 0 && step < 1.5) h.secs += step;
  h.last = currentTime;
  heard.set(artworkId, h);
  if (h.secs >= listenThreshold(durationSec)) countListen(artworkId);
}

// Logs the play and bumps artworks.listen_count through the
// increment_listen_count() function from supabase/migrations/0001_init.sql.
export function countListen(artworkId: string) {
  const seen = loadCounted();
  if (seen.has(artworkId)) return;
  seen.add(artworkId);
  try {
    sessionStorage.setItem(KEY, JSON.stringify([...seen]));
  } catch {
    // private mode or storage full — the in-memory set still dedupes this visit
  }
  void createClient()
    .rpc("increment_listen_count", { p_artwork_id: artworkId })
    .then(({ error }) => {
      if (error) console.warn("Could not count this listen:", error.message);
    });
}
