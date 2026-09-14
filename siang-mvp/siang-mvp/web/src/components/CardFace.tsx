import { MARKS } from "@/lib/marks";
import { stamp } from "@/lib/format";
import type { ArtistCard } from "@/lib/types";
import styles from "./CardStack.module.css";

export default function CardFace({ card }: { card: ArtistCard }) {
  return (
    <div className={styles.face} style={{ background: card.cardBg, color: card.cardInk }}>
      <div className={styles.foot}>
        <b>
          {card.based}, {card.country}
        </b>
        <span>{stamp(card.addedAt)}</span>
      </div>
      <div className={styles.mark} dangerouslySetInnerHTML={{ __html: MARKS[card.markId] ?? "" }} />
      <div className={styles.plate}>
        <em>{card.name}</em>
        <span>siang.co/{card.slug}</span>
      </div>
    </div>
  );
}
