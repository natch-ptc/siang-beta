import styles from "./Work.module.css";

const PERSON_CM = 170;
const PERSON_W = 44;
const GAP = 26;
const EYE_LEVEL = 150; // where the middle of a hung work usually sits

// A work's size against a simple human figure (PRD 6.12), drawn in
// centimetres: a 170 cm person beside a rectangle of the work's height and width.
export default function ScaleFigure({ heightCm, widthCm }: { heightCm: number; widthCm: number }) {
  const artBottom = Math.max(0, EYE_LEVEL - heightCm / 2); // tall works stand on the floor
  const top = Math.max(PERSON_CM, artBottom + heightCm);
  const total = PERSON_W + GAP + widthCm;
  const y = (cmAboveFloor: number) => top - cmAboveFloor;
  const stroke = Math.max(1.5, top / 110);

  return (
    <>
      <svg
        className={styles.scale}
        viewBox={`${-stroke} ${-stroke} ${total + stroke * 2} ${top + stroke * 2}`}
        role="img"
        aria-label={`${heightCm} by ${widthCm} centimetres, next to a person ${PERSON_CM} centimetres tall`}
      >
        <g fill="currentColor" opacity="0.55">
          <circle cx={PERSON_W / 2} cy={y(PERSON_CM - 12)} r="12" />
          <rect x="3" y={y(PERSON_CM - 28)} width={PERSON_W - 6} height="64" rx="14" />
          <rect x="7" y={y(84)} width="13.5" height="84" rx="6.5" />
          <rect x={PERSON_W - 20.5} y={y(84)} width="13.5" height="84" rx="6.5" />
        </g>
        <rect
          x={PERSON_W + GAP}
          y={y(artBottom + heightCm)}
          width={widthCm}
          height={heightCm}
          rx={Math.min(3, widthCm / 10)}
          fill="rgba(255,255,255,0.14)"
          stroke="currentColor"
          strokeWidth={stroke}
        />
        <line x1={-stroke} x2={total + stroke} y1={top + stroke / 2} y2={top + stroke / 2} stroke="currentColor" strokeWidth={stroke / 2} opacity="0.3" />
      </svg>
      <p className={styles.scaleNote}>Next to a person {PERSON_CM} cm tall</p>
    </>
  );
}
