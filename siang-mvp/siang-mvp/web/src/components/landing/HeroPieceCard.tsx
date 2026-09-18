"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Export, Pause, Play } from "@phosphor-icons/react/dist/ssr";
import styles from "./LandingPage.module.css";

type Lang = "th" | "en";

const COPY: Record<Lang, {
  audioLabel: string;
  audioValue: string;
  textLabel: string;
  textValue: string;
  imageLabel: string;
  imageValue: string;
  blurb: string;
  meta: string;
  trackTitle: string;
  trackArtist: string;
  madeWith: string;
}> = {
  en: {
    audioLabel: "Audio",
    audioValue: "Anong, in English",
    textLabel: "Text",
    textValue: "340 words",
    imageLabel: "Image",
    imageValue: "2 photographs from the kiln",
    blurb:
      "Thrown thin in a small studio near the Ping river. Every work is recorded inside the kiln while it fires.",
    meta: "Gallery Seascape, Chiang Mai · 2025",
    trackTitle: "น้ำนิ่ง (Still Water)",
    trackArtist: "Anong Vetchakul",
    madeWith: "Made with Siang",
  },
  th: {
    audioLabel: "เสียง",
    audioValue: "อนงค์ พากย์ภาษาไทย",
    textLabel: "ข้อความ",
    textValue: "340 คำ",
    imageLabel: "ภาพ",
    imageValue: "ภาพถ่าย 2 ภาพจากเตาเผา",
    blurb: "ขึ้นรูปบางในสตูดิโอเล็ก ๆ ริมแม่น้ำปิง งานทุกชิ้นถูกบันทึกเสียงขณะอยู่ในเตาเผา",
    meta: "แกลเลอรี Seascape เชียงใหม่ · 2025",
    trackTitle: "น้ำนิ่ง (Still Water)",
    trackArtist: "อนงค์ เวชกุล",
    madeWith: "สร้างด้วย Siang",
  },
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function HeroPieceCard() {
  const [lang, setLang] = useState<Lang>("en");
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const t = COPY[lang];

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <div className={styles.heroCard}>
      <div className={styles.heroCardTop}>
        <span className={styles.langToggle}>
          <button
            type="button"
            className={lang === "th" ? styles.langActive : styles.langInactive}
            onClick={() => setLang("th")}
          >
            ไทย
          </button>
          {" · "}
          <button
            type="button"
            className={lang === "en" ? styles.langActive : styles.langInactive}
            onClick={() => setLang("en")}
          >
            EN
          </button>
        </span>
        <Export size={16} weight="regular" aria-hidden="true" />
      </div>
      <div className={styles.heroCardBody}>
        <div className={styles.heroThumbGroup}>
          <div className={styles.heroThumb}>
            <Image
              src="/art/pa-german-bowl-boehmer.jpg"
              alt="Watercolor study of a Pennsylvania German glazed bowl, by Fritz Boehmer, c. 1939"
              fill
              sizes="(max-width: 768px) 100vw, 420px"
              className={styles.heroThumbImg}
            />
          </div>
          <p className={styles.heroImageCredit}>
            Fritz Boehmer, <em>Pa. German Bowl</em>, c. 1939 —{" "}
            <a href="https://www.nga.gov/artworks/15633-pa-german-bowl" target="_blank" rel="noopener noreferrer">
              National Gallery of Art, Open Access
            </a>
          </p>
        </div>
        <dl className={styles.heroDl}>
          <Row label={t.audioLabel} value={t.audioValue} />
          <Row label={t.textLabel} value={t.textValue} />
          <Row label={t.imageLabel} value={t.imageValue} />
          <p className={styles.heroBlurb}>{t.blurb}</p>
          <p className={styles.heroMeta}>{t.meta}</p>
        </dl>
      </div>
      <div className={styles.heroPlayer}>
        <button type="button" className={styles.playBtn} onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause size={16} weight="fill" aria-hidden="true" /> : <Play size={16} weight="fill" aria-hidden="true" />}
        </button>
        <div>
          <p className={styles.heroTrackTitle}>{t.trackTitle}</p>
          <p className={styles.heroTrackMeta}>
            {t.trackArtist} · {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>
        <audio
          ref={audioRef}
          className={styles.hidden}
          src="/audio/chiming-pottery.ogg"
          preload="metadata"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onEnded={() => setPlaying(false)}
        />
      </div>
      <p className={styles.heroImageCredit}>
        Sound: <em>Chiming pottery</em> by Stephan —{" "}
        <a
          href="https://commons.wikimedia.org/wiki/File:Chiming_pottery.ogg"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wikimedia Commons, CC0
        </a>
      </p>
      <p className={styles.heroMadeWith}>{t.madeWith}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.heroRow}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
