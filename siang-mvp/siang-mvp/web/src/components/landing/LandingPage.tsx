import Link from "next/link";
import LandingHeader from "./LandingHeader";
import ScanDemo from "./ScanDemo";
import StaticQr from "./StaticQr";

const ACCENT = "#c2397c";

const PROBLEMS = [
  "A link in a bio goes nowhere, or it goes to a shop",
  "Adding sound has meant an installed audio guide, at a price independent artists never reach",
  "A visitor who liked the work has no way to follow the artist from the wall",
];

const HUB_WORKS = [
  { title: "น้ำนิ่ง (Still Water)", show: "Gallery Seascape" },
  { title: "ดินกับไฟ (Clay and Fire)", show: "Gallery Seascape" },
  { title: "ถ้วยที่หก (Sixth Bowl)", show: "MAIIAM Contemporary" },
  { title: "ลมในเตา (Kiln Wind)", show: "MAIIAM Contemporary" },
];

const STEPS = [
  { n: 1, title: "Add", body: "Audio, text, image and video, arranged by you. Under 30 minutes on a phone." },
  { n: 2, title: "Publish", body: "The code and the print file are made automatically." },
  { n: 3, title: "Print", body: "It goes on the wall beside the work." },
];

const ANALYTICS_ROWS = [
  { work: "น้ำนิ่ง (Still Water)", scans: 412, opens: 388, listens: 301, avg: "2:14", source: "356 / 41 / 15" },
  { work: "ดินกับไฟ (Clay and Fire)", scans: 289, opens: 271, listens: 204, avg: "1:52", source: "241 / 33 / 15" },
  { work: "ถ้วยที่หก (Sixth Bowl)", scans: 156, opens: 149, listens: 97, avg: "1:09", source: "112 / 37 / 7" },
  { work: "ลมในเตา (Kiln Wind)", scans: 88, opens: 84, listens: 61, avg: "0:48", source: "53 / 30 / 5" },
];

const PLANS = [
  { name: "FREE", price: "฿0", note: "Build and preview, nothing published" },
  { name: "ARTIST", price: "฿99", note: "per month, publish your own work" },
  { name: "STUDIO", price: "฿159", note: "per month, publish for a whole studio" },
];

