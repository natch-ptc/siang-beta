"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CardFace from "./CardFace";
import { QR_GLYPH_BIG, USER_ICON } from "@/lib/icons";
import type { ArtistCard } from "@/lib/types";
import styles from "./CardStack.module.css";

// Stacking geometry, ported from the original mockup: each depth step (0..5)
// gets a vertical offset, a scale, and an opacity; anything past depth 5 is hidden.
const OFF = [0, 0.215, 0.375, 0.49, 0.565, 0.565];
const SCALE = [1, 0.925, 0.865, 0.82, 0.79, 0.78];
const OP = [1, 1, 1, 1, 0.85, 0];

type Props = {
  cards: ArtistCard[];
  onOpen: (card: ArtistCard) => void;
  onScan: () => void;
};

export default function CardStack({ cards, onOpen, onScan }: Props) {
  const stackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const [active, setActive] = useState(0);
  const busyRef = useRef(false);
  const [hintGone, setHintGone] = useState(false);

  const n = cards.length;

  const layout = (instant: boolean) => {
    const stackEl = stackRef.current;
    if (!stackEl) return;
    const h = stackEl.clientHeight || 1;
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const d = (i - active + n) % n;
      const k = Math.min(d, 5);
      if (instant) el.classList.add(styles.noAnim);
      el.style.zIndex = String(100 - d);
      el.style.transform = `translateY(${-OFF[k] * h}px) scale(${SCALE[k]})`;
      el.style.opacity = String(d >= 5 ? 0 : OP[k]);
      el.style.pointerEvents = d >= 5 ? "none" : "auto";
      el.classList.toggle(styles.front, d === 0);
      if (instant) {
        void el.offsetHeight;
        el.classList.remove(styles.noAnim);
      }
    });
  };

  const mountedRef = useRef(false);
  useEffect(() => {
    // Only the very first paint (and a window resize) should snap instantly —
    // an active change after that (sending a card to the back) should ease
    // the rest of the stack forward instead of popping into place.
    layout(!mountedRef.current);
    mountedRef.current = true;
    const onResize = () => layout(true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, n]);

  const cycle = () => {
    if (busyRef.current || n < 2) return false;
    busyRef.current = true;
    const stackEl = stackRef.current!;
    const el = cardRefs.current[active];
    const h = stackEl.clientHeight;
    el.classList.remove(styles.lifted);
    el.style.transition = "transform 300ms cubic-bezier(.4,.1,.7,1), opacity 240ms linear";
    el.style.transform = `translateY(${h * 0.85}px) scale(.94)`;
    el.style.opacity = "0";
    setTimeout(() => {
      el.style.transition = "";
      el.classList.add(styles.noAnim);
      setActive((a) => (a + 1) % n);
      void el.offsetHeight;
      el.classList.remove(styles.noAnim);
      busyRef.current = false;
      setHintGone(true);
    }, 300);
    return true;
  };

  const cycleTo = (index: number) => {
    let steps = (index - active + n) % n;
    const run = () => {
      if (steps-- > 0) {
        cycle();
        setTimeout(run, 210);
      }
    };
    run();
  };

  return (
    <div className={styles.app}>
      <header className={styles.topbar}>
        <Image
          src="/siang-logo.png"
          alt="Siang"
          width={1899}
          height={429}
          className={styles.logo}
          priority
        />
        <Link href="/studio" className={styles.me} aria-label="Your studio">
          {USER_ICON}
        </Link>
      </header>

      <main className={styles.stage}>
        <div className={styles.stack} ref={stackRef}>
          {cards.map((c, i) => (
            <Card
              key={c.id}
              card={c}
              index={i}
              active={active}
              n={n}
              busyRef={busyRef}
              cycle={cycle}
              cycleTo={cycleTo}
              onOpen={() => onOpen(c)}
              registerRef={(el) => {
                if (el) cardRefs.current[i] = el;
              }}
              relayout={() => layout(false)}
            />
          ))}
        </div>
      </main>

      <nav className={styles.bar}>
        <div className={styles.hint} style={{ opacity: hintGone ? 0 : 1 }}>
          Pull a card down to send it to the back
        </div>
        <button className={`${styles.pill} ${styles.pillSolid}`} onClick={() => onOpen(cards[active])}>
          Open card
        </button>
        <button className={`${styles.pill} ${styles.pillIcon}`} aria-label="Scan a QR code to add an artist card" onClick={onScan}>
          {QR_GLYPH_BIG}
        </button>
      </nav>
    </div>
  );
}

function Card({
  card,
  index,
  active,
  n,
  busyRef,
  cycle,
  cycleTo,
  onOpen,
  registerRef,
  relayout,
}: {
  card: ArtistCard;
  index: number;
  active: number;
  n: number;
  busyRef: React.MutableRefObject<boolean>;
  cycle: () => boolean;
  cycleTo: (i: number) => void;
  onOpen: () => void;
  registerRef: (el: HTMLDivElement | null) => void;
  relayout: () => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ sx: 0, sy: 0, dy: 0, moved: false, t0: 0, dragging: false });

  const depth = (index - active + n) % n;

  const onPointerDown = (e: React.PointerEvent) => {
    if (busyRef.current || depth !== 0) return;
    const el = elRef.current!;
    drag.current = { sx: e.clientX, sy: e.clientY, dy: 0, moved: false, t0: Date.now(), dragging: true };
    el.classList.add(styles.noAnim, styles.lifted);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.dragging) return;
    const el = elRef.current!;
    const dy = e.clientY - drag.current.sy;
    drag.current.dy = dy;
    if (Math.abs(dy) > 5 || Math.abs(e.clientX - drag.current.sx) > 5) drag.current.moved = true;
    const pull = dy > 0 ? dy : dy * 0.28;
    el.style.transform = `translateY(${pull}px) scale(${1 - Math.min(Math.abs(pull), 260) / 2600}) rotate(${
      (e.clientX - drag.current.sx) / 60
    }deg)`;
    el.style.opacity = String(1 - Math.max(0, dy - 40) / 420);
  };

  const endDrag = () => {
    if (!drag.current.dragging) return;
    drag.current.dragging = false;
    const el = elRef.current!;
    el.classList.remove(styles.noAnim);
    const { dy, moved, t0 } = drag.current;
    const quick = Date.now() - t0 < 260;

    if (!moved && depth === 0) {
      el.classList.remove(styles.lifted);
      relayout();
      onOpen();
      return;
    }
    if (dy > 90 || (quick && dy > 40)) {
      if (cycle()) return;
      el.classList.remove(styles.lifted);
      el.style.opacity = "";
      relayout();
      return;
    }
    if (dy < -70) {
      el.classList.remove(styles.lifted);
      relayout();
      onOpen();
      return;
    }
    el.classList.remove(styles.lifted);
    relayout();
  };

  return (
    <div
      ref={(el) => {
        (elRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        registerRef(el);
      }}
      className={styles.card}
    >
      <CardFace card={card} />
      <button
        className={styles.grab}
        aria-label={card.name}
        tabIndex={depth <= 4 ? 0 : -1}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={() => {
          if (depth > 0 && !busyRef.current) cycleTo(index);
        }}
        onKeyDown={(e) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          depth === 0 ? onOpen() : cycleTo(index);
        }}
      />
    </div>
  );
}
