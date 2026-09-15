import Image from "next/image";
import Link from "next/link";
import { Export, Play } from "@phosphor-icons/react/dist/ssr";
import LandingHeader from "./LandingHeader";
import SiteFooter from "./SiteFooter";
import ScanDemo from "./ScanDemo";
import StaticQr from "./StaticQr";
import "@/styles/siang-tokens.css";
import styles from "./LandingPage.module.css";

// Hand-drawn line-art vessel icon (wide shallow bowl on a short pedestal),
// used as the placeholder artwork thumbnail. Matches the house style in
// lib/marks.ts — inline SVG, stroke="currentColor", no icon library.
function VesselIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 96"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="50" cy="14" r="3" fill="currentColor" stroke="none" />
      <path d="M20 30h60c0 22-10 34-30 34S20 52 20 30z" />
      <path d="M50 64v10M38 82h24" />
    </svg>
  );
}

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

const PLAN_ROWS = ["ARTIST HUB", "BUILDING WORK", "PUBLISHED AT ONCE", "OVER THE LIMIT", "CONTENT LAYERS", "NUMBERS"] as const;

const PLANS = [
  {
    id: "free",
    label: "FREE",
    price: "฿0",
    sub: "Starting out",
    rows: [
      "Photo, name, bio, up to four links",
      "Unlimited, preview on your phone",
      "0",
      "Not available",
      "All of them, in draft",
      "Hub views",
    ],
    cta: "Start free",
    ctaVariant: "outline" as const,
  },
  {
    id: "artist",
    label: "ARTIST",
    badge: "Most common",
    price: "฿99 per month",
    sub: "Showing in several places",
    rows: [
      "Cover image, work grid, your own ordering",
      "Unlimited",
      "20 pieces",
      "Not available",
      "Audio, text, image, video",
      "Per work",
    ],
    cta: "Choose Artist",
    ctaVariant: "solid" as const,
    highlight: true,
  },
  {
    id: "studio",
    label: "STUDIO",
    price: "฿159 per month",
    sub: "Solo shows and large bodies of work",
    rows: [
      "Same as Artist",
      "Unlimited",
      "50 pieces",
      "Additional fee",
      "Longer video, more storage",
      "Everything, with source and export",
    ],
    cta: "Choose Studio",
    ctaVariant: "outline" as const,
  },
];

const PRICING_FOOTNOTES = [
  "The charge starts at the moment you publish a work to the public",
  "New artists get the Artist package free for three months",
];

