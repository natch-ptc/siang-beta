import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, handle, source } =
    (body as { name?: string; email?: string; handle?: string; source?: string }) ?? {};

  const trimmedName = typeof name === "string" ? name.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim() : "";
  const trimmedHandle = typeof handle === "string" ? handle.trim() : "";
  const trimmedSource = typeof source === "string" && source.trim() ? source.trim() : "landing";

  if (!trimmedName) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!trimmedEmail || !EMAIL_RE.test(trimmedEmail)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("beta_testers").insert({
    name: trimmedName,
    email: trimmedEmail,
    handle: trimmedHandle || null,
    source: trimmedSource,
  });

  if (error) {
    // Unique violation on lower(email) — treat as a friendly success rather
    // than an error since the person is already on the list.
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, alreadyJoined: true });
    }
    return NextResponse.json({ error: "Could not save your details. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
