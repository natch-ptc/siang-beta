import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

// Sign in. Making an account is at /join (the old /login?mode=signup links
// still lead there, email and all). ?confirmed=1 comes from an email
// confirmation link that couldn't sign the person in by itself.
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  // ?reset=1 is where a "forgot password" link lands, signed in, to pick a new
  // password; ?reset=failed is that link once it has expired or been used.
  const { mode, email, confirmed, reset } = await searchParams;
  const e = typeof email === "string" ? email : "";
  if (mode === "signup") redirect(e ? `/join?email=${encodeURIComponent(e)}` : "/join");
  return <LoginClient initialEmail={e} confirmed={confirmed === "1"} reset={reset === "1" ? "ready" : reset === "failed" ? "failed" : null} />;
}
