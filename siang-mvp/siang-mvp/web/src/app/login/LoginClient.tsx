"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BACK_CHEVRON_SVG, EYE_ICON, EYE_SLASH_ICON } from "@/lib/icons";
import Logo from "@/components/Logo";

export type LoginMode = "signin" | "signup";

// Supabase's raw auth errors, reworded so a first-time visitor knows what to do next.
function friendlyError(message: string, mode: LoginMode) {
  if (/invalid login credentials/i.test(message)) return "Wrong email or password. No account yet? Create one below.";
  if (/already registered/i.test(message)) return "This email already has an account. Sign in instead.";
  if (/email not confirmed/i.test(message)) return "This account hasn't been confirmed yet. Ask the Siang team to confirm it.";
  if (/password should be at least/i.test(message)) return "Use a password with at least 6 characters.";
  return mode === "signup" ? `Couldn't create the account: ${message}` : message;
}

export default function LoginClient({ initialMode, initialEmail }: { initialMode: LoginMode; initialEmail: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>(initialMode);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        setError(friendlyError(error.message, mode));
        if (/already registered/i.test(error.message)) setMode("signin");
        return;
      }
      if (!data.session) {
        setNotice("Check your email to confirm your account, then sign in.");
        setMode("signin");
        return;
      }
      router.push("/app");
      router.refresh();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError(friendlyError(error.message, mode));
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.top}>
          <Link href="/" style={styles.back} aria-label="Back to Siang">
            {BACK_CHEVRON_SVG}
          </Link>
          <Logo height={22} />
        </div>
        <h1 style={styles.h1}>{mode === "signin" ? "Sign in" : "Create your artist profile"}</h1>
        <p style={styles.sub}>
          {mode === "signin"
            ? "Manage your artist profile, works and exhibitions."
            : "Make an account to publish your works, with your own voice, on Siang."}
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
            <span style={styles.passwordWrap}>
              <input
                style={{ ...styles.input, ...styles.passwordInput }}
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                style={styles.eye}
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? EYE_SLASH_ICON : EYE_ICON}
              </button>
            </span>
            {mode === "signup" && <span style={styles.hint}>At least 6 characters.</span>}
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
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "#1b1b1b",
    borderRadius: 28,
    padding: "22px 24px 26px",
  },
  top: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  back: {
    display: "inline-grid",
    placeItems: "center",
    width: 44,
    height: 44,
    marginLeft: -10,
    borderRadius: 999,
    color: "#fff",
    textDecoration: "none",
  },
  h1: { fontSize: 26, fontWeight: 500, lineHeight: 1.15, marginTop: 18 },
  sub: { fontSize: 14.5, color: "rgba(255,255,255,.66)", marginTop: 8, lineHeight: 1.5 },
  form: { display: "flex", flexDirection: "column", gap: 14, marginTop: 22 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.7)" },
  input: {
    height: 48,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.06)",
    color: "#fff",
    padding: "0 14px",
    fontSize: 16,
    fontFamily: "inherit",
  },
  passwordWrap: { position: "relative", display: "flex" },
  passwordInput: { flex: 1, minWidth: 0, paddingRight: 48 },
  eye: {
    position: "absolute",
    right: 2,
    top: 2,
    width: 44,
    height: 44,
    borderRadius: 999,
    border: 0,
    background: "none",
    color: "rgba(255,255,255,.66)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  },
  hint: { fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,.5)" },
  error: { fontSize: 13.5, color: "#ff8a8a", margin: 0 },
  notice: { fontSize: 13.5, color: "#8ee0b8", margin: 0 },
  submit: {
    height: 50,
    borderRadius: 999,
    border: 0,
    background: "#fff",
    color: "#0f0f0f",
    fontWeight: 500,
    fontSize: 15.5,
    cursor: "pointer",
    marginTop: 4,
  },
  toggle: {
    marginTop: 12,
    width: "100%",
    minHeight: 44,
    textAlign: "center",
    background: "none",
    border: 0,
    fontSize: 14,
    color: "rgba(255,255,255,.7)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
