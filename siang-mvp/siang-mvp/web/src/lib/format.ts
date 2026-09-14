const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function stamp(iso: string): string {
  if (!iso) return "";
  const [d, t] = iso.split("T");
  const [y, m, day] = d.split("-");
  return `${+day} ${MONTHS[+m - 1]} ${y} · ${(t ?? "00:00").slice(0, 5)}`;
}

// "3:12" -> 192
export function secs(durationLabel: string): number {
  const [m, s] = durationLabel.split(":").map(Number);
  return m * 60 + s;
}

// 192 -> "3:12"
export function clock(t: number): string {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
