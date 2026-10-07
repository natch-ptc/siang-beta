"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Splash } from "./Onboarding";

// The Siang mark fading up when someone opens siang.co: the same opening as
// /join. Once per visit (per browser tab), and only when the visit starts on
// the home page; arriving on an artist's or a work's page goes straight there.
const KEY = "siang:opened";
let opened = false; // true once the opening has played, or been skipped, in this tab
const listeners = new Set<() => void>();

function hasOpened() {
  if (opened) return true;
  try {
    opened = sessionStorage.getItem(KEY) === "1";
  } catch {
    // storage blocked: the flag above still holds for this page load
  }
  return opened;
}

function markOpened() {
  opened = true;
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    // as above
  }
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

// In the root layout, so it is on screen from the first paint, before the
// home page's works have loaded.
export default function OpeningSplash() {
  const pathname = usePathname();
  // On the server nothing has opened yet, so the splash is in the first HTML.
  const done = useSyncExternalStore(subscribe, hasOpened, () => false);
  const finish = useCallback(() => markOpened(), []);

  // A visit that starts anywhere else has no opening to play later.
  useEffect(() => {
    if (pathname !== "/") markOpened();
  }, [pathname]);

  if (done || pathname !== "/") return null;
  return <Splash onDone={finish} />;
}
