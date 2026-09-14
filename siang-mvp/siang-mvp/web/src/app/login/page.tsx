"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BACK_CHEVRON_SVG } from "@/lib/icons";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setBusy(false);
      if (error) {
        setError(error.message);
        return;
      }
      if (!data.session) {
        setNotice("Check your email to confirm your account, then sign in.");
        setMode("signin");
        return;
      }
      router.push("/studio");
      router.refresh();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/studio");
    router.refresh();
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <Link href="/" style={styles.back} aria-label="Back to Pocket">
          {BACK_CHEVRON_SVG}
        </Link>
        <h1 style={styles.h1}>{mode === "signin" ? "Sign in" : "Create your studio"}</h1>
        <p style={styles.sub}>
          {mode === "signin" ? "Manage your artist profile and works." : "Set up an account to publish your work on Siang."}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email
            <input
              style={styles.input}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <label style={styles.label}>
            Password
            <input
              style={styles.input}
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </label>

          {error && <p style={styles.error}>{error}</p>}
          {notice && <p style={styles.notice}>{notice}</p>}

          <button style={styles.submit} type="submit" disabled={busy}>
            {busy ? "..." : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <button
          style={styles.toggle}
          onClick={() => {
            setMode((m) => (m === "signin" ? "signup" : "signin"));
            setError(null);
            setNotice(null);
          }}
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(180deg,#E9E9E7 0%,#E9E9E7 22%,#B8B8B6 100%)",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    background: "#fff",
    borderRadius: 20,
    padding: "28px 24px",
    boxShadow: "0 20px 60px -20px rgba(0,0,0,.3)",
  },
  back: {
    display: "inline-grid",
    placeItems: "center",
    width: 36,
    height: 36,
    borderRadius: 999,
    background: "rgba(0,0,0,.06)",
    color: "rgba(0,0,0,.7)",
    textDecoration: "none",
  },
  h1: { fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 14 },
  sub: { fontSize: 14, color: "rgba(0,0,0,.55)", marginTop: 6, lineHeight: 1.4 },
  form: { display: "flex", flexDirection: "column", gap: 14, marginTop: 22 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "rgba(0,0,0,.7)" },
  input: {
    height: 44,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,.14)",
    padding: "0 12px",
    fontSize: 15,
    fontFamily: "inherit",
  },
  error: { fontSize: 13, color: "#B63878", margin: 0 },
  notice: { fontSize: 13, color: "#1F5340", margin: 0 },
  submit: {
    height: 46,
    borderRadius: 999,
    border: 0,
    background: "#000",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    marginTop: 4,
  },
  toggle: {
    marginTop: 18,
    width: "100%",
    textAlign: "center",
    background: "none",
    border: 0,
    fontSize: 13,
    color: "rgba(0,0,0,.6)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
