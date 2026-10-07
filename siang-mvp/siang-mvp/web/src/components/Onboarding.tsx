"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, QrCode, UserCircle } from "@phosphor-icons/react/dist/ssr";
import Logo, { Mark } from "./Logo";
import m from "./Onboarding.module.css";

// The join flow: a splash, one screen on what Siang is, then two short steps
// (your account, your link). After that the artist lands on their own page,
// where a short tour (components/Tour.tsx) points at sharing and uploading.
// Nothing after the link is required: works are added one at a time, whenever.

// What the Studio shows over the artist's page right after joining:
// "ready" = the checkpoint (what you have now), "tour" = the two tips.
export type WelcomeStep = "ready" | "tour";

const STEP_NAMES = ["Account", "Your link"];

// Where you are in the two steps. The bar for the current step fills as the screen arrives.
export function Progress({ step }: { step: 1 | 2 }) {
  return (
    <div className={m.progress} role="img" aria-label={`Step ${step} of ${STEP_NAMES.length}: ${STEP_NAMES[step - 1]}`}>
      <div className={m.bars}>
        {STEP_NAMES.map((name, i) => (
          <span key={name} className={m.barTrack}>
            {i < step && <span className={`${m.barFill} ${i === step - 1 ? m.barFillNew : ""}`} />}
          </span>
        ))}
      </div>
      <span className={m.progressLabel}>
        {step} of {STEP_NAMES.length}
      </span>
    </div>
  );
}

export function OnboardingFrame({
  step,
  title,
  lead,
  onSkip,
  children,
}: {
  step?: 1 | 2; // leave out on screens that aren't one of the two steps
  title: string;
  lead: string;
  onSkip?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={ob.onboarding} role="dialog" aria-modal="true" aria-label={title}>
      <div style={ob.onboardingTop}>
        <Mark height={20} />
        {onSkip ? (
          <button style={ob.skip} onClick={onSkip} type="button">
            Skip
          </button>
        ) : (
          <span />
        )}
      </div>
      <div style={ob.onboardingBody} className={m.stagger}>
        {step ? <Progress step={step} /> : <span />}
        <h1 style={ob.onboardingTitle}>{title}</h1>
        <p style={ob.onboardingLead}>{lead}</p>
        {children}
      </div>
    </div>
  );
}

// The first thing at /join: the mark fades up on its own, holds a moment, then
// gives way to the intro. A tap skips the wait.
export function Splash({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const hold = setTimeout(() => setLeaving(true), 1700);
    return () => clearTimeout(hold);
  }, []);
  useEffect(() => {
    if (!leaving) return;
    const out = setTimeout(onDone, 320);
    return () => clearTimeout(out);
  }, [leaving, onDone]);
  return (
    <button className={`${m.splash} ${leaving ? m.leaving : ""}`} onClick={() => setLeaving(true)} aria-label="Siang. Tap to continue" type="button">
      <span className={m.splashInner}>
        <span className={m.splashMark}>
          <Logo height={34} />
        </span>
        <span className={m.splashLine} lang="th">
          ศิลปะฟังได้
        </span>
      </span>
    </button>
  );
}

const POINTS = [
  {
    icon: <QrCode size={22} weight="bold" />,
    title: "A QR code beside your work",
    text: "Visitors scan it and hear you tell the story, in your own voice.",
  },
  {
    icon: <UserCircle size={22} weight="bold" />,
    title: "Your own artist page",
    text: "One link for your works, your sound and how to reach you.",
  },
  {
    icon: <Plus size={22} weight="bold" />,
    title: "Add works one at a time",
    text: "As many as you like, whenever you like. Nothing has to be finished today.",
  },
];

// What Siang is, in one screen, before any form.
export function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className={m.intro} role="dialog" aria-modal="true" aria-label="What Siang is">
      <Logo height={20} />
      <div className={`${m.introHead} ${m.stagger}`}>
        <h1 className={m.introTitle}>
          Art you
          <br />
          can hear
        </h1>
        <p className={m.introLead}>Siang puts the artist&apos;s voice next to the work: what it is, why you made it, in a minute of sound.</p>
      </div>
      <ul className={`${m.points} ${m.stagger}`}>
        {POINTS.map((p) => (
          <li key={p.title} className={m.point}>
            <span className={m.pointIcon}>{p.icon}</span>
            <span>
              <b>{p.title}</b>
              <span>{p.text}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className={m.introActs}>
        <button style={ob.submit} onClick={onStart} type="button">
          Create your artist page
        </button>
        <Link href="/login" style={ob.quiet}>
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}

export const ob: Record<string, React.CSSProperties> = {
  onboarding: {
    position: "fixed",
    inset: 0,
    zIndex: 61,
    maxWidth: 520,
    margin: "0 auto",
    background: "#0f0f0f",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    animation: "vt-fade 240ms ease-out both",
  },
  onboardingTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "calc(14px + env(safe-area-inset-top)) 12px 6px 22px",
    minHeight: 58,
  },
  onboardingBody: { flex: 1, overflowY: "auto", padding: "8px 22px calc(32px + env(safe-area-inset-bottom))" },
  onboardingTitle: { fontSize: 28, fontWeight: 500, lineHeight: 1.15, marginTop: 30 },
  onboardingLead: { fontSize: 15, lineHeight: 1.5, color: "rgba(255,255,255,.66)", marginTop: 8 },
  skip: { minHeight: 44, padding: "0 12px", background: "none", border: 0, color: "#fff", fontSize: 15, fontWeight: 500, cursor: "pointer" },
  form: { display: "flex", flexDirection: "column", gap: 14, marginTop: 22 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.7)" },
  input: {
    height: 48,
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.06)",
    color: "#fff",
    padding: "0 14px",
    fontSize: 16,
    fontFamily: "inherit",
  },
  hint: { fontSize: 12.5, fontWeight: 400, color: "rgba(255,255,255,.5)" },
  error: { fontSize: 13.5, lineHeight: 1.45, color: "#ff8a8a", margin: 0 },
  submit: {
    height: 52,
    borderRadius: 999,
    border: 0,
    background: "#fff",
    color: "#0f0f0f",
    fontWeight: 500,
    fontSize: 16,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    textDecoration: "none",
  },
  quiet: { minHeight: 44, fontSize: 14, color: "rgba(255,255,255,.7)", textAlign: "center", textDecoration: "underline", textUnderlineOffset: 3, display: "block", lineHeight: "44px", background: "none", border: 0, width: "100%", cursor: "pointer" },
};
