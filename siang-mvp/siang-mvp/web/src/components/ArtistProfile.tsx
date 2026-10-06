"use client";

import { useState } from "react";
import Link from "next/link";
import { dayMonthYear, monthYear } from "@/lib/format";
import { ABOUT_CHIP, ART_CHIP, COLLECTION_CHIP, LINK_ICON, PIN_SM, SHOWS_CHIP, contactHref, contactIcon, contactLabel } from "@/lib/icons";
import type { ShareInfo } from "@/lib/share";
import { isCollection, type Artist, type Contact } from "@/lib/types";
import { Avatar, Picture, ShowCard } from "./cards";
import FollowButton from "./FollowButton";
import ReportButton from "./ReportButton";
import ShareButton from "./ShareButton";
import app from "./app.module.css";
import styles from "./Profile.module.css";

type Tab = "art" | "shows" | "collections" | "about";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "art", label: "Art", icon: ART_CHIP },
  { id: "shows", label: "Exhibition", icon: SHOWS_CHIP },
  { id: "collections", label: "Collection", icon: COLLECTION_CHIP },
  { id: "about", label: "About", icon: ABOUT_CHIP },
];

// How a contact reads in the line under the name: the address itself.
function contactText(c: Contact) {
  if (c.kind === "ig") return "@" + c.value.replace(/^@/, "");
  if (c.kind === "line") return "LINE " + c.value;
  if (c.kind === "web") return c.value.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return c.value;
}

// siang.co/<slug>: an artist's page. `own` is the signed-in artist looking at
// their own profile (the Profile tab), who gets Edit Profile instead of Follow.
export default function ArtistProfile({ artist, today, own, share }: { artist: Artist; today: string; own: boolean; share: ShareInfo }) {
  const [tab, setTab] = useState<Tab>("art");
  const exhibitions = artist.shows.filter((s) => !isCollection(s));
  const collections = artist.shows.filter(isCollection);
  const place = [artist.based, artist.country].filter(Boolean).join(", ");

  return (
    <>
      <header className={styles.head}>
        <Avatar artist={artist} size={64} />
        <div className={styles.who}>
          <h1 className={styles.name}>{artist.name}</h1>
          <p className={styles.handle}>@{artist.slug}</p>
        </div>
        <div className={styles.headActs}>
          {own ? (
            <Link href="/studio" className={styles.edit}>
              Edit Profile
            </Link>
          ) : (
            <FollowButton slug={artist.slug} name={artist.name} />
          )}
          <ShareButton info={share} look="icon" />
        </div>
      </header>

      {artist.contacts.length > 0 && (
        <p className={styles.contacts}>
          {artist.contacts.map((c) => (
            <a key={c.kind} href={contactHref(c.kind, c.value)} target="_blank" rel="noopener noreferrer" aria-label={`${contactLabel(c.kind)}: ${c.value}`}>
              {contactText(c)}
            </a>
          ))}
        </p>
      )}
      {place && (
        <a className={styles.place} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(artist.geo)}`} target="_blank" rel="noopener noreferrer">
          {PIN_SM}
          {place}
        </a>
      )}

      <div className={app.chips} role="tablist" aria-label={`${artist.name}'s page`}>
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`${app.chip} ${tab === t.id ? app.chipOn : ""}`}
            onClick={() => setTab(t.id)}
            type="button"
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "art" &&
        (artist.works.length > 0 ? (
          <div className={styles.mosaic} role="tabpanel">
            {artist.works.map((w) => (
              <Link key={w.dbId} href={`/${artist.slug}/${w.id}`} className={styles.tile}>
                <Picture className={styles.tileImg} src={w.coverUrl} fallback={artist.cardBg} />
                <span className={styles.tileText}>
                  <span className={styles.tileTitle}>{w.title}</span>
                  <span className={styles.tileDate}>{dayMonthYear(w.createdAt)}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className={styles.none} role="tabpanel">
            {own ? "Upload your first work from Edit Profile." : "No works published yet."}
          </p>
        ))}

      {tab === "shows" && (
        <div className={`${styles.panel} ${styles.stack}`} role="tabpanel">
          {exhibitions.map((show) => (
            <ShowCard key={show.slug} artist={artist} show={show} today={today} />
          ))}
          {exhibitions.length === 0 && <p className={styles.none}>No exhibitions yet.</p>}
        </div>
      )}

      {tab === "collections" && (
        <div className={`${styles.panel} ${styles.stack}`} role="tabpanel">
          {collections.map((show) => (
            <ShowCard key={show.slug} artist={artist} show={show} today={today} />
          ))}
          {collections.length === 0 && <p className={styles.none}>No collections yet.</p>}
        </div>
      )}

      {tab === "about" && (
        <div className={styles.panel} role="tabpanel">
          {artist.bio && <p className={styles.bio}>{artist.bio}</p>}
          <dl className={styles.facts}>
            {artist.artType && (
              <div className={styles.fact}>
                <dt>Art type</dt>
                <dd>{artist.artType}</dd>
              </div>
            )}
            {place && (
              <div className={styles.fact}>
                <dt>Based in</dt>
                <dd>{place}</dd>
              </div>
            )}
            <div className={styles.fact}>
              <dt>On Siang since</dt>
              <dd>{monthYear(artist.joinedAt, artist.joinedTz)}</dd>
            </div>
          </dl>
          {(artist.links.length > 0 || artist.contacts.length > 0) && (
            <nav className={styles.links} aria-label={`${artist.name}'s links`}>
              {artist.links.map((l) => (
                <a key={l.url + l.label} className={styles.linkBtn} href={l.url} target="_blank" rel="noopener noreferrer">
                  {LINK_ICON}
                  {l.label}
                </a>
              ))}
              {artist.contacts.map((c) => (
                <a key={c.kind} className={styles.linkBtn} href={contactHref(c.kind, c.value)} target="_blank" rel="noopener noreferrer">
                  {contactIcon(c.kind)}
                  {contactLabel(c.kind)}
                </a>
              ))}
            </nav>
          )}
          <div className={styles.foot}>
            <ReportButton />
          </div>
        </div>
      )}
    </>
  );
}
