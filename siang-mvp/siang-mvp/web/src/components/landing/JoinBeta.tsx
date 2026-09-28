"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import frame from "./PaperLanding.module.css";
import styles from "./JoinBeta.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function JoinBeta() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ email: string; alreadyJoined: boolean } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) {
      setError("Enter your name.");
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/beta-testers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, handle: instagram.trim(), source: "landing-join-beta" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again.");
        return;
      }
      setDone({ email: trimmedEmail, alreadyJoined: !!data.alreadyJoined });
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`siang ${frame.page} ${styles.page} ${styles.scroll}`}>
      <div className={`${frame.app} ${styles.app} ${styles.grow}`}>
        <header className={frame.topbar}>
          <Link href="/" aria-label="Back to Siang">
            <Image src="/siang-logo.png" alt="Siang" width={1899} height={429} className={frame.logo} priority />
          </Link>
        </header>

        <main className={styles.stage}>
          <div className={styles.paper}>
            {done ? (
              <div className={styles.done} aria-live="polite">
                <div className={styles.label}>Beta test</div>
                <h1 className={styles.title}>{done.alreadyJoined ? "You're already on the list" : "You're on the list"}</h1>
                <p className={styles.lead}>
                  ขอบคุณที่สนใจนะ เราจะติดต่อไปที่ <strong>{done.email}</strong> เมื่อเปิดให้ทดลอง
                </p>
                <p className={styles.lead}>ถ้าเป็นศิลปิน สร้างหน้าของคุณบน Siang ได้เลยตอนนี้</p>
                <Link
                  href={`/login?mode=signup&email=${encodeURIComponent(done.email)}`}
                  className={`${frame.cta} ${frame.ctaBrand} ${styles.submit}`}
                >
                  Create your artist page
                </Link>
              </div>
            ) : (
              <form onSubmit={onSubmit} className={styles.form} noValidate>
                <div className={styles.label}>Beta test</div>
                <h1 className={styles.title}>Join the beta</h1>
                <p className={styles.lead}>ฝากชื่อกับอีเมลไว้ แล้วเราจะติดต่อกลับเมื่อเปิดให้ทดลอง</p>

                <label className={styles.field}>
                  <span>Name</span>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ชื่อของคุณ"
                    autoComplete="name"
                  />
                </label>
                <label className={styles.field}>
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    inputMode="email"
                  />
                </label>
                <label className={styles.field}>
                  <span>
                    Instagram <em>(optional)</em>
                  </span>
                  <input
                    type="text"
                    name="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@yourname"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                </label>

                {error && (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={submitting} className={`${frame.cta} ${frame.ctaBrand} ${styles.submit}`}>
                  {submitting ? "Sending…" : "Join the beta"}
                </button>
              </form>
            )}
          </div>
        </main>

        <nav className={frame.bar}>
          <Link href="/" className={`${frame.cta} ${styles.back}`}>
            Back
          </Link>
        </nav>
      </div>
    </div>
  );
}
