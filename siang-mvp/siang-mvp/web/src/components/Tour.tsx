"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Tour.module.css";

export type TourStep = {
  target: string; // CSS selector of the control to point at, e.g. '[data-tour="share"]'
  title: string;
  text: string;
  next: string; // label of the main button
  skip: string; // label of the quiet one
  onNext?: () => void; // runs before moving on (the last step's runs before the tour closes)
};

type Rect = { top: number; left: number; width: number; height: number };
const PAD = 6;
const GAP = 14;

// Points at one control at a time and says what it is for. Skippable at every
// step; closing it never changes anything on the page.
export default function Tour({ steps, onClose }: { steps: TourStep[]; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardPos, setCardPos] = useState<{ top: number; left: number } | null>(null);
  const step = steps[index];

  const measure = useCallback(() => {
    const el = document.querySelector(step.target);
    if (!el) return setRect(null);
    const r = el.getBoundingClientRect();
    setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
  }, [step.target]);

  // Bring the target into view, then keep the spotlight on it while the page moves.
  useEffect(() => {
    document.querySelector(step.target)?.scrollIntoView({ block: "center", behavior: "smooth" });
    const first = requestAnimationFrame(measure);
    const settle = setInterval(measure, 120); // follows the smooth scroll
    const stop = setTimeout(() => clearInterval(settle), 900);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(first);
      clearInterval(settle);
      clearTimeout(stop);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step.target, measure]);

  // The card sits under the target when there is room, otherwise above it.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const card = cardRef.current;
      if (!card) return;
      const cw = card.offsetWidth;
      const ch = card.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (!rect) return setCardPos({ top: Math.max(16, (vh - ch) / 2), left: (vw - cw) / 2 });
      const below = rect.top + rect.height + GAP;
      const top = below + ch <= vh - 16 ? below : Math.max(16, rect.top - GAP - ch);
      const left = Math.min(vw - cw - 16, Math.max(16, rect.left + rect.width / 2 - cw / 2));
      setCardPos({ top, left });
    });
    return () => cancelAnimationFrame(frame);
  }, [rect, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function next() {
    step.onNext?.();
    if (index === steps.length - 1) onClose();
    else setIndex(index + 1);
  }

  return (
    <>
      {/* Swallows taps on the page underneath while the tour is open. */}
      <div className={styles.catch} aria-hidden="true" />
      <div className={styles.spot} style={rect ? rect : { top: "50%", left: "50%", width: 0, height: 0, opacity: 0 }} aria-hidden="true" />
      <div
        ref={cardRef}
        className={styles.card}
        style={cardPos ? cardPos : { top: 0, left: 0, visibility: "hidden" }}
        role="dialog"
        aria-modal="true"
        aria-label={step.title}
      >
        <p className={styles.count}>
          {index + 1} of {steps.length}
        </p>
        <h2 className={styles.title}>{step.title}</h2>
        <p className={styles.text}>{step.text}</p>
        <div className={styles.acts}>
          <button className={styles.skip} onClick={onClose} type="button">
            {step.skip}
          </button>
          <button className={styles.next} onClick={next} autoFocus type="button">
            {step.next}
          </button>
        </div>
      </div>
    </>
  );
}
