"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";

/** Always-visible QR block for the dedicated "Scan it with your phone" section. */
export default function StaticQr() {
  // Set after mount only — matches the server-rendered placeholder first,
  // then swaps in the real origin, avoiding a hydration mismatch.
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const mvpUrl = origin ? `${origin}/mvp` : "/mvp";

  return (
    <div>
      <div className="inline-flex rounded-2xl bg-white p-4">
        {origin ? (
          <QRCodeCanvas value={mvpUrl} size={200} includeMargin />
        ) : (
          <div style={{ width: 200, height: 200 }} />
        )}
      </div>
      <p className="mt-3 text-sm text-black">siang.co/demo</p>
      <Link href="/mvp" className="mt-1 inline-block text-sm text-black/60 underline underline-offset-4">
        open it here
      </Link>
    </div>
  );
}
