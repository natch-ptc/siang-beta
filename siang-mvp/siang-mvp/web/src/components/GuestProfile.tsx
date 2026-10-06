"use client";

import Link from "next/link";
import { CalendarDots, PaintBrushBroad, UserPlus, Waveform } from "@phosphor-icons/react/dist/ssr";
import type { Artist } from "@/lib/types";
import SavedLists from "./SavedLists";
import Logo, { Mark } from "./Logo";
import app from "./app.module.css";
import styles from "./Profile.module.css";

const STEPS = [
  { label: "Create profile", icon: <UserPlus size={40} weight="bold" /> },
  { label: "Upload your art", icon: <PaintBrushBroad size={40} weight="bold" /> },
  { label: "Create your exhibition", icon: <CalendarDots size={40} weight="bold" /> },
  { label: "Create your Siang", icon: <Waveform size={40} weight="bold" /> },
];

// The Profile tab for someone who is not signed in: the four steps to an
// artist profile (Draft-1), and what they saved, saw and follow.
export default function GuestProfile({ artists }: { artists: Artist[] }) {

  return (
    <>
      <header className={app.top}>
        <Link href="/" className={app.logoLink}>
          <Logo height={30} />
        </Link>
      </header>

      <h1 className={styles.heading}>
        <Mark height={17} /> Create your “artist” profile
      </h1>
      <p className={styles.lead}>Your works, your exhibitions and your own voice telling the story behind each piece. One link, one QR label.</p>
      <div className={styles.steps}>
        {STEPS.map((s) => (
          <div key={s.label} className={styles.step}>
            <span className={styles.stepArt}>{s.icon}</span>
            {s.label}
          </div>
        ))}
      </div>
      <div className={styles.cta}>
        <Link href="/join" className={app.btn}>
          Create your profile
        </Link>
        <Link href="/login" className={app.btnGhost}>
          Sign in
        </Link>
      </div>

      <SavedLists artists={artists} />
    </>
  );
}
