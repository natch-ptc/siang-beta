"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EYE_ICON, EYE_SLASH_ICON } from "@/lib/icons";
import { Intro, OnboardingFrame, Splash, ob } from "@/components/Onboarding";
import Spinner from "@/components/Spinner";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Joining: the Siang mark fades up, one screen says what Siang is, then the
// first of two short steps (who you are). No waitlist, and no second form
// asking for the email again. Someone arriving with their email already in
// the link has seen the pitch, so they go straight to the form.
export default function JoinClient({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const [stage, setStage] = useState<"splash" | "intro" | "form">(initialEmail ? "form" : "splash");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [instagram, setInstagram] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<React.ReactNode>(null);
  const [confirmTo, setConfirmTo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const n = name.trim();
    const em = email.trim();
    if (!n) return setError("Add your name.");
    if (!EMAIL_RE.test(em)) return setError("Check the email address. It needs an @ and a domain.");
    if (password.length < 6) return setError("Use a password with at least 6 characters.");

    setBusy(true);
    const supabase = createClient();
    const ig = instagram.trim().replace(/^@/, "");
    // On the beta list straight away, like the old /join-beta form, so the
    // team can reach anyone who stops half way. An email already on it is fine.
    void supabase.from("beta_testers").insert({ name: n, email: em, handle: ig || null, source: "join" });
    // Name and Instagram ride along on the account, so the next step (in the
    // Studio) can fill them in, even after confirming the email.
    const { data, error } = await supabase.auth.signUp({
      email: em,
      password,
      options: { data: { name: n, instagram: ig }, emailRedirectTo: `${window.location.origin}/auth/confirm?next=/studio` },
    });
    setBusy(false);
    if (error) {
      if (/already registered/i.test(error.message)) {
        setError(
          <>
            This email already has an account.{" "}
            <Link href={`/login?email=${encodeURIComponent(em)}`} style={{ color: "#fff" }}>
              Sign in instead
            </Link>
          </>
        );
      } else {
        setError(`Couldn't create the account: ${error.message}`);
      }
      return;
    }
    if (!data.session) {
      setConfirmTo(em); // the project asks for an email confirmation first
      return;
    }
    router.push("/studio");
    router.refresh();
  }

  if (stage === "splash") return <Splash onDone={() => setStage("intro")} />;
  if (stage === "intro") return <Intro onStart={() => setStage("form")} />;

  if (confirmTo) {
    return (
      <OnboardingFrame
        title="Check your email"
        lead={`We sent a link to ${confirmTo}. Open it, and you'll carry on with your Siang link right where you left off.`}
      >
        <div style={ob.form}>
          <p style={ob.hint}>Nothing after a minute? Look in spam or promotions, or go back and check the address.</p>
          <button style={ob.quiet} onClick={() => setConfirmTo(null)} type="button">
            Use a different email
          </button>
        </div>
      </OnboardingFrame>
    );
  }

  return (
    <OnboardingFrame
      step={1}
      title="Create your account"
      lead="Two short steps and your artist page is live. Photos, works and sound can all come later."
    >
      <form onSubmit={submit} style={ob.form} noValidate>
        <label style={ob.label}>
          Your name
          <input style={ob.input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" autoFocus />
        </label>
        <label style={ob.label}>
          Email
          <input style={ob.input} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label style={ob.label}>
          Password
          <span style={{ position: "relative", display: "flex" }}>
            <input
              style={{ ...ob.input, paddingRight: 52 }}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              style={{ position: "absolute", right: 2, top: 2, width: 44, height: 44, display: "grid", placeItems: "center", color: "rgba(255,255,255,.66)" }}
            >
              {showPassword ? EYE_SLASH_ICON : EYE_ICON}
            </button>
          </span>
          <span style={ob.hint}>At least 6 characters, so you can come back and edit your page.</span>
        </label>
        <label style={ob.label}>
          Instagram, optional
          <input
            style={ob.input}
            placeholder="@yourname"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />
        </label>
        {error && (
          <p style={ob.error} role="alert">
            {error}
          </p>
        )}
        <button style={ob.submit} type="submit" disabled={busy}>
          {busy && <Spinner />} Continue
        </button>
        <Link href="/login" style={ob.quiet}>
          Already have an account? Sign in
        </Link>
      </form>
    </OnboardingFrame>
  );
}