export default function LandingPage() {
  return (
    <div className="bg-white text-black">
      <LandingHeader />

      {/* Hero */}
      <section id="home" className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-20">
        <div>
          <h1 className="text-[42px] font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            The layer of sound behind every artwork
          </h1>
          <p className="mt-6 max-w-md text-base text-black/60 sm:text-lg">
            An artist adds audio, text, image and video to one work, publishes it, and prints the code. A visitor
            scans it and hears the artist while standing in front of the real thing.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/claim-your-link"
              className="rounded-full px-7 py-3.5 text-base font-semibold text-white transition hover:brightness-95"
              style={{ background: ACCENT }}
            >
              Start free
            </Link>
            <ScanDemo className="rounded-full border border-black/15 px-7 py-3.5 text-base font-semibold text-black transition hover:border-black/40" />
          </div>
        </div>

        <div className="rounded-3xl bg-black p-5 text-white sm:p-6">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>ไทย · EN</span>
            <span>⤴</span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1.1fr]">
            <div
              className="flex aspect-square items-center justify-center rounded-2xl"
              style={{ background: ACCENT }}
            >
              <span className="text-6xl">🏺</span>
            </div>
            <dl className="grid content-start gap-2.5 text-sm">
              <Row label="Audio" value="Anong, in English" />
              <Row label="Text" value="340 words" />
              <Row label="Image" value="2 photographs from the kiln" />
              <p className="mt-1 text-white/70">
                Thrown thin in a small studio near the Ping river. Every work is recorded inside the kiln while it
                fires.
              </p>
              <p className="text-xs text-white/50">Gallery Seascape, Chiang Mai · 2025</p>
            </dl>
          </div>
          <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-black"
              style={{ background: "#fff" }}
            >
              ▶
            </span>
            <div>
              <p className="font-semibold">น้ำนิ่ง (Still Water)</p>
              <p className="text-xs text-white/50">Anong Vetchakul · 0:00 / 4:12</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-white/40">Made with Siang</p>
        </div>
        <p className="-mt-4 text-xs text-black/40 lg:col-start-2">A published page, opened from the code beside the work</p>
      </section>

      {/* Problem */}
      <section className="border-t border-black/10 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            An artwork holds hours of story, the label beside it holds three lines
          </h2>
          <ul className="mt-10 divide-y divide-black/10 border-y border-black/10">
            {PROBLEMS.map((p) => (
              <li key={p} className="py-5 text-base text-black/70">
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-black/50">
            The work and the label are already finished. Siang adds the story when the artist wants it there.
          </p>
        </div>
      </section>

      {/* Artist Hub */}
      <section id="artist-hub" className="border-t border-black/10 px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">One link that is the whole artist</h2>
            <p className="mt-4 max-w-md text-black/60">
              siang.co/name holds a photo, a short bio, contact channels and every work you have published, grouped
              by the show it came from. It replaces the link in your Instagram bio on day one.
            </p>
            <a href="#pricing" className="mt-6 inline-block font-semibold underline underline-offset-4">
              See the Hub
            </a>
          </div>

          <div className="rounded-3xl border border-black/10 p-6">
            <p className="flex items-center gap-1.5 text-xs text-black/40">🔗 siang.co/anong</p>
            <div className="mt-4 flex items-center gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full text-xl"
                style={{ background: ACCENT }}
              >
                🏺
              </span>
              <div>
                <p className="font-semibold">Anong Vetchakul</p>
                <p className="text-xs text-black/40">siang.co/anong</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-black/60">Celadon and unglazed stoneware. Chiang Mai.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Instagram", "LINE", "Email", "Website"].map((c) => (
                <span key={c} className="rounded-full border border-black/15 px-3 py-1 text-xs">
                  {c}
                </span>
              ))}
            </div>
            <div className="mt-5 flex gap-6 border-t border-black/10 pt-4 text-xs text-black/50">
              <span>
                <strong className="text-black">1,207</strong> Hub views this month
              </span>
              <span>
                <strong className="text-black">312</strong> followers
              </span>
            </div>
            <div className="mt-5 flex items-center justify-between text-sm font-semibold">
              <span>Work</span>
              <span className="text-black/40">4</span>
            </div>
            <ul className="mt-3 space-y-2">
              {HUB_WORKS.map((w) => (
                <li
                  key={w.title}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-white"
                  style={{ background: ACCENT }}
                >
                  <span>{w.title}</span>
                  <span className="text-xs text-white/70">{w.show}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-center text-xs text-black/30">siang.co/anong, free plan shown</p>
          </div>
        </div>
      </section>

      {/* 3-step */}
      <section id="piece-page" className="border-t border-black/10 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Every artwork gets a page, scan it and the artist speaks
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n}>
                <p className="text-2xl font-extrabold" style={{ color: ACCENT }}>
                  {s.n}
                </p>
                <p className="mt-2 text-lg font-semibold">{s.title}</p>
                <p className="mt-2 text-sm text-black/60">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-black p-5 text-white">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Work / น้ำนิ่ง (Still Water)</span>
                <span className="rounded-full bg-orange-400/90 px-3 py-1 text-xs font-semibold text-black">
                  Draft
                </span>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <ComposerRow label="Audio" value="Thai, 4:12" done />
                <ComposerRow label="Audio" value="English, not added yet" />
                <ComposerRow label="Text" value="340 words, Thai and English" done />
                <ComposerRow label="Image" value="2 of 5 used" />
                <ComposerRow label="Video" value="Not added" />
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/50">
                <span>Preview on this phone</span>
                <span className="rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ background: ACCENT }}>
                  Publish
                </span>
              </div>
              <p className="mt-2 text-[11px] text-white/30">Saved 12 seconds ago</p>
            </div>

            <div className="rounded-2xl border border-black/10 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">น้ำนิ่ง (Still Water)</span>
                <div className="flex gap-2 text-xs">
                  <span className="rounded-full border border-black/15 px-3 py-1">Share</span>
                  <span className="rounded-full bg-black px-3 py-1 text-white">Print</span>
                </div>
              </div>
              <div className="mt-4 flex gap-4">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-[#F1F0ED] text-4xl">
                  ▦
                </div>
                <div className="text-sm">
                  <p className="font-semibold">น้ำนิ่ง (Still Water)</p>
                  <p className="text-black/50">Anong Vetchakul</p>
                  <p className="mt-2 text-xs text-black/40">Scan to hear the artist</p>
                  <p className="text-xs text-black/40">siang.co/a/9k2f</p>
                </div>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-black/40">Download</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {["Label", "Code only", "SVG"].map((d) => (
                  <span key={d} className="rounded-full border border-black/15 px-3 py-1">
                    {d}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-black/30">
                At minimum 3 cm wide. The code keeps working after you change the page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scan demo */}
      <section className="border-t border-black/10 px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Scan it with your phone</h2>
            <p className="mt-4 max-w-sm text-black/60">The same page a visitor gets standing in front of the work.</p>
            <p className="mt-3 text-sm text-black/40">Opens with no app and no sign up</p>
          </div>
          <div className="flex justify-start lg:justify-end">
            <div className="rounded-3xl bg-[#F1F0ED] p-8 text-center">
              <StaticQr />
            </div>
          </div>
        </div>
      </section>

      {/* Analytics */}
      <section className="border-t border-black/10 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">You find out what happened</h2>
          <p className="mt-4 max-w-xl text-black/60">
            Every work records scans, opens, listens and average time, and separates the people who arrived by
            code, by Hub, or by link.
          </p>
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm font-semibold">Last 30 days</p>
            <span className="rounded-full border border-black/15 px-4 py-1.5 text-xs">Export</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-black/40">
                  <th className="py-3 pr-4 font-medium">Work</th>
                  <th className="py-3 pr-4 font-medium">Scans</th>
                  <th className="py-3 pr-4 font-medium">Opens</th>
                  <th className="py-3 pr-4 font-medium">Listens</th>
                  <th className="py-3 pr-4 font-medium">Average time</th>
                  <th className="py-3 pr-4 font-medium">Source (QR / Hub / Link)</th>
                </tr>
              </thead>
              <tbody>
                {ANALYTICS_ROWS.map((r) => (
                  <tr key={r.work} className="border-b border-black/5">
                    <td className="py-3 pr-4">{r.work}</td>
                    <td className="py-3 pr-4">{r.scans}</td>
                    <td className="py-3 pr-4">{r.opens}</td>
                    <td className="py-3 pr-4">{r.listens}</td>
                    <td className="py-3 pr-4">{r.avg}</td>
                    <td className="py-3 pr-4 text-black/50">{r.source}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="py-3 pr-4">Total</td>
                  <td className="py-3 pr-4">945</td>
                  <td className="py-3 pr-4">892</td>
                  <td className="py-3 pr-4">663</td>
                  <td className="py-3 pr-4">1:41</td>
                  <td className="py-3 pr-4 text-black/50">762 / 141 / 42</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-black/30">Last 30 days, one artist, four published works</p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-black/10 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Free to build, you pay when you publish</h2>
          <p className="mt-4 max-w-xl text-black/60">
            Build as much as you want without paying. The charge starts at the moment you publish a work to the
            public. The audience never pays.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.name}>
                <p className="text-xs font-semibold uppercase tracking-wide text-black/40">{p.name}</p>
                <p className="mt-2 text-3xl font-extrabold">{p.price}</p>
                <p className="mt-1 text-sm text-black/50">{p.note}</p>
              </div>
            ))}
          </div>
          <a href="#" className="mt-8 inline-block text-sm font-semibold underline underline-offset-4">
            See what is in each
          </a>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-black px-5 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Art should not be silent</h2>
          <p className="mt-3 text-white/60">Claim your link and put a page beside your next work.</p>
          <form
            className="mt-6 flex max-w-md flex-wrap gap-3"
            action="/claim-your-link"
          >
            <div className="flex flex-1 min-w-[220px] items-center rounded-full border border-white/20 bg-white/5 px-4 py-3 text-sm text-white/50">
              siang.co/
            </div>
            <Link
              href="/claim-your-link"
              className="rounded-full px-7 py-3 text-sm font-semibold text-white"
              style={{ background: ACCENT }}
            >
              Start free
            </Link>
          </form>
        </div>
      </section>

      <footer className="border-t border-black/10 px-5 py-8 text-xs text-black/40 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Siang</span>
          <Link href="/mvp" className="hover:text-black/70">
            View the demo app
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-1.5">
      <dt className="text-white/50">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

function ComposerRow({ label, value, done }: { label: string; value: string; done?: boolean }) {
  return (
    <li className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5">
      <span>
        <span className="font-semibold">{label}</span>
        <span className="ml-2 text-white/40">{value}</span>
      </span>
      {done ? <span style={{ color: "#7be08a" }}>✓</span> : <span className="text-white/30">Add</span>}
    </li>
  );
}
