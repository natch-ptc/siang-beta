import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Keeps the Supabase session cookie fresh on every request. Route-level
// protection (redirecting signed-out users away from /studio) happens in
// the page itself, not here — this only refreshes tokens.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
