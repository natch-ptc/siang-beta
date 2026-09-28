import LoginClient, { type LoginMode } from "./LoginClient";

// /login?mode=signup&email=… opens straight on "Create your studio" with the
// email filled in (the beta signup page links here).
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { mode, email } = await searchParams;
  const initialMode: LoginMode = mode === "signup" ? "signup" : "signin";
  return <LoginClient initialMode={initialMode} initialEmail={typeof email === "string" ? email : ""} />;
}
