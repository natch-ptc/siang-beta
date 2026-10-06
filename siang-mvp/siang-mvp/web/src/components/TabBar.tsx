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

// `base` is "/demo" inside the demo, where the tabs list the example artists.
export default function TabBar({ base = "" }: { base?: string }) {
  const pathname = usePathname();
  const tabs = [...TABS.map((t) => ({ ...t, href: base + t.path || "/" })), { href: "/me", label: "Profile", icon: NAV_PROFILE }];
  return (
    <nav className={styles.tabbar} aria-label="Siang">
      {tabs.map((t) => {
        const on = pathname === t.href;
        return (
          <Link key={t.href} href={t.href} className={`${styles.tab} ${on ? styles.tabOn : ""}`} aria-current={on ? "page" : undefined}>
            {t.icon}
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
