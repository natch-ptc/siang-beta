"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "pocket:slugs";

// Which artists are in *your* Pocket, persisted per-browser via localStorage.
// Anonymous, no auth required — mirrors how a real "save this card" feature
// would work for a visitor who hasn't signed up.
export function usePocket(defaultSlugs: string[]) {
  const [slugs, setSlugs] = useState<string[] | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setSlugs(raw ? (JSON.parse(raw) as string[]) : defaultSlugs);
    } catch {
      setSlugs(defaultSlugs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const add = useCallback((slug: string) => {
    setSlugs((cur) => {
      const base = cur ?? defaultSlugs;
      if (base.includes(slug)) return base;
      const next = [...base, slug];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // localStorage unavailable (private mode etc) — the add still works
        // for this session, it just won't persist across reloads.
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { slugs: slugs ?? defaultSlugs, ready: slugs !== null, add };
}
