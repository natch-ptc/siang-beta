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

// "28 NOV 2025", the date line under a work's title.
export function dayMonthYear(iso: string, tz?: string | null): string {
  if (!iso) return "";
  const p = parts(iso, tz);
  return `${+p.day} ${p.month.toUpperCase()} ${p.year}`;
}

// Calendar dates ("2026-01-31") have no time zone: read them as written.
function ymd(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d };
}

// "1-31 Jan", "22 Jan - 3 Feb", "From 1 Jan", or "" when a show has no dates.
export function dateRange(startsOn: string | null, endsOn: string | null): string {
  if (!startsOn && !endsOn) return "";
  if (!startsOn || !endsOn) {
    const only = ymd((startsOn ?? endsOn)!);
    return `${startsOn ? "From" : "Until"} ${only.d} ${MONTHS[only.m - 1]}`;
  }
  const a = ymd(startsOn);
  const b = ymd(endsOn);
  if (a.y === b.y && a.m === b.m) return a.d === b.d ? `${a.d} ${MONTHS[a.m - 1]}` : `${a.d}-${b.d} ${MONTHS[a.m - 1]}`;
  return `${a.d} ${MONTHS[a.m - 1]} - ${b.d} ${MONTHS[b.m - 1]}`;
}

// "1-31 Jan" for a show; shows made before dates existed only have a year.
export function showWhenText(show: { startsOn: string | null; endsOn: string | null; year: number | null }): string {
  return dateRange(show.startsOn, show.endsOn) || (show.year ? String(show.year) : "");
}

// Today's calendar date in Thailand ("2026-10-06"). Pages work this out once on
// the server and pass it down, so the server and the browser agree on what is
// showing now.
export function todayInThailand(): string {
  const p = parts(new Date().toISOString(), DEFAULT_TZ);
  const month = String(MONTHS.indexOf(p.month) + 1).padStart(2, "0");
  return `${p.year}-${month}-${p.day.padStart(2, "0")}`;
}

export type ShowTiming = "now" | "upcoming" | "past" | "undated";

// A show with only a year counts as past once that year is over.
export function showTiming(show: { startsOn: string | null; endsOn: string | null; year: number | null }, today: string): ShowTiming {
  if (!show.startsOn && !show.endsOn) {
    if (!show.year) return "undated";
    return show.year < +today.slice(0, 4) ? "past" : "undated";
  }
  if (show.endsOn && show.endsOn < today) return "past";
  if (show.startsOn && show.startsOn > today) return "upcoming";
  return "now";
}

// Whole days until a show closes (0 on its last day); null without an end date.
export function daysLeft(endsOn: string | null, today: string): number | null {
  if (!endsOn) return null;
  return Math.round((Date.parse(endsOn) - Date.parse(today)) / 86_400_000);
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
