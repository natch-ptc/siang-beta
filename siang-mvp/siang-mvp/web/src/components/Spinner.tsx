import styles from "./Spinner.module.css";

// A small spinning ring in the current text colour, for anything that waits on
// the network (uploads, saving, publishing).
export default function Spinner({ size = 16, label }: { size?: number; label?: string }) {
  return (
    <span
      className={styles.spinner}
      style={{ width: size, height: size }}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
