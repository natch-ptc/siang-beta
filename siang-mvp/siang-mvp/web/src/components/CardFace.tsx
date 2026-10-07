import { stamp } from "@/lib/format";
import styles from "./CardFace.module.css";

// Only the fields the face shows, so the Studio can preview a card while it is being edited.
type CardFaceData = {
  cardBg: string;
  cardInk: string;
  based: string;
  country: string;
  addedAt: string;
  joinedTz: string | null;
  name: string;
  slug: string;
};

export default function CardFace({ card }: { card: CardFaceData }) {
  return (
    <div className={styles.face} style={{ background: card.cardBg, color: card.cardInk }}>
      <div className={styles.foot}>
        <b>{[card.based, card.country].filter(Boolean).join(", ")}</b>
        <span>{stamp(card.addedAt, card.joinedTz)}</span>
      </div>
      <div className={styles.plate}>
        <em>{card.name}</em>
        <span>siang.co/{card.slug}</span>
      </div>
    </div>
  );
}
