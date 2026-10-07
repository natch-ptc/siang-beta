"use client";

import { useState } from "react";
import Link from "next/link";
import { CLOSE_ICON, SCAN_ICON, SEARCH_ICON } from "@/lib/icons";
import Logo from "./Logo";
import styles from "./app.module.css";

// The bar at the top of each tab: the logo, search (it filters the list on
// the tab) and the scan button that sits on every tab (PRD 6.1).
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

  function toggle() {
    if (open) onQuery("");
    setOpen(!open);
  }

  return (
    <>
      <header className={styles.top}>
        <Link href="/" className={styles.logoLink}>
          <Logo height={30} />
        </Link>
        <div className={styles.topActs}>
          <Link href="/w" className={styles.iconBtn} aria-label="Scan a code or type a work code">
            {SCAN_ICON}
          </Link>
          <button className={styles.iconBtn} onClick={toggle} aria-label={open ? "Close search" : "Search"} aria-expanded={open} type="button">
            {open ? CLOSE_ICON : SEARCH_ICON}
          </button>
        </div>
      </header>
      {open && (
        <label className={styles.search}>
          {SEARCH_ICON}
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            autoFocus
            enterKeyHint="search"
          />
        </label>
      )}
    </>
  );
}

// Case-insensitive "does any of these mention the query".
export function matches(query: string, ...fields: (string | null | undefined)[]) {
  const q = query.trim().toLowerCase();
  return !q || fields.some((f) => f?.toLowerCase().includes(q));
}
