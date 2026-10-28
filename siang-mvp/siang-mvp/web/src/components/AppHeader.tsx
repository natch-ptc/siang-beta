"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CLOSE_ICON, SEARCH_ICON } from "@/lib/icons";
import Logo from "./Logo";
import styles from "./app.module.css";

// The bar at the top of each tab: the logo and search (it filters the list on
// the tab). Scanning has its own tab.
export default function AppHeader({
  query,
  onQuery,
  placeholder,
}: {
  query: string;
  onQuery: (q: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  function toggle() {
    if (open) {
      onQuery("");
      input.current?.blur();
    } else {
      // Focus inside the tap, so the keyboard comes up with the box on iOS.
      input.current?.focus({ preventScroll: true });
    }
    setOpen(!open);
  }

  return (
    <>
      <header className={styles.top}>
        <Link href="/" className={styles.logoLink}>
          <Logo height={30} />
        </Link>
        <div className={styles.topActs}>
          <button className={styles.iconBtn} onClick={toggle} aria-label={open ? "Close search" : "Search"} aria-expanded={open} type="button">
            {open ? CLOSE_ICON : SEARCH_ICON}
          </button>
        </div>
      </header>
      {/* Always in the page, so it can open and close smoothly rather than appear. */}
      <div className={`${styles.searchWrap} ${open ? styles.searchWrapOpen : ""}`} aria-hidden={!open}>
        <div className={styles.searchClip}>
          <label className={styles.search}>
            {SEARCH_ICON}
            <input
              ref={input}
              type="search"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder={placeholder}
              aria-label={placeholder}
              tabIndex={open ? 0 : -1}
              enterKeyHint="search"
            />
          </label>
        </div>
      </div>
    </>
  );
}

// Case-insensitive "does any of these mention the query".
export function matches(query: string, ...fields: (string | null | undefined)[]) {
  const q = query.trim().toLowerCase();
  return !q || fields.some((f) => f?.toLowerCase().includes(q));
}
