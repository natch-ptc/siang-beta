"use client";

import { useMemo, useState } from "react";
import CardStack from "@/components/CardStack";
import DetailSheet from "@/components/DetailSheet";
import ExhibitionSheet from "@/components/ExhibitionSheet";
import MiniPlayer from "@/components/MiniPlayer";
import NowPlaying from "@/components/NowPlaying";
import Scanner from "@/components/Scanner";
import ShareSheet from "@/components/ShareSheet";
import { PlayerProvider } from "@/lib/player";
import { usePocket } from "@/lib/pocket";
import type { ShareTarget } from "@/lib/share";
import type { ArtistCard } from "@/lib/types";

// Seeded artists that start outside anyone's Pocket — discoverable only by
// scanning the QR code on the back of their card. See supabase/seed_available.sql.
const AVAILABLE_SLUGS = ["lek-thammawong", "ines-duarte", "somchai-ratana"];

export default function HomeClient({ cards: allCards }: { cards: ArtistCard[] }) {
  const defaultOwnedSlugs = useMemo(
    () => allCards.filter((c) => !AVAILABLE_SLUGS.includes(c.slug)).map((c) => c.slug),
    [allCards]
  );
  const { slugs: ownedSlugs, add: addToPocket } = usePocket(defaultOwnedSlugs);
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

  return (
    <PlayerProvider>
      <CardStack cards={cards} onOpen={setSelected} onScan={() => setScannerOpen(true)} />
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
