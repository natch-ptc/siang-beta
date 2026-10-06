"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ART, NAV_ARTISTS, NAV_PROFILE, NAV_SHOWS } from "@/lib/icons";
import styles from "./app.module.css";

// PRD v3 names the three tabs Art, Place and Artist; the Draft-1 design labels
// them Exploring, Exhibition and Hot Artist!, and adds Profile.
const TABS = [
  { path: "", label: "Exploring", icon: NAV_ART },
  { path: "/exhibitions", label: "Exhibition", icon: NAV_SHOWS },
  { path: "/artists", label: "Hot Artist!", icon: NAV_ARTISTS },
];

// Pages that are not part of the app: the marketing pages, sign in, the code keypad.
const HIDDEN = ["/about", "/join", "/login", "/w", "/auth"];

// Lives in the root layout, so it stays still while pages change under it.
// Inside the demo (/demo/...) the tabs list the example artists.
export default function TabBar() {
  const pathname = usePathname();
  if (HIDDEN.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;
  const base = pathname === "/demo" || pathname.startsWith("/demo/") ? "/demo" : "";
  const tabs = [
    ...TABS.map((t) => ({ ...t, href: base + t.path || "/", on: pathname === (base + t.path || "/") })),
    { href: "/me", label: "Profile", icon: NAV_PROFILE, on: pathname === "/me" || pathname === "/studio" },
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
