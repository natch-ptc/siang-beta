// The Siang mark: three D shapes side by side, traced from the Draft-1 design.
export const MARK_D = "M.5 0h11.3c9.7 0 17.5 7.8 17.5 17.4v1.9c0 9.6-7.8 17.4-17.5 17.4H.5a.5.5 0 0 1-.5-.5V.5C0 .2.2 0 .5 0Z";
export const MARK_W = 87.9;
export const MARK_H = 36.7;
const MARK_STEP = 29.3;

export function Mark({ height = 24, className }: { height?: number; className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${MARK_W} ${MARK_H}`}
      height={height}
      width={(height * MARK_W) / MARK_H}
      fill="currentColor"
      aria-hidden="true"
      style={{ display: "block", flex: "none" }}
    >
      {[0, 1, 2].map((i) => (
        <path key={i} d={MARK_D} transform={`translate(${i * MARK_STEP})`} />
      ))}
    </svg>
  );
}

// The mark with the "Siang" wordmark beside it. `height` is the mark's height.
export default function Logo({ height = 30 }: { height?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: height * 0.1, color: "inherit" }} role="img" aria-label="Siang">
      <Mark height={height} />
      <span
        aria-hidden="true"
        style={{ fontFamily: "var(--font-logo)", fontSize: height * 1.3, lineHeight: 1, letterSpacing: "-0.045em", fontWeight: 400 }}
      >
        Siang
      </span>
    </span>
  );
}
