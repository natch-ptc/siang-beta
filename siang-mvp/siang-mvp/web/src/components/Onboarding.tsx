"use client";

import { CalendarDots, PaintBrushBroad, UserPlus, Waveform } from "@phosphor-icons/react/dist/ssr";
import { Mark } from "./Logo";

// The frame the whole join flow shares, from the sign-up form (/join) to the
// Studio's welcome steps: the Siang mark, the four Draft-1 steps, a title.

export type WelcomeStep = "profile" | "work" | "show" | "done";

const STEPS = [
  { id: "link", label: "Profile", icon: <UserPlus size={20} weight="bold" /> },
  { id: "work", label: "Art & sound", icon: <PaintBrushBroad size={20} weight="bold" /> },
  { id: "show", label: "Exhibition", icon: <CalendarDots size={20} weight="bold" /> },
  { id: "done", label: "Your Siang", icon: <Waveform size={20} weight="bold" /> },
] as const;

// Which of the four steps is current: link and profile are both "Profile".
export function StepDots({ at }: { at: "link" | WelcomeStep }) {
  const current = at === "profile" ? "link" : at;
  const index = STEPS.findIndex((s) => s.id === current);
  return (
    <ol style={ob.steps} aria-label={`Step ${index + 1} of ${STEPS.length}`}>
      {STEPS.map((s, i) => (
        <li key={s.id} style={{ ...ob.step, opacity: i <= index ? 1 : 0.38 }} aria-current={i === index ? "step" : undefined}>
          <span style={{ ...ob.stepIcon, ...(i === index ? ob.stepIconOn : null) }}>{s.icon}</span>
          <span>{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

export function OnboardingFrame({
  at,
  title,
  lead,
  onSkip,
  children,
}: {
  at: "link" | WelcomeStep;
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
      <div style={ob.onboardingBody}>
        <StepDots at={at} />
        <h1 style={ob.onboardingTitle}>{title}</h1>
        <p style={ob.onboardingLead}>{lead}</p>
        {children}
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
  onboardingTitle: { fontSize: 28, fontWeight: 500, lineHeight: 1.15, marginTop: 26 },
  onboardingLead: { fontSize: 15, lineHeight: 1.5, color: "rgba(255,255,255,.66)", marginTop: 8 },
  skip: { minHeight: 44, padding: "0 12px", background: "none", border: 0, color: "#fff", fontSize: 15, fontWeight: 500, cursor: "pointer" },
  steps: { listStyle: "none", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: 0, margin: "4px 0 0" },
  step: { display: "flex", flexDirection: "column", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 500, textAlign: "center", transition: "opacity 300ms" },
  stepIcon: {
    width: "100%",
    aspectRatio: "1.15",
    maxHeight: 64,
    borderRadius: 16,
    display: "grid",
    placeItems: "center",
    background: "#1b1b1b",
    transition: "background 300ms, color 300ms",
  },
  stepIconOn: { background: "#fff", color: "#0f0f0f" },
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
