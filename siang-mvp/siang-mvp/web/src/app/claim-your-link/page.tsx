"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

const ACCENT = "#c2397c";
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
    <main className="min-h-dvh bg-white text-black">
      <header className="border-b border-black/10 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <span aria-hidden className="text-xl leading-none">▶◀▶</span>
            Siang
          </Link>
          <Link href="/" className="text-sm text-black/60 hover:text-black">
            Back
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-md flex-col items-stretch px-5 py-16 sm:px-8">
        {done ? (
          <div className="rounded-3xl border border-black/10 p-8 text-center">
            <p className="text-2xl font-extrabold tracking-tight">You&apos;re on the list</p>
            <p className="mt-3 text-black/60">
              We&apos;ll email you at <strong className="text-black">{done.email}</strong> when your link is ready.
            </p>
            <Link
              href="/"
              className="mt-8 inline-block rounded-full px-7 py-3 text-sm font-semibold text-white"
              style={{ background: ACCENT }}
            >
              Back to Siang
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Claim your link</h1>
            <p className="mt-3 text-black/60">
              Tell us who you are and we&apos;ll reserve siang.co/yourname while the beta opens up.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
              <Field label="Name">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Anong Vetchakul"
                  className="w-full rounded-xl border border-black/15 px-4 py-3 text-base outline-none focus:border-black/40"
                  autoComplete="name"
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-black/15 px-4 py-3 text-base outline-none focus:border-black/40"
                  autoComplete="email"
                />
              </Field>

              <Field label="Instagram or handle (optional)">
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@anong.ceramics"
                  className="w-full rounded-xl border border-black/15 px-4 py-3 text-base outline-none focus:border-black/40"
                />
              </Field>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full rounded-full px-7 py-3.5 text-base font-semibold text-white transition disabled:opacity-60"
                style={{ background: ACCENT }}
              >
                {submitting ? "Sending…" : "Start free"}
              </button>
              <p className="text-center text-xs text-black/40">
                Free to build. You only pay when you publish a work.
              </p>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-black/70">{label}</span>
      {children}
    </label>
  );
}
