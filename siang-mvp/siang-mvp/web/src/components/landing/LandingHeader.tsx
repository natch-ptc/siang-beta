import Link from "next/link";
import styles from "./LandingHeader.module.css";

export default function LandingHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span aria-hidden className={styles.logoMark}>▶◀▶</span>
          Siang
        </Link>
        <nav className={styles.nav}>
          <a href="#home" className={styles.navActive}>Home</a>
          <a href="#artist-hub">Artist Hub</a>
          <a href="#piece-page">Piece Page</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className={styles.actions}>
          <Link href="/mvp" className={styles.login}>
            Log in
          </Link>
          <Link href="/claim-your-link" className={styles.cta}>
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
