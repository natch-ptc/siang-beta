"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";

/**
 * "Scan the demo" trigger button. Desktop visitors get a small popover with
 * a QR code that opens /mvp on their phone; a direct "open it here" link
 * covers mobile visitors (and anyone who'd rather not reach for a phone).
 */
export default function ScanDemo({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const [open, setOpen] = useState(false);
  // Set after mount only — matches the server-rendered placeholder first,
  // then swaps in the real origin, avoiding a hydration mismatch.
  const [origin, setOrigin] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const mvpUrl = origin ? `${origin}/mvp` : "/mvp";

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        className={className}
        style={style}
        onClick={() => setOpen((v) => !v)}
      >
        Scan the demo
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 12px)",
            left: 0,
            zIndex: 30,
            width: 260,
            background: "#F1F0ED",
            borderRadius: 20,
            padding: 24,
            textAlign: "center",
            boxShadow: "0 24px 60px -20px rgba(0,0,0,.35)",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 14,
              display: "inline-flex",
            }}
          >
            {origin ? (
              <QRCodeCanvas value={mvpUrl} size={160} includeMargin />
            ) : (
              <div style={{ width: 160, height: 160 }} />
            )}
          </div>
          <p style={{ marginTop: 14, fontSize: 14, color: "#000" }}>siang.co/demo</p>
          <p style={{ marginTop: 2, fontSize: 13, color: "#6b6b68" }}>Opens with no app and no sign up</p>
          <Link
            href="/mvp"
            style={{
              display: "inline-block",
              marginTop: 10,
              fontSize: 13,
              textDecoration: "underline",
              color: "#000",
            }}
          >
            open it here
          </Link>
        </div>
      )}
    </div>
  );
}
