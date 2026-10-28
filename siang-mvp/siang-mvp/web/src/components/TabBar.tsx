"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ART, NAV_ARTISTS, NAV_PLACE, NAV_PROFILE, NAV_SCAN } from "@/lib/icons";
import styles from "./app.module.css";

// The five tabs of the app mockups: Art, Artist, Scan, Place and Me. Scan opens
// the code keypad and scanner at /w.
const TABS = [
  { path: "", label: "Art", icon: NAV_ART },
  { path: "/artists", label: "Artist", icon: NAV_ARTISTS },
  { path: "/w", label: "Scan", icon: NAV_SCAN },
  { path: "/exhibitions", label: "Place", icon: NAV_PLACE },
];

// Pages that are not part of the app: the marketing pages and sign in.
const HIDDEN = ["/about", "/join", "/login", "/auth"];

// Lives in the root layout, so it stays still while pages change under it.
export default function TabBar() {
  const pathname = usePathname();
  if (HIDDEN.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;
  const tabs = [
    ...TABS.map((t) => ({ ...t, href: t.path || "/", on: pathname === (t.path || "/") })),
    { href: "/me", label: "Me", icon: NAV_PROFILE, on: ["/me", "/studio", "/saved"].includes(pathname) },
  ];
  return (
    <nav className={styles.tabbar} aria-label="Siang" style={{ viewTransitionName: "tab-bar" }}>
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} className={`${styles.tab} ${t.on ? styles.tabOn : ""}`} aria-current={t.on ? "page" : undefined}>
          {t.icon}
          <span>{t.label}</span>
        </Link>
      ))}
    </nav>
  );
}
