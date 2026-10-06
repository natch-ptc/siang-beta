"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { stampSeen, useDeviceList } from "@/lib/device";
import { SAVED_ICON, SAVE_ICON } from "@/lib/icons";
import styles from "./Sheet.module.css";

// Save a work to come back to (PRD "To-go"). `path` is "artist/work".
export default function SaveButton({ path }: { path: string }) {
  const { items, toggle } = useDeviceList("saved");
  const on = items.includes(path);
  return (
    <button type="button" className={styles.pill} onClick={() => toggle(path)} aria-pressed={on}>
      {on ? SAVED_ICON : SAVE_ICON}
      {on ? "Saved" : "Save"}
    </button>
  );
}

// A work opened through its printed code (siang.co/w/123456 sends people on
// with ?seen=1) is stamped into Seen with the date, then the mark is taken
// off the address so a link shared from here doesn't stamp anyone else.
export function SeenStamp({ path, today }: { path: string; today: string }) {
  const seen = useSearchParams().get("seen");
  useEffect(() => {
    if (!seen) return;
    stampSeen(path, today);
    window.history.replaceState(window.history.state, "", window.location.pathname);
  }, [seen, path, today]);
  return null;
}
