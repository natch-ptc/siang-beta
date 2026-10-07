import app from "@/components/app.module.css";
import styles from "@/components/Loading.module.css";

// Shown the moment a link is tapped, while the next page is read from the
// database, so a tap always answers at once. Shaped like the tab pages.
export default function Loading() {
  return (
    <main className={app.app} aria-busy="true" aria-label="Loading">
      <div className={styles.bar} />
      <div className={styles.chips}>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.grid}>
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
    </main>
  );
}
