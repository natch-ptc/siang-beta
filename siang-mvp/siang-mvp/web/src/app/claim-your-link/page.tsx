"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import LandingHeader from "@/components/landing/LandingHeader";
import SiteFooter from "@/components/landing/SiteFooter";
import "@/styles/siang-tokens.css";
import styles from "./ClaimYourLink.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ClaimYourLinkPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ email: string } | null>(null);

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
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          handle: handle.trim(),
          source: "landing",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again.");
        return;
      }
      setDone({ email: trimmedEmail });
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`siang ${styles.page}`}>
      <LandingHeader />

      <main className={styles.main}>
        <div className={styles.formWrap}>
          <div className={styles.card}>
            {done ? (
              <div className={styles.success}>
                <p className={styles.successTitle}>You&apos;re on the list</p>
                <p className={styles.successBody}>
                  We&apos;ll email you at <strong>{done.email}</strong> when your link is ready.
                </p>
                <Link href="/" className={styles.successCta}>
                  Back to Siang
                </Link>
              </div>
            ) : (
              <>
                <h1 className={styles.h1}>Claim your link</h1>
                <p className={styles.subhead}>
                  Tell us who you are and we&apos;ll reserve siang.co/yourname while the beta opens up.
                </p>

                <form onSubmit={onSubmit} className={styles.form} noValidate>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="name">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Anong Vetchakul"
                      className={styles.input}
                      autoComplete="name"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={styles.input}
                      autoComplete="email"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="handle">
                      Instagram or handle (optional)
                    </label>
                    <input
                      id="handle"
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="@anong.ceramics"
                      className={styles.input}
                    />
                  </div>

                  {error && <p className={styles.error}>{error}</p>}

                  <button type="submit" disabled={submitting} className={styles.submit}>
                    {submitting ? "Sending…" : "Start free"}
                  </button>
                  <p className={styles.footnote}>Free to build. You only pay when you publish a work.</p>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
