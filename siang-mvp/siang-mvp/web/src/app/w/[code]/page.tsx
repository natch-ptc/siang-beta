import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CodePad from "@/components/CodePad";
import { createClient } from "@/lib/supabase/server";
import { findWorkPathByCode } from "@/lib/queries";

export const metadata: Metadata = { title: "Type a work code · Siang.co" };

// siang.co/w/123456: a work's permanent code address, the one its printed
// label carries. It opens the work's page and stamps it as seen in person. A
// code that matches nothing goes back to the keypad with a clear message,
// never an error page (PRD rule 9).
export default async function WorkCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const path = /^\d{6}$/.test(code) ? await findWorkPathByCode(await createClient(), code) : null;
  if (path) redirect(`${path}?seen=1`);
  return <CodePad wrong={code.replace(/\D/g, "").slice(0, 6)} />;
}
