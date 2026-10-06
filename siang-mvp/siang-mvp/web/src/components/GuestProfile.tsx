"use client";

import Link from "next/link";
import type { Artist } from "@/lib/types";
import SavedLists from "./SavedLists";
import Logo from "./Logo";
import app from "./app.module.css";
import styles from "./Profile.module.css";

// The Profile tab for someone who is not signed in: an invitation to join,
// nothing more. What they saved, saw or follow shows below it once there is any.
export default function GuestProfile({ artists }: { artists: Artist[] }) {
  return (
    <>
      <header className={app.top}>
        <Link href="/" className={app.logoLink}>
          <Logo height={30} />
        </Link>
      </header>

      <section className={styles.join}>
        <h1 className={styles.joinTitle}>Join Siang Beta</h1>
        <div className={styles.joinActs}>
          <Link href="/join" className={app.btn}>
            Create your profile
          </Link>
          <Link href="/login" className={app.btnGhost}>
            Sign in
          </Link>
        </div>
      </section>

      <SavedLists artists={artists} />
    </>
  );
}
