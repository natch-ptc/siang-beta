"use client";

import { useMemo, useState } from "react";
import CardStack from "@/components/CardStack";
import DetailSheet from "@/components/DetailSheet";
import ExhibitionSheet from "@/components/ExhibitionSheet";
import MiniPlayer from "@/components/MiniPlayer";
import NowPlaying from "@/components/NowPlaying";
import Scanner from "@/components/Scanner";
import ShareSheet from "@/components/ShareSheet";
import Link from "next/link";
import { BETA_VERSION, DEMO_PATH } from "@/lib/beta";
import { PlayerProvider } from "@/lib/player";
import { usePocket } from "@/lib/pocket";
import type { ShareTarget } from "@/lib/share";
import type { ArtistCard } from "@/lib/types";

// Seeded artists that start outside anyone's Pocket in the demo — discoverable
// only by scanning the QR code on the back of their card. See supabase/seed_available.sql.
const AVAILABLE_SLUGS = ["lek-thammawong", "ines-duarte", "somchai-ratana"];

// "demo": the example artists, with a Pocket you fill by scanning (kept in
// localStorage). "live": the beta — every registered artist is in the stack.
export default function HomeClient({ cards: allCards, mode }: { cards: ArtistCard[]; mode: "demo" | "live" }) {
  const demo = mode === "demo";
  const defaultOwnedSlugs = useMemo(
    () => allCards.filter((c) => !demo || !AVAILABLE_SLUGS.includes(c.slug)).map((c) => c.slug),
    [allCards, demo]
  );
  const pocket = usePocket(defaultOwnedSlugs);
  const ownedSlugs = demo ? pocket.slugs : defaultOwnedSlugs;
  const addToPocket = pocket.add;
  const cards = useMemo(() => allCards.filter((c) => ownedSlugs.includes(c.slug)), [allCards, ownedSlugs]);

  const [selected, setSelected] = useState<ArtistCard | null>(null);
  const [exhibition, setExhibition] = useState<{ artist: ArtistCard; showIndex: number } | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);

  const position = selected
    ? `${String(cards.indexOf(selected) + 1).padStart(2, "0")} of ${cards.length}`
    : "";

  const openArtist = (artist: ArtistCard) => {
    setExhibition(null);
    setSelected(artist);
  };

  if (!demo && allCards.length === 0) return <EmptyBeta />;

  return (
    <PlayerProvider>
      <CardStack cards={cards} badge={demo ? "Demo" : `Beta ${BETA_VERSION}`} onOpen={setSelected} onScan={() => setScannerOpen(true)} />
      <DetailSheet
        card={selected}
        position={position}
        onClose={() => setSelected(null)}
        onOpenExhibition={(artist, showIndex) => setExhibition({ artist, showIndex })}
        onShareArtist={(artist) => setShareTarget({ kind: "artist", artist })}
      />
      <ExhibitionSheet
        artist={exhibition?.artist ?? null}
        showIndex={exhibition?.showIndex ?? null}
        onClose={() => setExhibition(null)}
        onOpenArtist={openArtist}
        onShare={(artist, showIndex) => setShareTarget({ kind: "exhibition", artist, showIndex })}
      />
      <NowPlaying onOpenArtist={openArtist} onShareWork={(artist, work) => setShareTarget({ kind: "work", artist, work })} />
      <MiniPlayer />
      <Scanner
        open={scannerOpen}
        allCards={allCards}
        ownedSlugs={ownedSlugs}
        onClose={() => setScannerOpen(false)}
        onAdd={addToPocket}
      />
      <ShareSheet target={shareTarget} onClose={() => setShareTarget(null)} />
    </PlayerProvider>
  );
}

// The live beta before anyone has registered.
function EmptyBeta() {
  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      <div style={{ maxWidth: 340 }}>
        <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>No artists here yet</p>
        <p style={{ marginTop: 8, fontSize: 15, lineHeight: 1.5, color: "var(--ink-soft)" }}>
          Be the first: make your artist page and your card will appear here.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
          <Link href={DEMO_PATH} style={emptyBtn}>
            See the demo
          </Link>
          <Link href="/login?mode=signup" style={{ ...emptyBtn, background: "#000", color: "#fff", borderColor: "#000" }}>
            Make your page
          </Link>
        </div>
      </div>
    </main>
  );
}

const emptyBtn: React.CSSProperties = {
  height: 44,
  padding: "0 18px",
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  border: "1px solid var(--hair)",
  background: "rgba(255,255,255,.5)",
  fontSize: 14,
  fontWeight: 700,
  color: "var(--ink)",
  textDecoration: "none",
};
