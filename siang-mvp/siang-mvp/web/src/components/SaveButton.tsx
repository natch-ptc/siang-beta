"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { stampSeen, useDeviceList } from "@/lib/device";
import { SAVED_ICON, SAVE_ICON } from "@/lib/icons";
import styles from "./Sheet.module.css";

// Save a work to come back to (PRD "To-go"). `path` is "artist/work". Saving
// says where the work went, with a link to the list (siang.co/saved).
export default function SaveButton({ path }: { path: string }) {
  const { items, toggle } = useDeviceList("saved");
  const on = items.includes(path);
  const [toast, setToast] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function tap() {
    toggle(path);
    clearTimeout(timer.current);
    setToast(!on);
    if (!on) timer.current = setTimeout(() => setToast(false), 4000);
  }

  return (
    <>
      <button type="button" className={styles.pill} onClick={tap} aria-pressed={on}>
        {on ? SAVED_ICON : SAVE_ICON}
        {on ? "Saved" : "Save"}
      </button>
      {toast && (
        <div className={styles.toast} role="status">
          <span>Saved to your list</span>
          <Link href="/saved">View</Link>
        </div>
      )}
    </>
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
