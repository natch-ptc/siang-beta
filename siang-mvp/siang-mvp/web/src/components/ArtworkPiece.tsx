import { getArtworkMarkup } from "@/lib/artwork";

type Props = {
  markId: string;
  workIndex: number;
  cardBg: string;
  cardInk: string;
  seedKey: string;
  coverUrl?: string | null;
  className?: string;
  style?: React.CSSProperties;
};

// The picture for one work: a real artist-uploaded photo when there is one,
// otherwise the generated line-art drawn from the artist's own card motif.
export default function ArtworkPiece({ markId, workIndex, cardBg, cardInk, seedKey, coverUrl, className, style }: Props) {
  if (coverUrl) {
    return (
      <span className={className} style={{ ...style, display: "block", overflow: "hidden", position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverUrl} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
      </span>
    );
  }

  const art = getArtworkMarkup(markId, workIndex, cardBg, cardInk, seedKey);
  if (!art) {
    return <span className={className} style={{ ...style, background: cardBg }} />;
  }
  return (
    <span
      data-artw
      className={className}
      style={{ ...style, background: art.ground, color: art.ink }}
      dangerouslySetInnerHTML={{ __html: art.svg }}
    />
  );
}
