import { MARKS } from "@/lib/marks";
import { stamp } from "@/lib/format";
import type { ArtistCard } from "@/lib/types";
import styles from "./CardStack.module.css";

export default function CardFace({ card }: { card: ArtistCard }) {
  // A real photo background stands on its own — the generated line-art mark
  // is only for cards without one, so it doesn't compete with the art.
  const hasPhoto = card.cardBg.includes("url(");
  return (
    <div className={styles.face} style={{ background: card.cardBg, color: card.cardInk }}>
      <div className={styles.foot}>
        <b>
          {card.based}, {card.country}
        </b>
        <span>{stamp(card.addedAt)}</span>
      </div>
      {!hasPhoto && <div className={styles.mark} dangerouslySetInnerHTML={{ __html: MARKS[card.markId] ?? "" }} />}
      <div className={styles.plate}>
        <em>{card.name}</em>
        <span>siang.co/{card.slug}</span>
      </div>
    </div>
  );
}
