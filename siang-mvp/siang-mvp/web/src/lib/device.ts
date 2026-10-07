"use client";

import { useCallback, useSyncExternalStore } from "react";

// Lists a visitor keeps without an account, saved in this browser: the artists
// they follow, the works they saved (To-go) and the works they opened from a
// printed code (Seen). PRD rule 6: we ask people to sign in only after a
// visit — so until visitor accounts exist, these live on the device.
export type DeviceList = "follows" | "saved" | "seen";

const key = (list: DeviceList) => `siang:${list}`;
const EMPTY: string[] = [];
const cache = new Map<DeviceList, { raw: string | null; items: string[] }>();
const listeners = new Set<() => void>();

function read(list: DeviceList): string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key(list));
  } catch {
    // storage blocked (private mode): keep whatever this visit has so far
    return cache.get(list)?.items ?? EMPTY;
  }
  const hit = cache.get(list);
  if (hit && hit.raw === raw) return hit.items;
  let items = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) items = parsed.filter((x): x is string => typeof x === "string");
  } catch {
    // not our JSON: treat as empty
  }
  cache.set(list, { raw, items });
  return items;
}

function write(list: DeviceList, items: string[]) {
  const raw = JSON.stringify(items);
  cache.set(list, { raw, items });
  try {
    localStorage.setItem(key(list), raw);
  } catch {
    // storage full or blocked: the change lasts until the page reloads
  }
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function addToDeviceList(list: DeviceList, id: string) {
  const items = read(list);
  if (!items.includes(id)) write(list, [...items, id]);
}

// Seen keeps the first day a work ("artist/work") was opened in person, as
// "artist/work|2026-10-06".
export function stampSeen(path: string, date: string) {
  if (!read("seen").some((item) => item.startsWith(path + "|"))) addToDeviceList("seen", `${path}|${date}`);
}

// The list, and a toggle for one entry. Empty on the server and on first
// paint, then filled from storage.
export function useDeviceList(list: DeviceList) {
  const items = useSyncExternalStore(
    subscribe,
    () => read(list),
    () => EMPTY
  );
  const toggle = useCallback(
    (id: string) => {
      const current = read(list);
      write(list, current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
    },
    [list]
  );
  return { items, toggle };
}
