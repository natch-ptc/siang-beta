import { stamp } from "@/lib/format";
import type { ArtistCard } from "@/lib/types";
import styles from "./CardStack.module.css";

// Only the fields the face shows, so the Studio can preview a card before it's in the app's data.
type CardFaceData = Pick<ArtistCard, "cardBg" | "cardInk" | "based" | "country" | "addedAt" | "joinedTz" | "name" | "slug">;

export default function CardFace({ card }: { card: CardFaceData }) {
  return (
    <div className={styles.face} style={{ background: card.cardBg, color: card.cardInk }}>
      <div className={styles.foot}>
        <b>
          {card.based}, {card.country}
        </b>
        <span>{stamp(card.addedAt, card.joinedTz)}</span>
      </div>
      <div className={styles.plate}>
        <em>{card.name}</em>
        <span>siang.co/{card.slug}</span>
      </div>
    </div>
  );
}
