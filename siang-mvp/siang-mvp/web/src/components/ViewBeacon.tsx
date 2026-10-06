"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const KEY = "siang:viewed";

// Counts a page view: once per visitor, page and day (kept in this browser),
// through count_view() from supabase/migrations/0016_beta_checklist.sql.
// Pages don't render it for the artist looking at their own page.
export default function ViewBeacon({ kind, id }: { kind: "artist" | "artwork"; id: string }) {
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    let seen: { day: string; ids: string[] } = { day: today, ids: [] };
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "null") as typeof seen | null;
      if (saved?.day === today && Array.isArray(saved.ids)) seen = saved;
    } catch {
      // storage blocked: count the view, without remembering it
    }
    if (seen.ids.includes(id)) return;
    seen.ids.push(id);
    try {
      localStorage.setItem(KEY, JSON.stringify(seen));
    } catch {
      // as above
    }
    void createClient()
      .rpc("count_view", { p_kind: kind, p_id: id })
      .then(({ error }) => {
        if (error) console.warn("Could not count this view:", error.message);
      });
  }, [kind, id]);
  return null;
}
