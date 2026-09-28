// Times are stored in UTC. Cards show them in the zone where the card was
// made (artists.joined_tz); without one — older artists and the seeded
// examples — Thai time.
export const DEFAULT_TZ = "Asia/Bangkok";

// Our own month names: the runtime's can differ ("Sep" vs "Sept") between the
// server and a browser, which would make the rendered card mismatch.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parts(iso: string, tz: string | null | undefined) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" };
  let fmt: Intl.DateTimeFormat;
  try {
    fmt = new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: tz || DEFAULT_TZ });
  } catch {
    fmt = new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: DEFAULT_TZ }); // unknown zone name
  }
  const p = Object.fromEntries(fmt.formatToParts(new Date(iso)).map((x) => [x.type, x.value])) as Record<
    "day" | "month" | "year" | "hour" | "minute",
    string
  >;
  return { ...p, month: MONTHS[+p.month - 1] };
}

// "28 Sep 2026 · 17:23"
export function stamp(iso: string, tz?: string | null): string {
  if (!iso) return "";
  const p = parts(iso, tz);
  return `${+p.day} ${p.month} ${p.year} · ${p.hour}:${p.minute}`;
}

// "Sep 2026"
export function monthYear(iso: string | null, tz?: string | null): string {
  if (!iso) return "";
  const p = parts(iso, tz);
  return `${p.month} ${p.year}`;
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