export default function LandingPage() {
  return (
    <div className={`siang ${styles.page}`}>
      <LandingHeader />

      {/* Hero */}
      <section id="home" className={styles.hero}>
        <div className={styles.heroGrid}>
          <div>
            <h1 className={styles.h1}>The layer of sound behind every artwork</h1>
            <p className={styles.heroCopy}>
              An artist adds audio, text, image and video to one work, publishes it, and prints the code. A visitor
              scans it and hears the artist while standing in front of the real thing.
            </p>
            <div className={styles.heroActions}>
              <Link href="/claim-your-link" className={styles.ctaPrimary}>
                Start free
              </Link>
              <ScanDemo />
            </div>
          </div>

          <div className={styles.heroCard}>
            <div className={styles.heroCardTop}>
              <span>ไทย · EN</span>
              <Export size={16} weight="regular" aria-hidden="true" />
            </div>
            <div className={styles.heroCardBody}>
              <div className={styles.heroThumb}>
                <VesselIcon className={styles.heroThumbIcon} />
              </div>
              <dl className={styles.heroDl}>
                <Row label="Audio" value="Anong, in English" />
                <Row label="Text" value="340 words" />
                <Row label="Image" value="2 photographs from the kiln" />
                <p className={styles.heroBlurb}>
                  Thrown thin in a small studio near the Ping river. Every work is recorded inside the kiln while it
                  fires.
                </p>
                <p className={styles.heroMeta}>Gallery Seascape, Chiang Mai · 2025</p>
              </dl>
            </div>
            <div className={styles.heroPlayer}>
              <span className={styles.playBtn}>
                <Play size={16} weight="fill" aria-hidden="true" />
              </span>
              <div>
                <p className={styles.heroTrackTitle}>น้ำนิ่ง (Still Water)</p>
                <p className={styles.heroTrackMeta}>Anong Vetchakul · 0:00 / 4:12</p>
              </div>
            </div>
            <p className={styles.heroMadeWith}>Made with Siang</p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className={styles.section}>
        <div className={styles.narrow}>
          <h2 className={styles.h2}>
            An artwork holds hours of story, the label beside it holds three lines
          </h2>
          <ul className={styles.problemList}>
            {PROBLEMS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className={styles.problemNote}>
            The work and the label are already finished. Siang adds the story when the artist wants it there.
          </p>
        </div>
      </section>

      {/* Artist Hub */}
      <section id="artist-hub" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.hubGrid}>
            <div>
              <h2 className={styles.h2}>One link that is the whole artist</h2>
              <p className={styles.sectionLede}>
                siang.co/name holds a photo, a short bio, contact channels and every work you have published, grouped
                by the show it came from. It replaces the link in your Instagram bio on day one.
              </p>
              <a href="#pricing" className={styles.hubLink}>
                See the Hub
              </a>
            </div>

            <div className={styles.hubCard}>
              <p className={styles.hubHandle}>🔗 siang.co/anong</p>
              <div className={styles.hubProfile}>
                <span className={styles.hubAvatar}>
                  <VesselIcon className={styles.hubAvatarIcon} />
                </span>
                <div>
                  <p className={styles.hubName}>Anong Vetchakul</p>
                  <p className={styles.hubHandleSmall}>siang.co/anong</p>
                </div>
              </div>
              <p className={styles.hubBio}>Celadon and unglazed stoneware. Chiang Mai.</p>
              <div className={styles.hubChips}>
                {["Instagram", "LINE", "Email", "Website"].map((c) => (
                  <span key={c} className={styles.hubChip}>
                    {c}
                  </span>
                ))}
              </div>
              <div className={styles.hubStats}>
                <span>
                  <strong>1,207</strong> Hub views this month
                </span>
                <span>
                  <strong>312</strong> followers
                </span>
              </div>
              <div className={styles.hubWorkHead}>
                <span>Work</span>
                <span className={styles.hubWorkCount}>4</span>
              </div>
              <ul className={styles.hubWorkList}>
                {HUB_WORKS.map((w) => (
                  <li key={w.title} className={styles.hubWorkRow}>
                    <span>{w.title}</span>
                    <span className={styles.hubWorkShow}>{w.show}</span>
                  </li>
                ))}
              </ul>
              <p className={styles.hubFooterNote}>siang.co/anong, free plan shown</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-step */}
      <section id="piece-page" className={styles.section}>
        <div className={styles.container}>
          <h2 className={`${styles.h2} ${styles.stepHeading}`}>
            Every artwork gets a page, scan it and the artist speaks
          </h2>
          <div className={styles.steps}>
            {STEPS.map((s) => (
              <div key={s.n}>
                <p className={styles.stepNum}>{s.n}</p>
                <p className={styles.stepTitle}>{s.title}</p>
                <p className={styles.stepBody}>{s.body}</p>
              </div>
            ))}
          </div>

          <div className={styles.composerGrid}>
            <div className={styles.composerCard}>
              <div className={styles.composerHead}>
                <span className={styles.composerHeadLabel}>Work / น้ำนิ่ง (Still Water)</span>
                <span className={styles.draftPill}>Draft</span>
              </div>
              <ul className={styles.composerRows}>
                <ComposerRow label="Audio" value="Thai, 4:12" done />
                <ComposerRow label="Audio" value="English, not added yet" />
                <ComposerRow label="Text" value="340 words, Thai and English" done />
                <ComposerRow label="Image" value="2 of 5 used" />
                <ComposerRow label="Video" value="Not added" />
              </ul>
              <div className={styles.composerFoot}>
                <span>Preview on this phone</span>
                <span className={styles.publishPill}>Publish</span>
              </div>
              <p className={styles.savedNote}>Saved 12 seconds ago</p>
            </div>

            <div className={styles.printCard}>
              <div className={styles.printHead}>
                <span className={styles.printHeadTitle}>น้ำนิ่ง (Still Water)</span>
                <div className={styles.printHeadActions}>
                  <span className={styles.pillOutline}>Share</span>
                  <span className={styles.pillDark}>Print</span>
                </div>
              </div>
              <div className={styles.printBody}>
                <div className={styles.printQr}>▦</div>
                <div className={styles.printInfo}>
                  <p className={styles.printInfoTitle}>น้ำนิ่ง (Still Water)</p>
                  <p className={styles.printInfoArtist}>Anong Vetchakul</p>
                  <p className={styles.printInfoNote}>Scan to hear the artist</p>
                  <p className={styles.printInfoNote}>siang.co/a/9k2f</p>
                </div>
              </div>
              <p className={styles.downloadLabel}>Download</p>
              <div className={styles.downloadChips}>
                {["Label", "Code only", "SVG"].map((d) => (
                  <span key={d} className={styles.pillOutline}>
                    {d}
                  </span>
                ))}
              </div>
              <p className={styles.printFootnote}>
                At minimum 3 cm wide. The code keeps working after you change the page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scan demo */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.scanGrid}>
            <div>
              <h2 className={styles.h2}>Scan it with your phone</h2>
              <p className={styles.sectionLede}>The same page a visitor gets standing in front of the work.</p>
              <p className={styles.scanOpensNote}>Opens with no app and no sign up</p>
            </div>
            <div className={styles.scanQrWrap}>
              <div className={styles.scanQrCard}>
                <StaticQr />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.h2}>You find out what happened</h2>
          <p className={styles.sectionLede}>
            Every work records scans, opens, listens and average time, and separates the people who arrived by
            code, by Hub, or by link.
          </p>
          <div className={styles.analyticsHead}>
            <p className={styles.analyticsHeadLabel}>Last 30 days</p>
            <span className={styles.exportPill}>Export</span>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Work</th>
                  <th>Scans</th>
                  <th>Opens</th>
                  <th>Listens</th>
                  <th>Average time</th>
                  <th>Source (QR / Hub / Link)</th>
                </tr>
              </thead>
              <tbody>
                {ANALYTICS_ROWS.map((r) => (
                  <tr key={r.work}>
                    <td>{r.work}</td>
                    <td>{r.scans}</td>
                    <td>{r.opens}</td>
                    <td>{r.listens}</td>
                    <td>{r.avg}</td>
                    <td className={styles.tableSource}>{r.source}</td>
                  </tr>
                ))}
                <tr className={styles.tableTotal}>
                  <td>Total</td>
                  <td>945</td>
                  <td>892</td>
                  <td>663</td>
                  <td>1:41</td>
                  <td className={styles.tableSource}>762 / 141 / 42</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.tableFootnote}>Last 30 days, one artist, four published works</p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.h2}>Free to build, you pay when you publish</h2>
          <p className={styles.sectionLede}>The audience never pays, ever</p>
          <div className={styles.plans}>
            {PLANS.map((p) => (
              <div
                key={p.id}
                className={`${styles.planCard} ${p.highlight ? styles.planCardHighlight : ""}`}
              >
                <div className={styles.planHead}>
                  <span className={styles.planName}>{p.label}</span>
                  {p.badge ? <span className={styles.planBadge}>{p.badge}</span> : null}
                </div>
                <p className={styles.planPrice}>{p.price}</p>
                <p className={styles.planSub}>{p.sub}</p>
                <ul className={styles.planRows}>
                  {PLAN_ROWS.map((label, i) => (
                    <li key={label} className={styles.planRow}>
                      <span className={styles.planRowLabel}>{label}</span>
                      <span className={styles.planRowValue}>{p.rows[i]}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/claim-your-link"
                  className={p.ctaVariant === "solid" ? styles.planCtaSolid : styles.planCtaOutline}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <ul className={styles.pricingFootnotes}>
            {PRICING_FOOTNOTES.map((f) => (
              <li key={f}>{f}</li>
            ))}
            <li>
              Galleries, festivals and venues are{" "}
              <a href="mailto:siangplatform@gmail.com" className={styles.pricingFootnoteLink}>
                quoted separately
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* Closing CTA */}
      <section className={styles.closing}>
        <div className={styles.container}>
          <h2 className={styles.h2}>Art should not be silent</h2>
          <p className={styles.closingLede}>Claim your link and put a page beside your next work.</p>
          <form className={styles.claimForm} action="/claim-your-link">
            <div className={styles.claimPrefix}>siang.co/</div>
            <Link href="/claim-your-link" className={styles.claimCta}>
              Start free
            </Link>
          </form>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.heroRow}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ComposerRow({ label, value, done }: { label: string; value: string; done?: boolean }) {
  return (
    <li className={styles.composerRow}>
      <span>
        <span className={styles.composerRowLabel}>{label}</span>
        <span className={styles.composerRowValue}>{value}</span>
      </span>
      {done ? <span className={styles.composerRowDone}>✓</span> : <span className={styles.composerRowAdd}>Add</span>}
    </li>
  );
}
