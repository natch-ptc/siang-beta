import Link from "next/link";
import styles from "@/components/ArtistPublicView.module.css";

export default function ArtistNotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.column} style={{ padding: "96px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em" }}>No artist here yet</h1>
        <p style={{ marginTop: 10, fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.5 }}>
          Check the link, or claim this address for your own work.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 22 }}>
          <Link href="/" className={styles.openApp}>
            Siang home
          </Link>
          <Link href="/login?mode=signup" className={styles.openApp} style={{ background: "#000", color: "#fff", borderColor: "#000" }}>
            Make your page
          </Link>
        </div>
      </div>
    </main>
  );
}
