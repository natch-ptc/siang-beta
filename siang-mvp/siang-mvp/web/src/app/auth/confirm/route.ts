import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Where the "confirm your email" link lands (JoinClient's emailRedirectTo).
// It signs the person in and sends them on with their onboarding, instead of
// leaving them to find the sign-in page. This address must be allowed in the
// Supabase project's Auth > URL Configuration.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const asked = url.searchParams.get("next");
  const next = asked?.startsWith("/") && !asked.startsWith("//") ? asked : "/studio";
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const supabase = await createClient();

  let ok = false;
  if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  else if (tokenHash && type) ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;

  // A link opened twice, or in another browser, can't sign in by itself; the
  // email is confirmed all the same, so the sign-in page says so. A "forgot
  // password" link (LoginClient, next=/login?reset=1) in that state is no use:
  // the sign-in page offers to send a new one.
  const failed = next.startsWith("/login?reset") || type === "recovery" ? "/login?reset=failed" : "/login?confirmed=1";
  return NextResponse.redirect(new URL(ok ? next : failed, url.origin));
}
