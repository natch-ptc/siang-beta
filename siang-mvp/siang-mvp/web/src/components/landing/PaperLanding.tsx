"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sriracha } from "next/font/google";
import styles from "./PaperLanding.module.css";

// Marker-pen handwriting with Thai glyphs, for the note that reads like a quick doodle.
const handwriting = Sriracha({ weight: "400", subsets: ["thai", "latin"] });

type Paper = {
  tone: "pink" | "white";
  label: string;
  body: string[];
  sign?: { name: string; role?: string };
  handwritten?: boolean;
  // Resting spot relative to the stage centre, as a fraction of the paper's size.
  x: number;
  y: number;
  rot: number;
};

// Listed back to front.
const PAPERS: Paper[] = [
  {
    tone: "white",
    label: "From the team lead",
    body: ["หัวหน้าทีมกำลังตั้งใจเขียนครับ"],
    handwritten: true,
    x: 0.08,
    y: -0.2,
    rot: 4,
  },
  {
    tone: "white",
    label: "From Natch",
    body: [
      "สวัสดีครับสายผลิตและคนรักงานอาร์ต ยินดีมาก ๆ ที่ได้มาทำ Project เจ๋ง ๆ แบบนี้ให้ศิลปินได้ใช้",
      "อยากให้พวกเราที่เป็นสายเสพอาร์ตฟินที่ได้ยินเสียงของอาร์ตแต่ละชิ้นครับ จะได้ไปตามดูศิลปะจริง ๆ",
      "พอทำโปรเจคก็เลยได้คุยกับศิลปินและไปงานอาร์ตเยอะขึ้นอีก ขอบคุณพี่ ๆ เพื่อน ๆ ศิลปินที่ให้ฟี้ดแบ็คตลอดมานะครับ ตอนนี้ยังเป็นรอบเบต้า จะตั้งใจพัฒนาต่อไปครับ",
    ],
    sign: { name: "Natch R. Soros", role: "Dev และ Operation Manager ของ Siang.co" },
    x: -0.1,
    y: 0.16,
    rot: -5,
  },
  {
    tone: "pink",
    label: "Siang on… why we listen",
    body: [
      "พวกเราเป็นกลุ่มเล็ก ๆ ของเอนจิเนียร์ที่เอนจอยอาร์ต เรารู้ว่าศิลปะแต่ละชิ้นมีคุณค่า เรื่องราว และเสียงของศิลปินทุกคนในนั้น พวกเราเลยอยากชวนทุกคนมาฟัง “เสียง” และให้ “เสียง” เป็นสื่อให้ศิลปินได้เล่าเรื่องราวผ่านเสียงพูด เสียงดนตรี หรือเสียงบรรยากาศของศิลปะแต่ละชิ้น",
    ],
    sign: { name: "ทีมเสียง Siang.co" },
    x: 0.02,
    y: 0,
    rot: -1.5,
  },
];

const DEMO_HREF = process.env.NEXT_PUBLIC_BETA_PATH ?? "/demo";

export default function PaperLanding() {
  const stageRef = useRef<HTMLDivElement>(null);
  // Stacking order: the last index is on top. A paper you grab moves to the top.
  const [order, setOrder] = useState(() => PAPERS.map((_, i) => i));
  const [hintGone, setHintGone] = useState(false);

  const bringToFront = (i: number) => setOrder((o) => [...o.filter((j) => j !== i), i]);

  return (
    <div className={`siang ${styles.page}`}>
      <div className={styles.app}>
        <header className={styles.topbar}>
          <Image src="/siang-logo.png" alt="Siang" width={1899} height={429} className={styles.logo} priority />
        </header>

        <main className={styles.stage} ref={stageRef}>
          {PAPERS.map((p, i) => (
            <PaperSheet
              key={i}
              paper={p}
              z={order.indexOf(i) + 1}
              stageRef={stageRef}
              onGrab={() => bringToFront(i)}
              onMoved={() => setHintGone(true)}
            />
          ))}
        </main>

        <nav className={styles.bar}>
          <div className={styles.hint} style={{ opacity: hintGone ? 0 : 1 }}>
            Drag the papers around
          </div>
          <Link href={DEMO_HREF} className={styles.cta}>
            Try the demo
          </Link>
        </nav>
      </div>
    </div>
  );
}

function PaperSheet({
  paper,
  z,
  stageRef,
  onGrab,
  onMoved,
}: {
  paper: Paper;
  z: number;
  stageRef: React.RefObject<HTMLDivElement | null>;
  onGrab: () => void;
  onMoved: () => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  // Offset in px from the paper's resting spot; the resting spot itself is set in CSS
  // as a percentage so the layout stays centred on any screen size.
  const pos = useRef({ x: 0, y: 0 });
  const drag = useRef({ px: 0, py: 0, ox: 0, oy: 0, active: false, moved: false });

  const place = (lifted: boolean) => {
    const el = elRef.current!;
    const { x, y } = pos.current;
    el.style.translate = `${x}px ${y}px`;
    el.classList.toggle(styles.lifted, lifted);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    onGrab();
    drag.current = { px: e.clientX, py: e.clientY, ox: pos.current.x, oy: pos.current.y, active: true, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
    place(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    const el = elRef.current!;
    const stage = stageRef.current!;
    let x = d.ox + e.clientX - d.px;
    let y = d.oy + e.clientY - d.py;
    // Papers start centred, so capping the offset at half the stage (plus a sixth of
    // the paper) keeps enough of it on screen to grab again.
    const maxX = stage.clientWidth / 2 + el.offsetWidth / 6;
    const maxY = stage.clientHeight / 2 + el.offsetHeight / 6;
    x = Math.max(-maxX, Math.min(maxX, x));
    y = Math.max(-maxY, Math.min(maxY, y));
    pos.current = { x, y };
    if (!d.moved && Math.hypot(e.clientX - d.px, e.clientY - d.py) > 4) {
      d.moved = true;
      onMoved();
    }
    place(true);
  };

  const endDrag = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    place(false);
  };

  return (
    <div
      ref={elRef}
      className={`${styles.paper} ${paper.tone === "pink" ? styles.pink : styles.white}`}
      style={
        {
          zIndex: z,
          "--x": `${paper.x * 100}%`,
          "--y": `${paper.y * 100}%`,
          "--rot": `${paper.rot}deg`,
        } as React.CSSProperties
      }
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className={styles.label}>{paper.label}</div>
      <div className={paper.handwritten ? `${styles.hand} ${handwriting.className}` : styles.body}>
        {paper.body.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      {paper.sign && (
        <div className={styles.sign}>
          <b>{paper.sign.name}</b>
          {paper.sign.role && <span>{paper.sign.role}</span>}
        </div>
      )}
    </div>
  );
}
