"use client";

import { useState } from "react";
import CardStack from "@/components/CardStack";
import DetailSheet from "@/components/DetailSheet";
import MiniPlayer from "@/components/MiniPlayer";
import NowPlaying from "@/components/NowPlaying";
import { PlayerProvider } from "@/lib/player";
import { OWNED } from "@/lib/mock-artists";
import type { ArtistCard } from "@/lib/types";

export default function Home() {
  const [selected, setSelected] = useState<ArtistCard | null>(null);

  const position = selected
    ? `${String(OWNED.indexOf(selected) + 1).padStart(2, "0")} of ${OWNED.length}`
    : "";

  return (
    <PlayerProvider>
      <CardStack cards={OWNED} onOpen={setSelected} />
      <DetailSheet
        card={selected}
        position={position}
        onClose={() => setSelected(null)}
        onOpenExhibition={(show, works) => {
          // TODO: route to the exhibition page once it's built
          console.log("open exhibition", show.title, works.length, "works");
        }}
      />
      <NowPlaying onOpenArtist={setSelected} />
      <MiniPlayer />
    </PlayerProvider>
  );
}
