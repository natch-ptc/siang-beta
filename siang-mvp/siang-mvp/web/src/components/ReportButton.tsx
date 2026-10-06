"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CLOSE_ICON, FLAG_ICON } from "@/lib/icons";
import Spinner from "./Spinner";
import styles from "./Sheet.module.css";

// "Report this page", on every public page (PRD 12.2). The report goes to the
// reports table (supabase/migrations/0015_v3_fields.sql) for the team to review.
export default function ReportButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const { error } = await createClient().from("reports").insert({ page: pathname, reason: reason.trim() });
    setState(error ? "failed" : "sent");
  }

  function close() {
    setOpen(false);
    if (state === "sent") {
      setReason("");
      setState("idle");
    }
  }

  return (
    <>
      <button className={styles.quiet} onClick={() => setOpen(true)} type="button">
        {FLAG_ICON} Report this page
      </button>
      {open && (
        <>
          <div className={styles.scrim} onClick={close} />
          <section className={styles.sheet} role="dialog" aria-modal="true" aria-label="Report this page">
            <div className={styles.handle} />
            <div className={styles.head}>
              <h2 className={styles.kicker}>Report this page</h2>
              <button className={styles.close} onClick={close} aria-label="Close" type="button">
                {CLOSE_ICON}
              </button>
            </div>
            {state === "sent" ? (
              <>
                <p className={styles.note}>Thank you. The Siang team will look at this page.</p>
                <div className={styles.acts}>
                  <button className={`${styles.act} ${styles.wide}`} onClick={close} type="button">
                    Done
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={send}>
                <p className={styles.note}>Tell us what is wrong: a stolen work, a mistake, something harmful.</p>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  maxLength={1000}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  aria-label="What is wrong with this page"
                />
                {state === "failed" && <p className={styles.error}>Couldn&apos;t send the report. Check your connection and try again.</p>}
                <div className={styles.acts}>
                  <button className={`${styles.act} ${styles.wide}`} disabled={state === "sending" || !reason.trim()} type="submit">
                    {state === "sending" && <Spinner size={16} />} Send report
                  </button>
                </div>
              </form>
            )}
          </section>
        </>
      )}
    </>
  );
}
