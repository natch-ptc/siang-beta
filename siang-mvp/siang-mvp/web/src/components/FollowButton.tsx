"use client";

import { useDeviceList } from "@/lib/device";
import { CHECK_SM, PLUS_SM } from "@/lib/icons";
import styles from "./app.module.css";

// Follow an artist. Kept on this device until visitor accounts exist; there is
// no follower count anywhere (PRD rule 11).
export default function FollowButton({ slug, name }: { slug: string; name: string }) {
  const { items, toggle } = useDeviceList("follows");
  const on = items.includes(slug);
  return (
    <button
      type="button"
      className={`${styles.follow} ${on ? styles.following : ""}`}
      onClick={() => toggle(slug)}
      aria-pressed={on}
      aria-label={on ? `Following ${name}. Tap to unfollow` : `Follow ${name}`}
    >
      {on ? CHECK_SM : PLUS_SM}
      {on ? "Following" : "Follow"}
    </button>
  );
}
