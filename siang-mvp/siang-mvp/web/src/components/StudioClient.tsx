"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { clock, dayMonthYear, monthYear, showWhenText } from "@/lib/format";
import {
  SIGN_OUT_ICON,
  EDIT_ICON,
  DELETE_ICON,
  ADD_ICON,
  CHECK_ICON,
  CAMERA_ICON,
  BACK_CHEVRON_SVG,
  CLOSE_GLYPH,
  MUSIC_ICON,
  IMAGE_ICON,
  VIDEO_ICON,
  TEXT_ICON,
  LINK_ICON,
  SHARE_GLYPH,
  QR_GLYPH,
  UP_ICON,
  DOWN_ICON,
  MOVE_ICON,
  PIN_SM,
  CALENDAR_SM,
  ART_CHIP,
  SHOWS_CHIP,
  COLLECTION_CHIP,
  ABOUT_CHIP,
  SAVE_ICON,
  CHEVRON_DOWN_SVG,
  contactIcon,
} from "@/lib/icons";
import { ART_TYPES } from "@/lib/art-types";
import { slugify, slugProblem, SLUG_MAX } from "@/lib/slug";
import { COUNTRIES, findCity, findCountry } from "@/lib/places";
import { PHOTO_CARD_INK, PLAIN_CARD, averageHex, photoCardBg, photoFromCardBg, photoPosition } from "@/lib/card-cover";
import type { ShareInfo } from "@/lib/share";
import CardFace from "./CardFace";
import { OnboardingFrame, ob, type WelcomeStep } from "./Onboarding";
import m from "./Onboarding.module.css";
import Tour from "./Tour";
import { EXHIBITIONS_OPEN } from "@/lib/beta";
import { ShareSheet } from "./ShareButton";
import Spinner from "./Spinner";
// The Studio is the artist's profile as visitors see it (ArtistProfile), with
// edit controls on top, so it shares the profile's and the app's styles.
import app from "./app.module.css";
import pf from "./Profile.module.css";
import st from "./Studio.module.css";

export type StudioArtist = {
  id: string;
  slug: string;
  name: string;
  discipline: string | null;
  based: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  bio: string | null;
  avatar_url: string | null;
  card_bg: string;
  card_ink: string;
  card_tint: string;
  joined_at: string | null;
  joined_tz: string | null;
  // 0016_beta_checklist.sql
  statement?: string | null;
  shop_url?: string | null;
  view_count?: number;
  slug_changed_at?: string | null;
};

export type StudioLink = {
  id: string;
  label: string;
  url: string;
  sort_order: number;
};

// The fields added by supabase/migrations/0015_v3_fields.sql are optional
// here: they are missing from rows read before that migration has run.
export type StudioArtwork = {
  id: string;
  slug: string;
  code: string;
  title: string;
  duration_sec: number | null;
  description: string | null;
  cover_url: string | null;
  audio_url: string | null;
  listen_count: number;
  sort_order: number;
  created_at: string;
  year?: number | null;
  medium?: string | null;
  height_cm?: number | null;
  width_cm?: number | null;
  depth_cm?: number | null;
  // 0016_beta_checklist.sql
  title_en?: string | null;
  size_text?: string | null;
  materials?: string | null;
  edition?: string | null;
  credits?: string | null;
  price?: string | null;
  availability?: "available" | "sold" | "not_for_sale" | null;
  location_now?: string | null;
  status?: "published" | "taken_down" | "removed";
  view_count?: number;
  artwork_blocks?: StudioBlock[];
};

// A further picture of a work (artwork_blocks of type "image").
export type StudioBlock = { id: string; type: string; media_url: string | null; sort_order: number };

export type StudioContact = {
  kind: "ig" | "line" | "email" | "web";
  value: string;
};

// A row with a venue is an exhibition; without one it is a collection.
export type StudioExhibition = {
  id: string;
  slug: string;
  title: string;
  kind: "solo" | "group";
  year: number | null;
  venue: string | null;
  cover_url: string | null;
  starts_on?: string | null;
  ends_on?: string | null;
  city?: string | null;
  hours?: string | null;
  entry?: string | null;
  exhibition_artworks: { artwork_id: string }[];
};

type WorkDetails = {
  title_en: string | null;
  year: number | null;
  medium: string | null;
  size_text: string | null;
  height_cm: number | null;
  width_cm: number | null;
  depth_cm: number | null;
  materials: string | null;
  edition: string | null;
  credits: string | null;
  price: string | null;
  availability: "available" | "sold" | "not_for_sale" | null;
  location_now: string | null;
};

type WorkUpdate = Partial<WorkDetails> &
  Partial<Pick<StudioArtwork, "title" | "description" | "duration_sec" | "cover_url" | "audio_url" | "status">>;

type ShowFields = {
  title: string;
  slug: string;
  kind: "solo" | "group";
  venue: string | null; // null makes it a collection
  year: number | null;
  city: string | null;
  starts_on: string | null;
  ends_on: string | null;
  hours: string | null;
  entry: string | null;
  workIds: string[];
};

const makeCode = () => String(100000 + Math.floor(Math.random() * 899999));
const BIO_LIMIT = 160;
const WORK_COLUMNS = "id, slug, code, title, duration_sec, description, cover_url, audio_url, listen_count, sort_order, created_at";

// The database says a column is unknown when migration 0015 has not been run yet.
const isMissingColumn = (error: { code?: string } | null) => error?.code === "PGRST204" || error?.code === "42703";
const NEEDS_MIGRATION = "Siang's database needs its latest update before these details can be saved. Please tell the Siang team.";

// Leaves the v3 columns out of a write when there is nothing to put in them,
// so the write also works on a database that doesn't have them yet.
function withFilled<T extends Record<string, unknown>>(fields: T, keep: boolean): Partial<T> {
  return keep || Object.values(fields).some((v) => v != null) ? fields : {};
}

// Uploads to the shared public "media" bucket under the signed-in user's own
// folder (storage RLS restricts writes to "{auth.uid()}/..." — see
// supabase/migrations/0004_storage.sql) and returns the public URL. Used for
// photos and audio alike; the bucket doesn't care about content type.
async function uploadFile(supabase: SupabaseClient, file: File): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true, cacheControl: "3600" });
  if (error) throw error;
  const {
    data: { publicUrl },
  } = supabase.storage.from("media").getPublicUrl(path);
  return publicUrl;
}

export type { WelcomeStep };

export default function StudioClient({
  email,
  suggestedName,
  instagram,
  welcome,
  artist,
  works,
  contacts,
  shows,
  links,
}: {
  email: string;
  suggestedName: string; // from sign up, for the first onboarding step
  instagram: string;
  welcome: WelcomeStep | null; // the onboarding step to show over the Studio
  artist: StudioArtist | null;
  works: StudioArtwork[];
  contacts: StudioContact[];
  shows: StudioExhibition[];
  links: StudioLink[];
}) {
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!artist) {
    return (
      <main className={`${app.app} ${app.appBare}`}>
        <div className={st.bar}>
          <Link href="/" className={app.iconBtn} aria-label="Back to Siang">
            {BACK_CHEVRON_SVG}
          </Link>
          <span className={st.barTitle}>{email}</span>
          <button className={app.iconBtn} onClick={signOut} aria-label="Sign out" type="button">
            {SIGN_OUT_ICON}
          </button>
        </div>
        <CreateProfile suggestedName={suggestedName} instagram={instagram} />
      </main>
    );
  }

  return <ArtistPage artist={artist} works={works} contacts={contacts} shows={shows} links={links} onSignOut={signOut} welcome={welcome} />;
}

type ContactInputs = { ig: string; line: string; email: string; web: string };

// What was typed in the contact fields, cleaned up, or what is wrong with it.
// An artist needs at least one way to be reached (launch checklist).
function parseContacts(c: ContactInputs): [StudioContact["kind"], string][] | string {
  const email = c.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Check the email address. It needs an @ and a domain.";
  const pairs: [StudioContact["kind"], string][] = [
    ["ig", c.ig.trim().replace(/^@/, "")],
    ["line", c.line.trim()],
    ["email", email],
    ["web", c.web.trim().replace(/^https?:\/\//i, "")],
  ];
  if (!pairs.some(([, v]) => v)) return "Add at least one way to contact you: Instagram, LINE, email or a website.";
  return pairs;
}

function ContactFields({ value, onChange }: { value: ContactInputs; onChange: (v: ContactInputs) => void }) {
  const set = (key: keyof ContactInputs) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [key]: e.target.value });
  return (
    <>
      <div style={styles.fldH}>Contact</div>
      <p style={{ ...styles.hint, marginTop: -6 }}>At least one, so people can reach you about your work.</p>
      <div style={styles.row}>
        <Field label="Instagram">
          <input style={styles.input} placeholder="@handle" autoCapitalize="none" value={value.ig} onChange={set("ig")} />
        </Field>
        <Field label="LINE ID">
          <input style={styles.input} autoCapitalize="none" value={value.line} onChange={set("line")} />
        </Field>
      </div>
      <Field label="Email">
        <input style={styles.input} type="email" value={value.email} onChange={set("email")} />
      </Field>
      <Field label="Website">
        <input style={styles.input} inputMode="url" autoCapitalize="none" placeholder="example.com" value={value.web} onChange={set("web")} />
      </Field>
    </>
  );
}

// ── Onboarding ─────────────────────────────────────────────────────────────
// After sign up (name, email, Instagram on /login), an artist goes through:
// Joining is two steps: the account (/join), then this link. After that the
// artist is on their own page: a checkpoint says what they have now
// (/studio?welcome=ready), and a two-tip tour points at sharing and at
// uploading a work. Photo, details, works and collections are never forced.

// Step 1: the artist's name and link. The only step that can't be skipped,
// because everything else hangs off the profile it creates.
function CreateProfile({ suggestedName, instagram }: { suggestedName: string; instagram: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState(suggestedName);
  // Follows the name until the artist types their own link (a Thai name has no Latin slug to suggest).
  const [slug, setSlug] = useState(slugify(suggestedName).slice(0, SLUG_MAX));
  const [slugTouched, setSlugTouched] = useState(false);
  const [rights, setRights] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Add the name people know your work by.");
      return;
    }
    const problem = slugProblem(slug);
    if (problem) {
      setError(`Your link: ${problem}`);
      return;
    }
    if (!rights) {
      setError("Tick the box to confirm you have the rights to what you upload.");
      return;
    }
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in.");
      setBusy(false);
      return;
    }
    const row = {
      user_id: user.id,
      slug,
      name: name.trim(),
      ...PLAIN_CARD,
      joined_tz: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    };
    let res = await supabase.from("artists").insert({ ...row, rights_confirmed_at: new Date().toISOString() }).select("id").single<{ id: string }>();
    // Signing up must not wait for the database update: without the column, the tick is simply not recorded.
    if (isMissingColumn(res.error)) res = await supabase.from("artists").insert(row).select("id").single<{ id: string }>();
    if (res.error || !res.data) {
      setBusy(false);
      setError(res.error ? slugTakenMessage(res.error.message, res.error.code) : "Could not create the profile.");
      return;
    }
    const ig = instagram.trim().replace(/^@/, "");
    if (ig) await supabase.from("artist_contacts").insert({ artist_id: res.data.id, kind: "ig", value: ig });
    router.replace("/studio?welcome=ready");
    router.refresh();
  }

  return (
    <OnboardingFrame step={2} title="Your Siang link" lead="This is where people find you, and what your QR codes open.">
      <form onSubmit={submit} style={{ ...styles.form, marginTop: 22 }}>
        <Field label="Artist name">
          <input
            style={styles.input}
            value={name}
            autoFocus
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value).slice(0, SLUG_MAX));
            }}
          />
        </Field>
        <SlugField
          value={slug}
          onChange={(v) => {
            setSlugTouched(true);
            setSlug(v);
          }}
        />
        <p style={{ ...styles.hint, marginTop: -6 }}>3 to 30 English letters, numbers and dashes. You can change it once later.</p>
        <label style={styles.checkRow}>
          <input type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} />
          <span>I own or have the rights to what I upload.</span>
        </label>
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.submit} type="submit" disabled={busy}>
          {busy ? (
            <>
              <Spinner /> Creating…
            </>
          ) : (
            "Continue"
          )}
        </button>
      </form>
    </OnboardingFrame>
  );
}

// The checkpoint right after the link is made: what the artist has now, and
// what can wait. Nothing here asks for more; it leads to their own page.
function WelcomeReady({ artist, onNext }: { artist: StudioArtist; onNext: () => void }) {
  return (
    <OnboardingFrame title="Your page is live" lead="That was all you had to do. Here is what you have, and what you can add whenever you like.">
      <p style={styles.linkPreview}>siang.co/{artist.slug}</p>
      <div>
        <ul className={m.have}>
          <li>
            <span className={m.tick}>{CHECK_ICON}</span>
            <span>
              Your artist page
              <small>Anyone with the link can open it.</small>
            </span>
          </li>
          <li>
            <span className={m.tick}>{CHECK_ICON}</span>
            <span>
              A QR code for your page
              <small>Share it or print it from the share button.</small>
            </span>
          </li>
        </ul>
        <p className={m.haveHead}>Whenever you like</p>
        <ul className={m.have}>
          <li className={m.haveLater}>
            <span className={m.later} />
            <span>
              Your photo, city and a short bio
              <small>From Edit Profile.</small>
            </span>
          </li>
          <li className={m.haveLater}>
            <span className={m.later} />
            <span>
              Works with your voice
              <small>One at a time, as many as you like.</small>
            </span>
          </li>
        </ul>
      </div>
      <div style={{ ...styles.form, marginTop: 26 }}>
        <button style={styles.submit} onClick={onNext} type="button">
          See my page
        </button>
      </div>
    </OnboardingFrame>
  );
}

// The artist's main art type (PRD 7.1). Someone who typed their own
// discipline before the list existed keeps it as an extra choice.
function ArtTypeField({ value, onChange, required }: { value: string; onChange: (v: string) => void; required?: boolean }) {
  const listed = (ART_TYPES as readonly string[]).includes(value);
  return (
    <label style={styles.label}>
      Main art type
      <select style={styles.select} value={value} required={required} onChange={(e) => onChange(e.target.value)}>
        <option value="" disabled>
          Choose…
        </option>
        {value && !listed && <option value={value}>{value}</option>}
        {ART_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}

function contactValue(contacts: StudioContact[], kind: StudioContact["kind"]) {
  return contacts.find((c) => c.kind === kind)?.value ?? "";
}

// How a contact reads in the line under the name: the address itself.
function contactText(c: StudioContact) {
  if (c.kind === "ig") return "@" + c.value.replace(/^@/, "");
  return c.value;
}

type Tab = "art" | "shows" | "collections" | "about";
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "art", label: "Art", icon: ART_CHIP },
  { id: "shows", label: "Exhibition", icon: SHOWS_CHIP },
  { id: "collections", label: "Collection", icon: COLLECTION_CHIP },
  { id: "about", label: "About", icon: ABOUT_CHIP },
];

type OpenSheet =
  | null
  | "profile"
  | "links"
  | "compose"
  | { newShow: "exhibition" | "collection" }
  | { show: StudioExhibition }
  | { work: StudioArtwork }
  | { qr: StudioArtwork };

// The artist's profile as visitors see it, with edit controls on top: tap the
// avatar to change the photo, Edit Profile for the details, a tile to edit a
// work, a card to edit an exhibition or collection.
function ArtistPage({
  artist,
  works,
  contacts,
  shows,
  links,
  onSignOut,
  welcome: initialWelcome,
}: {
  artist: StudioArtist;
  works: StudioArtwork[];
  contacts: StudioContact[];
  shows: StudioExhibition[];
  links: StudioLink[];
  onSignOut: () => void;
  welcome: WelcomeStep | null;
}) {
  const router = useRouter();
  const [welcome, setWelcome] = useState(initialWelcome);
  function finishWelcome() {
    setWelcome(null);
    router.replace("/studio", { scroll: false });
  }
  const supabase = createClient();
  const cardRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>("art");
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const [card, setCard] = useState({ card_bg: artist.card_bg, card_ink: artist.card_ink });
  const [avatarUrl, setAvatarUrl] = useState(artist.avatar_url);
  const [uploading, setUploading] = useState<null | "card" | "avatar">(null);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState(works);
  const [showRows, setShowRows] = useState(shows);
  const [linkRows, setLinkRows] = useState(links);
  const [copied, setCopied] = useState(false);

  const cardPhoto = photoFromCardBg(card.card_bg);
  const hasCardPhoto = !!cardPhoto;
  // Repositioning the card photo: while set, dragging the card moves the photo.
  const [adjust, setAdjust] = useState<{ x: number; y: number } | null>(null);
  const [savingPosition, setSavingPosition] = useState(false);
  const heroRef = useRef<HTMLButtonElement>(null);
  const photoSize = useRef<{ w: number; h: number } | null>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const shownCardBg = adjust && cardPhoto ? photoCardBg(cardPhoto, adjust.x, adjust.y) : card.card_bg;

  function startAdjust(bg = card.card_bg) {
    const photo = photoFromCardBg(bg);
    if (!photo) return;
    photoSize.current = null;
    const img = new Image();
    img.onload = () => (photoSize.current = { w: img.naturalWidth, h: img.naturalHeight });
    img.src = photo;
    setAdjust(photoPosition(bg));
  }

  // With background-size: cover the photo overflows the card on one axis;
  // dragging by the whole overflow moves the position from 0% to 100%.
  function onAdjustMove(e: React.PointerEvent) {
    const d = drag.current;
    const el = heroRef.current;
    const size = photoSize.current;
    if (!d || !el || !size) return;
    const cw = el.clientWidth;
    const ch = el.clientHeight;
    const scale = Math.max(cw / size.w, ch / size.h);
    const overX = size.w * scale - cw;
    const overY = size.h * scale - ch;
    const clamp = (n: number) => Math.min(100, Math.max(0, n));
    setAdjust({
      x: overX > 1 ? clamp(d.x - ((e.clientX - d.px) / overX) * 100) : 50,
      y: overY > 1 ? clamp(d.y - ((e.clientY - d.py) / overY) * 100) : 50,
    });
  }

  async function savePosition() {
    if (!adjust || !cardPhoto) return;
    setSavingPosition(true);
    setError(null);
    const card_bg = photoCardBg(cardPhoto, adjust.x, adjust.y);
    const { error } = await supabase.from("artists").update({ card_bg }).eq("id", artist.id);
    setSavingPosition(false);
    if (error) {
      setError(error.message);
      return;
    }
    setCard((c) => ({ ...c, card_bg }));
    setAdjust(null);
    router.refresh();
  }
  const listens = rows.reduce((sum, w) => sum + w.listen_count, 0);
  const url = `https://siang.co/${artist.slug}`;
  const place = [artist.based, artist.country].filter(Boolean).join(", ");
  const exhibitions = showRows.filter((sh) => sh.venue);
  const collections = showRows.filter((sh) => !sh.venue);

  async function changeCardPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading("card");
    setError(null);
    try {
      const [photo, tint] = await Promise.all([uploadFile(supabase, file), averageHex(file)]);
      const next = { card_bg: photoCardBg(photo), card_ink: PHOTO_CARD_INK, card_tint: tint ?? artist.card_tint };
      const { error } = await supabase.from("artists").update(next).eq("id", artist.id);
      if (error) throw error;
      setCard({ card_bg: next.card_bg, card_ink: next.card_ink });
      startAdjust(next.card_bg);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload the card photo.");
    } finally {
      setUploading(null);
    }
  }

  async function removeCardPhoto() {
    setError(null);
    const { error } = await supabase.from("artists").update(PLAIN_CARD).eq("id", artist.id);
    if (error) {
      setError(error.message);
      return;
    }
    setCard({ card_bg: PLAIN_CARD.card_bg, card_ink: PLAIN_CARD.card_ink });
    router.refresh();
  }

  async function changeAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading("avatar");
    setError(null);
    try {
      const photo = await uploadFile(supabase, file);
      const { error } = await supabase.from("artists").update({ avatar_url: photo }).eq("id", artist.id);
      if (error) throw error;
      setAvatarUrl(photo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload your photo.");
    } finally {
      setUploading(null);
    }
  }

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: artist.name, url });
        return;
      } catch {
        // user cancelled the native share sheet
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard API unavailable — nothing to fall back to here
    }
  }

  async function addWork(fields: {
    title: string;
    coverUrl: string;
    audioUrl: string | null;
    durationSec: number | null;
    description: string;
    exhibitionId: string | null;
    details: WorkDetails;
  }) {
    const base = slugify(fields.details.title_en || fields.title);
    const slug = base && base !== "shows" ? base : `work-${Date.now()}`;
    const row = {
      artist_id: artist.id,
      slug,
      code: makeCode(),
      title: fields.title,
      duration_sec: fields.durationSec,
      description: fields.description || null,
      cover_url: fields.coverUrl,
      audio_url: fields.audioUrl,
      sort_order: rows.length,
    };
    // Publishing must not wait for a database update: if the newest columns
    // are missing the work goes live with the older set, and with none of
    // them if those are missing too. The details can be added afterwards.
    const filled = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v != null));
    const { year, medium, height_cm, width_cm, depth_cm, ...newer } = fields.details;
    const older = filled({ year, medium, height_cm, width_cm, depth_cm });
    let saved: Record<string, unknown> = { ...older, ...filled(newer) };
    let res = await supabase.from("artworks").insert({ ...row, ...saved }).select(WORK_COLUMNS).single();
    if (isMissingColumn(res.error)) {
      saved = older;
      res = await supabase.from("artworks").insert({ ...row, ...saved }).select(WORK_COLUMNS).single();
    }
    if (isMissingColumn(res.error)) {
      saved = {};
      res = await supabase.from("artworks").insert(row).select(WORK_COLUMNS).single();
    }
    if (res.error || !res.data) {
      const taken = res.error?.code === "23505";
      return { error: taken ? "You already have a work with that link. Change its English title a little." : res.error?.message ?? "Could not publish the work." };
    }
    const work: StudioArtwork = { ...(res.data as StudioArtwork), ...saved, artwork_blocks: [] };

    if (fields.exhibitionId) {
      await supabase.from("exhibition_artworks").insert({ exhibition_id: fields.exhibitionId, artwork_id: work.id });
      setShowRows((r) =>
        r.map((sh) => (sh.id === fields.exhibitionId ? { ...sh, exhibition_artworks: [...sh.exhibition_artworks, { artwork_id: work.id }] } : sh))
      );
    }

    setRows((r) => [...r, work]);
    setSheet(null);
    router.refresh();
    return {};
  }

  async function updateWork(id: string, fields: WorkUpdate) {
    const { error } = await supabase.from("artworks").update(fields).eq("id", id);
    if (error) return isMissingColumn(error) ? NEEDS_MIGRATION : error.message;
    setRows((r) => r.map((w) => (w.id === id ? { ...w, ...fields } : w)));
    router.refresh();
    return null;
  }

  function setWorkImages(id: string, artwork_blocks: StudioBlock[]) {
    setRows((r) => r.map((w) => (w.id === id ? { ...w, artwork_blocks } : w)));
    router.refresh();
  }

  async function deleteWork(id: string) {
    const { error } = await supabase.from("artworks").delete().eq("id", id);
    if (error) return error.message;
    setRows((r) => r.filter((w) => w.id !== id));
    setShowRows((r) => r.map((sh) => ({ ...sh, exhibition_artworks: sh.exhibition_artworks.filter((a) => a.artwork_id !== id) })));
    setSheet(null);
    router.refresh();
    return null;
  }

  // Creates an exhibition or collection, or saves changes to one (`existing`).
  async function saveShow(fields: ShowFields, existing: StudioExhibition | null) {
    const { workIds, title, slug, kind, venue, year, ...extra } = fields;
    const hadExtra = !!existing && [existing.starts_on, existing.ends_on, existing.city, existing.hours, existing.entry].some((v) => v != null);
    const row = { title, kind, venue, year, ...withFilled(extra, hadExtra) };

    let id = existing?.id;
    if (existing) {
      const { error } = await supabase.from("exhibitions").update(row).eq("id", existing.id);
      if (error) return { error: isMissingColumn(error) ? NEEDS_MIGRATION : error.message };
    } else {
      const { data, error } = await supabase
        .from("exhibitions")
        .insert({ artist_id: artist.id, slug, ...row })
        .select("id")
        .single<{ id: string }>();
      if (error || !data) {
        if (isMissingColumn(error)) return { error: NEEDS_MIGRATION };
        const taken = error?.code === "23505";
        return { error: taken ? "You already have one with that link. Try another." : error?.message ?? "Could not create it." };
      }
      id = data.id;
    }

    // Replace the list of works with the ticked ones.
    const before = existing?.exhibition_artworks.map((a) => a.artwork_id) ?? [];
    const removed = before.filter((w) => !workIds.includes(w));
    const added = workIds.filter((w) => !before.includes(w));
    let linkError: string | null = null;
    if (removed.length) {
      const { error } = await supabase.from("exhibition_artworks").delete().eq("exhibition_id", id).in("artwork_id", removed);
      if (error) linkError = error.message;
    }
    if (added.length) {
      const { error } = await supabase.from("exhibition_artworks").insert(added.map((artwork_id) => ({ exhibition_id: id, artwork_id })));
      if (error) linkError = error.message;
    }

    const saved: StudioExhibition = {
      id: id!,
      slug: existing?.slug ?? slug,
      cover_url: existing?.cover_url ?? null,
      ...(existing ? { starts_on: existing.starts_on, ends_on: existing.ends_on, city: existing.city, hours: existing.hours, entry: existing.entry } : {}),
      ...row,
      exhibition_artworks: linkError ? before.map((artwork_id) => ({ artwork_id })) : workIds.map((artwork_id) => ({ artwork_id })),
    };
    setShowRows((r) => (existing ? r.map((sh) => (sh.id === saved.id ? saved : sh)) : [saved, ...r]));
    router.refresh();
    // The row itself was saved; only the list of works failed — say so rather than leave it silently wrong.
    if (linkError) return { error: `Saved, but the works couldn't be updated: ${linkError}` };
    setSheet(null);
    return {};
  }

  async function deleteShow(id: string) {
    const { error } = await supabase.from("exhibitions").delete().eq("id", id);
    if (error) return error.message;
    setShowRows((r) => r.filter((sh) => sh.id !== id));
    setSheet(null);
    router.refresh();
    return null;
  }

  async function updateShowCover(id: string, cover_url: string) {
    setShowRows((r) => r.map((sh) => (sh.id === id ? { ...sh, cover_url } : sh)));
    await supabase.from("exhibitions").update({ cover_url }).eq("id", id);
  }

  const workShare = (w: StudioArtwork): ShareInfo => ({
    title: w.title,
    subtitle: artist.name,
    meta: [w.year, w.medium].filter(Boolean).join(" · "),
    url: `${url}/${w.slug}`,
    qrUrl: `https://siang.co/w/${w.code}`,
    code: w.code,
    hint: "Scan to listen",
    file: `siang-${w.code}`,
  });

  // One exhibition or collection as a card: tap to edit, the camera to change its cover.
  const showCard = (sh: StudioExhibition) => {
    const showWorks = rows.filter((w) => sh.exhibition_artworks.some((a) => a.artwork_id === w.id));
    const cover = sh.cover_url ?? showWorks.find((w) => w.cover_url)?.cover_url ?? null;
    const when = showWhenText({ startsOn: sh.starts_on ?? null, endsOn: sh.ends_on ?? null, year: sh.year });
    return (
      <div key={sh.id} className={`${app.show} ${app.shade}`}>
        <span className={app.cardImg} style={{ background: cover ? `center/cover no-repeat url("${cover}")` : "var(--surface-hi)" }} />
        <span className={app.showMeta}>
          {sh.venue && (
            <span>
              {PIN_SM}
              {sh.city || sh.venue}
            </span>
          )}
          {when && (
            <span>
              {CALENDAR_SM}
              {when}
            </span>
          )}
          <span>
            {showWorks.length} work{showWorks.length === 1 ? "" : "s"}
          </span>
        </span>
        <h2 className={app.showTitle}>{sh.title}</h2>
        <button className={app.cover} onClick={() => setSheet({ show: sh })} aria-label={`Edit ${sh.title}`} type="button" />
        <ShowCoverButton show={sh} onChange={updateShowCover} />
      </div>
    );
  };

  return (
    <main className={app.app}>
      <div className={st.bar}>
        <Link href="/" className={app.iconBtn} aria-label="Back to Siang">
          {BACK_CHEVRON_SVG}
        </Link>
        <span className={st.barTitle}>{copied ? "Link copied" : "Your studio"}</span>
        <div className={app.topActs}>
          <button className={app.iconBtn} onClick={share} aria-label="Share your page" data-tour="share" type="button">
            {SHARE_GLYPH}
          </button>
          <button className={app.iconBtn} onClick={onSignOut} aria-label="Sign out" type="button">
            {SIGN_OUT_ICON}
          </button>
        </div>
      </div>

      <header className={pf.head}>
        <button
          className={`${app.avatar} ${st.avatarBtn}`}
          style={avatarUrl ? { backgroundImage: `url("${avatarUrl}")` } : undefined}
          onClick={() => avatarRef.current?.click()}
          disabled={uploading === "avatar"}
          aria-label="Change your photo"
          type="button"
        >
          {uploading === "avatar" ? <Spinner size={20} label="Uploading photo" /> : !avatarUrl && CAMERA_ICON}
          <span className={st.avatarBadge}>{EDIT_ICON}</span>
        </button>
        <input ref={avatarRef} type="file" accept="image/*" hidden onChange={changeAvatar} />
        <div className={pf.who}>
          <h1 className={pf.name}>{artist.name}</h1>
          <p className={pf.handle}>@{artist.slug}</p>
        </div>
        <div className={pf.headActs}>
          <button className={pf.edit} onClick={() => setSheet("profile")} type="button">
            Edit Profile
          </button>
        </div>
      </header>
      {error && <p className={st.error}>{error}</p>}

      <p className={pf.contacts}>
        {contacts.map((c) => (
          <span key={c.kind}>
            {contactIcon(c.kind, 15)}
            {contactText(c)}
          </span>
        ))}
        {contacts.length === 0 && (
          <button className={st.addHint} onClick={() => setSheet("profile")} type="button">
            + Add a way to contact you
          </button>
        )}
      </p>
      {place ? (
        <p className={pf.place}>
          {PIN_SM}
          {place}
        </p>
      ) : (
        <button className={`${pf.place} ${st.addHint}`} onClick={() => setSheet("profile")} type="button">
          + Add where you&apos;re based
        </button>
      )}

      <div className={app.chips} role="tablist" aria-label="Your page">
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
        {/* Not a tab of this page: the artist's own list of saved works (siang.co/saved). */}
        <Link href="/saved" className={app.chip}>
          {SAVE_ICON} Saved
        </Link>
      </div>

      {tab === "art" && (
        <div className={pf.mosaic} role="tabpanel">
          <button className={`${pf.tile} ${st.addTile}`} onClick={() => setSheet("compose")} data-tour="upload" type="button">
            {ADD_ICON}
            <span>{rows.length ? "Add another work" : "Upload a work"}</span>
          </button>
          {rows.map((w) => (
            <button
              key={w.id}
              className={pf.tile}
              style={(w.status ?? "published") === "published" ? undefined : { opacity: 0.5 }}
              onClick={() => setSheet({ work: w })}
              type="button"
              aria-label={`Edit ${w.title}`}
            >
              <span className={pf.tileImg} style={{ background: w.cover_url ? `center/cover no-repeat url("${w.cover_url}")` : "var(--surface-hi)" }} />
              <span className={pf.tileText}>
                <span className={pf.tileTitle}>{w.title}</span>
                <span className={pf.tileDate}>{dayMonthYear(w.created_at)}</span>
              </span>
              <span className={pf.tileFoot}>
                {(w.status ?? "published") !== "published"
                  ? "Taken down"
                  : `${(w.view_count ?? 0).toLocaleString()} views · ${w.audio_url ? `${w.listen_count.toLocaleString()} listens` : "no sound"}`}
              </span>
            </button>
          ))}
        </div>
      )}

      {tab === "shows" && !EXHIBITIONS_OPEN && (
        <div className={pf.panel} role="tabpanel">
          <div className={st.soon}>
            <span className={st.soonTag}>Coming soon</span>
            <h2>Exhibitions are on the way</h2>
            <p>Soon you can add a show with its place and dates. For now, upload your works; you can group them into an exhibition when this opens.</p>
          </div>
        </div>
      )}
      {tab === "shows" && EXHIBITIONS_OPEN && (
        <div className={`${pf.panel} ${pf.stack}`} role="tabpanel">
          {exhibitions.map(showCard)}
          {exhibitions.length === 0 && <p className={pf.none}>Add an exhibition with its place and dates, so people know where to go and until when.</p>}
          <button className={app.btnGhost} onClick={() => setSheet({ newShow: "exhibition" })} type="button">
            {ADD_ICON} New exhibition
          </button>
        </div>
      )}

      {tab === "collections" && (
        <div className={`${pf.panel} ${pf.stack}`} role="tabpanel">
          {collections.map(showCard)}
          {collections.length === 0 && <p className={pf.none}>Pull your own works together into a collection: a series, a period, a selection.</p>}
          <button className={app.btnGhost} onClick={() => setSheet({ newShow: "collection" })} type="button">
            {ADD_ICON} New collection
          </button>
        </div>
      )}

      {tab === "about" && (
        <div className={pf.panel} role="tabpanel">
          <p className={st.cardHint} style={{ marginTop: 0, marginBottom: 14 }}>
            The numbers here are seen only by you. Your own visits are not counted.
          </p>
          {artist.bio ? (
            <p className={pf.bio}>{artist.bio}</p>
          ) : (
            <button className={st.addHint} onClick={() => setSheet("profile")} type="button">
              + Add a short bio
            </button>
          )}
          <dl className={pf.facts}>
            <div className={pf.fact}>
              <dt>Art type</dt>
              <dd>{artist.discipline || "Not set"}</dd>
            </div>
            <div className={pf.fact}>
              <dt>On Siang since</dt>
              <dd>{monthYear(artist.joined_at, artist.joined_tz)}</dd>
            </div>
            <div className={pf.fact}>
              <dt>Profile views</dt>
              <dd>{(artist.view_count ?? 0).toLocaleString()}</dd>
            </div>
            <div className={pf.fact}>
              <dt>Work views</dt>
              <dd>{rows.reduce((sum, w) => sum + (w.view_count ?? 0), 0).toLocaleString()}</dd>
            </div>
            <div className={pf.fact}>
              <dt>Listens</dt>
              <dd>{listens.toLocaleString()}</dd>
            </div>
          </dl>

          <div className={pf.links}>
            {linkRows.map((l) => (
              <a key={l.id} className={pf.linkBtn} href={l.url} target="_blank" rel="noopener noreferrer">
                {LINK_ICON}
                {l.label}
              </a>
            ))}
            <button className={`${pf.linkBtn} ${st.dashed}`} onClick={() => setSheet("links")} type="button">
              {ADD_ICON}
              {linkRows.length ? "Edit links" : "Add links"}
            </button>
          </div>

          <h2 className={st.sectionTitle}>Your card</h2>
          <button
            ref={heroRef}
            className={`${st.hero} ${adjust ? st.adjusting : ""}`}
            onClick={() => !adjust && cardRef.current?.click()}
            onPointerDown={(e) => {
              if (!adjust) return;
              drag.current = { px: e.clientX, py: e.clientY, ...adjust };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={onAdjustMove}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            disabled={uploading === "card"}
            aria-label={adjust ? "Drag to move the photo" : hasCardPhoto ? "Change your card photo" : "Add a photo to your card"}
            type="button"
          >
            <CardFace
              card={{
                cardBg: shownCardBg,
                cardInk: card.card_ink,
                based: artist.based ?? "",
                country: artist.country ?? "",
                addedAt: artist.joined_at ?? new Date().toISOString(),
                joinedTz: artist.joined_tz,
                name: artist.name,
                slug: artist.slug,
              }}
            />
            {uploading === "card" && (
              <span className={st.veil}>
                <Spinner size={28} label="Uploading card photo" />
              </span>
            )}
            <span className={st.cardEdit}>
              {adjust ? (
                <>
                  {MOVE_ICON} Drag to move
                </>
              ) : (
                <>
                  {CAMERA_ICON} {hasCardPhoto ? "Change photo" : "Add photo"}
                </>
              )}
            </span>
          </button>
          <input ref={cardRef} type="file" accept="image/*" hidden onChange={changeCardPhoto} />
          {adjust ? (
            <div className={st.adjustBar}>
              <button className={st.adjustCancel} onClick={() => setAdjust(null)} disabled={savingPosition} type="button">
                Cancel
              </button>
              <button className={st.adjustSave} onClick={savePosition} disabled={savingPosition} type="button">
                {savingPosition ? <Spinner size={14} /> : null} Save position
              </button>
            </div>
          ) : (
            <p className={st.cardHint}>
              The card you hand out when you meet someone. Its colours also stand in for a work that has no picture.
              {hasCardPhoto && (
                <>
                  {" "}
                  <button onClick={() => startAdjust()} className={st.textBtn} type="button">
                    Move photo
                  </button>
                  {" · "}
                  <button onClick={removeCardPhoto} className={st.textBtn} type="button">
                    Remove photo
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      )}

      {welcome === "ready" && <WelcomeReady artist={artist} onNext={() => setWelcome("tour")} />}
      {welcome === "tour" && (
        <Tour
          onClose={finishWelcome}
          steps={[
            {
              target: '[data-tour="share"]',
              title: "This is your page. Share it",
              text: `Send siang.co/${artist.slug} to your Instagram, LINE or Facebook, or print its QR code.`,
              next: "Next",
              skip: "Skip the tour",
            },
            {
              target: '[data-tour="upload"]',
              title: "Add your first work",
              text: "A picture and a minute of your voice make one work. Add as many as you like, one at a time. This tile is always here.",
              next: "Upload now",
              skip: "Later",
              onNext: () => {
                setTab("art");
                setSheet("compose");
              },
            },
          ]}
        />
      )}

      {sheet === "profile" && (
        <Sheet title="Edit your details" onClose={() => setSheet(null)}>
          <EditProfileForm artist={artist} contacts={contacts} onDone={() => setSheet(null)} onEditLinks={() => setSheet("links")} />
        </Sheet>
      )}
      {sheet === "links" && (
        <Sheet title="Links" onClose={() => setSheet(null)}>
          <LinksEditor artistId={artist.id} rows={linkRows} setRows={setLinkRows} />
        </Sheet>
      )}
      {sheet === "compose" && <WorkComposer artistSlug={artist.slug} shows={EXHIBITIONS_OPEN ? showRows : collections} onClose={() => setSheet(null)} onSubmit={addWork} />}
      {sheet && typeof sheet === "object" && "newShow" in sheet && (
        <Sheet title={sheet.newShow === "exhibition" ? "New exhibition" : "New collection"} onClose={() => setSheet(null)}>
          <ShowForm mode={sheet.newShow} works={rows} existing={null} onSubmit={(fields) => saveShow(fields, null)} />
        </Sheet>
      )}
      {sheet && typeof sheet === "object" && "show" in sheet && (
        <Sheet title={sheet.show.venue ? "Edit exhibition" : "Edit collection"} onClose={() => setSheet(null)}>
          <ShowForm
            mode={sheet.show.venue ? "exhibition" : "collection"}
            works={rows}
            existing={sheet.show}
            onSubmit={(fields) => saveShow(fields, sheet.show)}
            onDelete={() => deleteShow(sheet.show.id)}
            pageHref={`/${artist.slug}/shows/${sheet.show.slug}`}
          />
        </Sheet>
      )}
      {sheet && typeof sheet === "object" && "work" in sheet && (
        <WorkSheet
          work={sheet.work}
          onClose={() => setSheet(null)}
          onUpdate={updateWork}
          onDelete={deleteWork}
          onShowQR={() => setSheet({ qr: sheet.work })}
          onImages={setWorkImages}
        />
      )}
      {sheet && typeof sheet === "object" && "qr" in sheet && <ShareSheet info={workShare(sheet.qr)} onClose={() => setSheet(null)} />}
    </main>
  );
}

function ShowCoverButton({ show, onChange }: { show: StudioExhibition; onChange: (id: string, cover_url: string) => void }) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      onChange(show.id, await uploadFile(supabase, file));
    } finally {
      setUploading(false);
    }
  }

  return (
    <label className={st.showCover} aria-label="Change the cover photo">
      {uploading ? <Spinner size={16} label="Uploading cover" /> : CAMERA_ICON}
      <input type="file" accept="image/*" hidden onChange={handleCover} />
    </label>
  );
}

function EditProfileForm({
  artist,
  contacts,
  onDone,
  onEditLinks,
}: {
  artist: StudioArtist;
  contacts: StudioContact[];
  onDone: () => void;
  onEditLinks: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState(artist.name);
  const [slug, setSlug] = useState(artist.slug);
  const [discipline, setDiscipline] = useState(artist.discipline ?? "");
  const [place, setPlace] = useState<Place>({ based: artist.based ?? "", country: artist.country ?? "", lat: artist.lat, lng: artist.lng });
  const [bio, setBio] = useState(artist.bio ?? "");
  const [statement, setStatement] = useState(artist.statement ?? "");
  const [shop, setShop] = useState(artist.shop_url ?? "");
  const [contact, setContact] = useState<ContactInputs>({
    ig: contactValue(contacts, "ig") ? "@" + contactValue(contacts, "ig") : "",
    line: contactValue(contacts, "line"),
    email: contactValue(contacts, "email"),
    web: contactValue(contacts, "web"),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slugChanged = slug !== artist.slug;
  const slugUsed = !!artist.slug_changed_at; // a handle can be changed once

  async function save() {
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Add your name. It is the first thing visitors read.");
      return;
    }
    const problem = slugChanged ? slugProblem(slug) : null;
    if (problem) {
      setError(`Your link: ${problem}`);
      return;
    }
    if (!discipline) {
      setError("Choose your main art type.");
      return;
    }
    if (!place.based.trim()) {
      setError("Add the city you work in.");
      return;
    }
    const contactPairs = parseContacts(contact);
    if (typeof contactPairs === "string") {
      setError(contactPairs);
      return;
    }
    const shopUrl = shop.trim() ? normalizeUrl(shop) : null;
    if (shop.trim() && !shopUrl) {
      setError("Check the shop link. It should look like example.com/shop.");
      return;
    }

    setBusy(true);
    const base = {
      name: trimmedName,
      slug,
      discipline,
      based: place.based.trim() || null,
      country: place.country.trim() || null,
      lat: place.lat,
      lng: place.lng,
      bio: bio.trim() || null,
    };
    // The newer columns are only sent when they change, so saving still works
    // on a database that doesn't have them yet.
    const extra: Record<string, string | null> = {};
    if (statement.trim() !== (artist.statement ?? "")) extra.statement = statement.trim() || null;
    if (shopUrl !== (artist.shop_url ?? null)) extra.shop_url = shopUrl;
    if (slugChanged) {
      extra.previous_slug = artist.slug;
      extra.slug_changed_at = new Date().toISOString();
    }
    const { error: updateError } = await supabase.from("artists").update({ ...base, ...extra }).eq("id", artist.id);
    if (updateError) {
      setBusy(false);
      setError(isMissingColumn(updateError) ? NEEDS_MIGRATION : slugTakenMessage(updateError.message, updateError.code));
      return;
    }

    const toUpsert = contactPairs.filter(([, v]) => v).map(([kind, value]) => ({ artist_id: artist.id, kind, value }));
    const toDelete = contactPairs.filter(([, v]) => !v).map(([kind]) => kind);
    if (toUpsert.length) await supabase.from("artist_contacts").upsert(toUpsert, { onConflict: "artist_id,kind" });
    if (toDelete.length) await supabase.from("artist_contacts").delete().eq("artist_id", artist.id).in("kind", toDelete);

    setBusy(false);
    router.refresh();
    onDone();
  }

  return (
    <div style={styles.form}>
      <Field label="Name">
        <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      {slugUsed ? (
        <p style={styles.hint}>Your link is siang.co/{artist.slug}. It has been changed once and can&apos;t be changed again.</p>
      ) : (
        <>
          <SlugField value={slug} onChange={setSlug} />
          <p style={{ ...styles.hint, marginTop: -6, color: slugChanged ? "#ff8a8a" : undefined }}>
            {slugChanged
              ? `You can change your link once. siang.co/${artist.slug} and the QR codes you printed will keep working and lead to the new one.`
              : "Changing your name doesn't change your link. The link itself can be changed once."}
          </p>
        </>
      )}
      <ArtTypeField value={discipline} onChange={setDiscipline} />
      <PlacePicker value={place} onChange={setPlace} />
      <label style={styles.label}>
        <span style={{ display: "flex", justifyContent: "space-between" }}>
          Short bio <em style={{ fontStyle: "normal", opacity: 0.6 }}>{bio.length}/{BIO_LIMIT}</em>
        </span>
        <textarea style={styles.textarea} rows={3} maxLength={BIO_LIMIT} value={bio} onChange={(e) => setBio(e.target.value.slice(0, BIO_LIMIT))} />
      </label>
      <Field label="Full statement, optional">
        <textarea style={styles.textarea} rows={5} maxLength={4000} value={statement} onChange={(e) => setStatement(e.target.value)} />
      </Field>
      <Field label="Shop link, optional">
        <input style={styles.input} inputMode="url" autoCapitalize="none" placeholder="example.com/shop" value={shop} onChange={(e) => setShop(e.target.value)} />
      </Field>
      <ContactFields value={contact} onChange={setContact} />
      <button style={{ ...styles.rowBtn, alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6 }} onClick={onEditLinks} type="button">
        {LINK_ICON} Edit links
      </button>
      {error && <p style={styles.error}>{error}</p>}
      <button style={styles.submit} onClick={save} disabled={busy} type="button">
        {busy ? (
          <>
            <Spinner /> Saving…
          </>
        ) : (
          "Save"
        )}
      </button>
    </div>
  );
}

// Links shown as buttons on the artist's public page, Linktree style.
function normalizeUrl(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function LinksEditor({
  artistId,
  rows,
  setRows,
}: {
  artistId: string;
  rows: StudioLink[];
  setRows: React.Dispatch<React.SetStateAction<StudioLink[]>>;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setError(null);
    const l = label.trim();
    const u = normalizeUrl(url);
    if (!l) {
      setError("Give the link a name, like “Shop” or “Portfolio”.");
      return;
    }
    if (!u) {
      setError("Check the link. It should look like example.com or https://example.com.");
      return;
    }
    setBusy(true);
    const sort_order = rows.length ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0;
    const { data, error } = await supabase
      .from("artist_links")
      .insert({ artist_id: artistId, label: l, url: u, sort_order })
      .select("id, label, url, sort_order")
      .single<StudioLink>();
    setBusy(false);
    if (error || !data) {
      setError(error?.message ?? "Could not add the link.");
      return;
    }
    setRows((r) => [...r, data]);
    setLabel("");
    setUrl("");
    router.refresh();
  }

  async function remove(id: string) {
    setError(null);
    const { error } = await supabase.from("artist_links").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    setRows((r) => r.filter((x) => x.id !== id));
    router.refresh();
  }

  async function move(index: number, dir: -1 | 1) {
    const other = index + dir;
    if (other < 0 || other >= rows.length) return;
    // Swap the two rows, then renumber everything so equal sort_orders can't tie.
    const next = [...rows];
    [next[index], next[other]] = [next[other], next[index]];
    const renumbered = next.map((r, i) => ({ ...r, sort_order: i }));
    setRows(renumbered);
    setError(null);
    const results = await Promise.all(
      renumbered.map((r) => supabase.from("artist_links").update({ sort_order: r.sort_order }).eq("id", r.id))
    );
    const failed = results.find((res) => res.error);
    if (failed?.error) setError(failed.error.message);
    router.refresh();
  }

  return (
    <div>
      <p style={{ ...styles.hint, marginTop: -8 }}>Buttons on your page, like a Linktree: shop, portfolio, YouTube, anything.</p>

      {rows.length > 0 && (
        <div style={styles.linkList}>
          {rows.map((r, i) => (
            <div key={r.id} style={styles.linkRow}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.workTitle}>{r.label}</div>
                <div style={{ ...styles.workMeta, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.url}</div>
              </div>
              <button
                style={{ ...styles.rowBtn, ...styles.orderBtn, opacity: i === 0 ? 0.3 : 1 }}
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={`Move ${r.label} up`}
                type="button"
              >
                {UP_ICON}
              </button>
              <button
                style={{ ...styles.rowBtn, ...styles.orderBtn, opacity: i === rows.length - 1 ? 0.3 : 1 }}
                onClick={() => move(i, 1)}
                disabled={i === rows.length - 1}
                aria-label={`Move ${r.label} down`}
                type="button"
              >
                {DOWN_ICON}
              </button>
              <button style={{ ...styles.rowBtnDanger, ...styles.orderBtn }} onClick={() => remove(r.id)} aria-label={`Delete ${r.label}`} type="button">
                {DELETE_ICON}
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ ...styles.form, marginTop: 16 }}>
        <div style={styles.linkFields}>
          <Field label="Name">
            <input style={{ ...styles.input, minWidth: 0 }} placeholder="Shop" value={label} maxLength={60} onChange={(e) => setLabel(e.target.value)} />
          </Field>
          <Field label="Link">
            <input
              style={{ ...styles.input, minWidth: 0 }}
              placeholder="example.com"
              value={url}
              inputMode="url"
              autoCapitalize="none"
              spellCheck={false}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") add();
              }}
            />
          </Field>
        </div>
        <button style={styles.saveSm} onClick={add} disabled={busy} type="button">
          {busy ? <Spinner size={14} /> : ADD_ICON} Add link
        </button>
      </div>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

function readAudioDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      const d = Number.isFinite(audio.duration) ? Math.round(audio.duration) : null;
      URL.revokeObjectURL(url);
      resolve(d);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    audio.src = url;
  });
}

function WorkComposer({
  artistSlug,
  shows,
  onClose,
  onSubmit,
  intro,
  heading = "New work",
  closeLabel,
}: {
  artistSlug: string;
  shows: StudioExhibition[];
  intro?: React.ReactNode; // shown above the form, e.g. the onboarding steps
  heading?: string;
  closeLabel?: string; // a word ("Skip") instead of the close glyph
  onClose: () => void;
  onSubmit: (fields: {
    title: string;
    coverUrl: string;
    audioUrl: string | null;
    durationSec: number | null;
    description: string;
    exhibitionId: string | null;
    details: WorkDetails;
  }) => Promise<{ error?: string }>;
}) {
  const supabase = createClient();
  const coverRef = useRef<HTMLInputElement>(null);
  const soundRef = useRef<HTMLInputElement>(null);
  const [details, setDetails] = useState<DetailInputs>({ ...EMPTY_DETAILS, year: String(new Date().getFullYear()) });

  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [soundName, setSoundName] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [soundUploading, setSoundUploading] = useState(false);
  const [addText, setAddText] = useState(false);
  const [description, setDescription] = useState("");
  const [exhibitionId, setExhibitionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      setCoverUrl(await uploadFile(supabase, file));
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleSound(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSoundName(file.name);
    setSoundUploading(true);
    setError(null);
    try {
      const [url, duration] = await Promise.all([uploadFile(supabase, file), readAudioDuration(file)]);
      setAudioUrl(url);
      setDurationSec(duration);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that sound file.");
      setSoundName(null);
    } finally {
      setSoundUploading(false);
    }
  }

  async function publish() {
    setError(null);
    const t = title.trim();
    if (!t) {
      setError("Add a title to publish this work.");
      return;
    }
    if (!coverUrl) {
      setError("Add a cover image. It is how people find the work.");
      return;
    }
    const parsed = parseDetails(details);
    if (typeof parsed === "string") {
      setError(parsed);
      return;
    }
    if (!audioUrl && !description.trim()) {
      setError("Add a sound, or write something about the work.");
      return;
    }
    setBusy(true);
    const result = await onSubmit({ title: t, coverUrl, audioUrl, durationSec, description: description.trim(), exhibitionId, details: parsed });
    setBusy(false);
    if (result.error) setError(result.error);
  }

  function fillSample() {
    setTitle("น้ำนิ่ง (ตัวอย่าง)");
    setDetails((d) => ({ ...d, titleEn: "Still Water (sample)", medium: "Celadon", size: "30 x 30 x 12 cm" }));
    setAddText(true);
    setDescription("Thrown celadon, recorded inside the kiln while it fires.");
  }

  const linkSlug = slugify(details.titleEn || title);

  return (
    <>
      <div style={styles.backdrop} onClick={onClose} />
      <div style={styles.composer} role="dialog" aria-label="New work">
        <div style={styles.composerTop}>
          {closeLabel ? (
            <button style={styles.linkish} onClick={fillSample} type="button">
              Fill a sample
            </button>
          ) : (
            <button style={styles.ghostIconBtn} onClick={onClose} aria-label="Close" type="button">
              {CLOSE_GLYPH}
            </button>
          )}
          <b style={{ fontSize: 14, fontWeight: 700 }}>{heading}</b>
          {closeLabel ? (
            <button style={ob.skip} onClick={onClose} type="button">
              {closeLabel}
            </button>
          ) : (
            <button style={styles.linkish} onClick={fillSample} type="button">
              Fill a sample
            </button>
          )}
        </div>
        <div style={styles.composerBody}>
          {intro}
          <div style={styles.composerHead}>
            <button
              type="button"
              style={{ ...styles.coverUpload, backgroundImage: coverUrl ? `url(${coverUrl})` : undefined }}
              onClick={() => coverRef.current?.click()}
              aria-label="Add a cover image"
            >
              {!coverUrl &&
                (coverUploading ? (
                  <Spinner size={22} label="Uploading cover" />
                ) : (
                  <>
                    + Add cover
                    <br />
                    <span style={{ opacity: 0.7, fontSize: 11 }}>required</span>
                  </>
                ))}
            </button>
            <input ref={coverRef} type="file" accept="image/*" hidden onChange={handleCover} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <input style={styles.titleInput} placeholder="ชื่องาน / Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <input
                style={{ ...styles.titleInput, marginBottom: 4 }}
                placeholder="Title in the other language (optional)"
                value={details.titleEn}
                maxLength={200}
                onChange={(e) => setDetails({ ...details, titleEn: e.target.value })}
              />
              {linkSlug && <p style={styles.composerHint}>Link: siang.co/{artistSlug}/{linkSlug}</p>}
            </div>
          </div>

          <div style={styles.composerSecHead}>
            <h2 style={styles.h2}>Details</h2>
            <span style={styles.composerSecLabel}>Shown under the work</span>
          </div>
          <DetailFields value={details} onChange={setDetails} />

          <div style={styles.composerSecHead}>
            <h2 style={styles.h2}>Content</h2>
            <span style={styles.composerSecLabel}>A sound, a text, or both</span>
          </div>

          <div style={styles.soundHead}>
            <span style={styles.soundHeadLabel}>
              {MUSIC_ICON} Sound <span style={styles.soundHeadSub}>One per work: your voice, or the sound of the work</span>
            </span>
          </div>

          {!soundName ? (
            <button type="button" style={styles.soundBox} onClick={() => soundRef.current?.click()}>
              {ADD_ICON}
              <span>Choose a sound file</span>
            </button>
          ) : (
            <button type="button" style={styles.soundBoxFilled} onClick={() => soundRef.current?.click()}>
              {MUSIC_ICON}
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {soundUploading ? (
                  <>
                    <Spinner size={14} /> Uploading {soundName}…
                  </>
                ) : (
                  soundName
                )}
              </span>
              {durationSec != null && <span style={{ color: "rgba(255,255,255,.5)", fontSize: 12.5 }}>{clock(durationSec)}</span>}
            </button>
          )}
          <input ref={soundRef} type="file" accept="audio/*" hidden onChange={handleSound} />

          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <span style={styles.chipSmActive}>{MUSIC_ICON} Sound</span>
            <button type="button" style={addText ? styles.chipSmActive : styles.chipSmInactive} onClick={() => setAddText((a) => !a)}>
              {TEXT_ICON} Text
            </button>
            <span style={styles.chipSmDisabled} title="Add more images after publishing, from the work's edit screen">
              {IMAGE_ICON} More images after publishing
            </span>
            <span style={styles.chipSmDisabled} title="Video isn't supported yet">
              {VIDEO_ICON} Video
            </span>
          </div>

          {addText && (
            <textarea
              style={{ ...styles.textarea, width: "100%", marginTop: 10, boxSizing: "border-box" }}
              rows={4}
              placeholder="The story of this work"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          )}

          {shows.length > 0 && (
            <>
              <div style={styles.composerSecHead}>
                <h2 style={styles.h2}>Exhibition or collection</h2>
                <span style={styles.composerSecLabel}>Optional</span>
              </div>
              <div style={styles.chipRow}>
                <button type="button" style={exhibitionId === null ? styles.chipActive : styles.chipInactive} onClick={() => setExhibitionId(null)}>
                  None
                </button>
                {shows.map((sh) => (
                  <button
                    key={sh.id}
                    type="button"
                    style={exhibitionId === sh.id ? styles.chipActive : styles.chipInactive}
                    onClick={() => setExhibitionId(sh.id)}
                  >
                    {sh.title}
                  </button>
                ))}
              </div>
            </>
          )}

          {error && <p style={styles.error}>{error}</p>}
        </div>
        <div style={styles.composerBar}>
          <button style={{ ...styles.submit, width: "100%" }} onClick={publish} disabled={busy || soundUploading || coverUploading} type="button">
            {busy ? (
              <>
                <Spinner /> Publishing…
              </>
            ) : soundUploading ? (
              "Waiting for the sound to upload…"
            ) : (
              "Publish"
            )}
          </button>
          <p style={styles.composerHint}>Publishing gives the work its page, a six-digit code and a label to print.</p>
        </div>
      </div>
    </>
  );
}

const detailInputsOf = (work: StudioArtwork): DetailInputs => ({
  titleEn: work.title_en ?? "",
  year: work.year ? String(work.year) : "",
  medium: work.medium ?? "",
  size: work.size_text ?? "",
  height: work.height_cm ? String(work.height_cm) : "",
  width: work.width_cm ? String(work.width_cm) : "",
  depth: work.depth_cm ? String(work.depth_cm) : "",
  materials: work.materials ?? "",
  edition: work.edition ?? "",
  credits: work.credits ?? "",
  price: work.price ?? "",
  availability: work.availability ?? "",
  location: work.location_now ?? "",
});

// Opened by tapping a work's tile: change its cover, sound and details, add
// more pictures, print its label, take it down or put it back.
function WorkSheet({
  work,
  onClose,
  onUpdate,
  onDelete,
  onShowQR,
  onImages,
}: {
  work: StudioArtwork;
  onClose: () => void;
  onUpdate: (id: string, fields: WorkUpdate) => Promise<string | null>;
  onDelete: (id: string) => Promise<string | null>;
  onShowQR: () => void;
  onImages: (id: string, blocks: StudioBlock[]) => void;
}) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const soundRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const before = detailInputsOf(work);
  const [details, setDetails] = useState(before);
  const [coverUrl, setCoverUrl] = useState(work.cover_url);
  const [title, setTitle] = useState(work.title);
  const [description, setDescription] = useState(work.description ?? "");
  const [sound, setSound] = useState({ url: work.audio_url, sec: work.duration_sec });
  const [images, setImages] = useState<StudioBlock[]>((work.artwork_blocks ?? []).filter((b) => b.type === "image"));
  const [status, setStatus] = useState(work.status ?? "published");
  const [uploading, setUploading] = useState<null | "cover" | "sound" | "image">(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading("cover");
    setError(null);
    try {
      const url = await uploadFile(supabase, file);
      const err = await onUpdate(work.id, { cover_url: url });
      if (err) setError(err);
      else setCoverUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  }

  // Replaces the work's sound, or adds one to a work that had none.
  async function handleSound(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading("sound");
    setError(null);
    try {
      const [url, sec] = await Promise.all([uploadFile(supabase, file), readAudioDuration(file)]);
      const err = await onUpdate(work.id, { audio_url: url, duration_sec: sec });
      if (err) setError(err);
      else setSound({ url, sec });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload that sound file.");
    } finally {
      setUploading(null);
    }
  }

  async function removeSound() {
    if (!description.trim()) {
      setError("A work needs a sound or a text. Write something about it first, then remove the sound.");
      return;
    }
    const err = await onUpdate(work.id, { audio_url: null, duration_sec: null });
    if (err) setError(err);
    else setSound({ url: null, sec: null });
  }

  async function addImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading("image");
    setError(null);
    try {
      const media_url = await uploadFile(supabase, file);
      const sort_order = images.length ? Math.max(...images.map((b) => b.sort_order)) + 1 : 0;
      const { data, error } = await supabase
        .from("artwork_blocks")
        .insert({ artwork_id: work.id, type: "image", media_url, sort_order })
        .select("id, type, media_url, sort_order")
        .single<StudioBlock>();
      if (error || !data) throw new Error(error?.message ?? "Could not add the image.");
      const next = [...images, data];
      setImages(next);
      onImages(work.id, next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the image.");
    } finally {
      setUploading(null);
    }
  }

  async function removeImage(id: string) {
    const { error } = await supabase.from("artwork_blocks").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    const next = images.filter((b) => b.id !== id);
    setImages(next);
    onImages(work.id, next);
  }

  async function save() {
    setError(null);
    const t = title.trim();
    if (!t) {
      setError("A work needs a title.");
      return;
    }
    if (!sound.url && !description.trim()) {
      setError("A work needs a sound or a text.");
      return;
    }
    const parsed = parseDetails(details, false);
    if (typeof parsed === "string") {
      setError(parsed);
      return;
    }
    // Only the details that changed are sent, so an untouched work still
    // saves on a database that doesn't have the newer columns yet.
    const was = parseDetails(before, false) as WorkDetails;
    const changed = Object.fromEntries(
      (Object.keys(parsed) as (keyof WorkDetails)[]).filter((k) => parsed[k] !== was[k]).map((k) => [k, parsed[k]])
    ) as Partial<WorkDetails>;
    setBusy(true);
    const err = await onUpdate(work.id, { title: t, description: description.trim() || null, ...changed });
    setBusy(false);
    if (err) setError(err);
    else onClose();
  }

  async function toggleStatus() {
    const next = status === "published" ? "taken_down" : "published";
    setBusy(true);
    const err = await onUpdate(work.id, { status: next });
    setBusy(false);
    if (err) setError(err);
    else setStatus(next);
  }

  async function remove() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setBusy(true);
    const err = await onDelete(work.id);
    setBusy(false);
    if (err) setError(err);
  }

  return (
    <Sheet title="Edit work" onClose={onClose}>
      <div style={{ ...styles.form, marginTop: 0 }}>
        {status !== "published" && (
          <p style={styles.notice}>
            {status === "removed"
              ? "The Siang team removed this work. Its link shows only the title."
              : "This work is taken down. Its link, QR and code show only the title and a link to your page."}
          </p>
        )}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <button
            type="button"
            style={{ ...styles.coverUpload, backgroundImage: coverUrl ? `url("${coverUrl}")` : undefined }}
            onClick={() => fileRef.current?.click()}
            disabled={uploading === "cover"}
            aria-label="Change the cover image"
          >
            {uploading === "cover" ? <Spinner size={22} label="Uploading cover" /> : !coverUrl && <>{CAMERA_ICON}<br />Add cover</>}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleCover} />
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            <Field label="Title">
              <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Title in the other language">
              <input style={styles.input} value={details.titleEn} maxLength={200} placeholder="optional" onChange={(e) => setDetails({ ...details, titleEn: e.target.value })} />
            </Field>
          </div>
        </div>

        <div>
          <span style={{ ...styles.label, display: "block", marginBottom: 6 }}>Sound</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button style={{ ...styles.rowBtn, display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => soundRef.current?.click()} disabled={uploading === "sound"} type="button">
              {uploading === "sound" ? <Spinner size={14} /> : MUSIC_ICON} {sound.url ? `Replace sound${sound.sec ? ` (${clock(sound.sec)})` : ""}` : "Add a sound"}
            </button>
            {sound.url && (
              <button style={styles.rowBtn} onClick={removeSound} type="button">
                Remove sound
              </button>
            )}
          </div>
          <input ref={soundRef} type="file" accept="audio/*" hidden onChange={handleSound} />
        </div>

        <DetailFields value={details} onChange={setDetails} />
        <Field label="Story">
          <textarea style={styles.textarea} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>

        <div>
          <span style={{ ...styles.label, display: "block", marginBottom: 6 }}>More images</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {images.map((b) => (
              <span key={b.id} style={{ ...styles.thumb, width: 64, height: 64, position: "relative", backgroundImage: `url("${b.media_url}")`, cursor: "default" }}>
                <button style={styles.thumbRemove} onClick={() => removeImage(b.id)} aria-label="Remove this image" type="button">
                  {CLOSE_GLYPH}
                </button>
              </span>
            ))}
            <button style={{ ...styles.thumb, width: 64, height: 64, borderStyle: "dashed" }} onClick={() => imageRef.current?.click()} disabled={uploading === "image"} aria-label="Add an image" type="button">
              {uploading === "image" ? <Spinner size={18} label="Uploading image" /> : ADD_ICON}
            </button>
          </div>
          <input ref={imageRef} type="file" accept="image/*" hidden onChange={addImage} />
        </div>

        <p style={styles.hint}>
          Work code {work.code.slice(0, 3)} {work.code.slice(3)} · {(work.view_count ?? 0).toLocaleString()} views · {work.listen_count.toLocaleString()} listens
        </p>
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.submit} onClick={save} disabled={busy || uploading !== null} type="button">
          {busy && !confirmDelete ? (
            <>
              <Spinner /> Saving…
            </>
          ) : (
            "Save"
          )}
        </button>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={{ ...styles.rowBtn, display: "inline-flex", alignItems: "center", gap: 6 }} onClick={onShowQR} type="button">
            {QR_GLYPH} Label and QR to print
          </button>
          {status !== "removed" && (
            <button style={styles.rowBtn} onClick={toggleStatus} disabled={busy} type="button">
              {status === "published" ? "Take down" : "Put back online"}
            </button>
          )}
          {/* Deleting breaks the work's printed QR and code for good, so it is only offered once the work is already down. */}
          {status !== "published" && (
            <button style={{ ...styles.rowBtnDanger, display: "inline-flex", alignItems: "center", gap: 6 }} onClick={remove} disabled={busy} type="button">
              {DELETE_ICON} {confirmDelete ? "Tap again to delete for good" : "Delete for good"}
            </button>
          )}
        </div>
      </div>
    </Sheet>
  );
}

type DetailInputs = {
  titleEn: string;
  year: string;
  medium: string;
  size: string;
  height: string;
  width: string;
  depth: string;
  materials: string;
  edition: string;
  credits: string;
  price: string;
  availability: string;
  location: string;
};
const EMPTY_DETAILS: DetailInputs = {
  titleEn: "",
  year: "",
  medium: "",
  size: "",
  height: "",
  width: "",
  depth: "",
  materials: "",
  edition: "",
  credits: "",
  price: "",
  availability: "",
  location: "",
};

// Turns what was typed into a work's details, or says what is wrong with it.
// A new work needs its year, medium and size (launch checklist); a work made
// before those fields existed can still be saved without them.
function parseDetails(d: DetailInputs, required = true): WorkDetails | string {
  const year = d.year.trim() ? Number(d.year) : null;
  if (year != null && !(Number.isInteger(year) && year >= 1000 && year <= 2100)) return "Write the year as four digits, like 2025.";
  if (required && !year) return "Add the year the work was made.";
  const text = (v: string) => v.trim() || null;
  if (required && !text(d.medium)) return "Add the medium, like Oil on canvas.";
  if (required && !text(d.size)) return "Add the size, like 40 x 60 cm. Write “variable” if it has no fixed size.";
  const cm = (v: string) => (v.trim() ? Number(v.replace(",", ".")) : null);
  const [height_cm, width_cm, depth_cm] = [cm(d.height), cm(d.width), cm(d.depth)];
  if ([height_cm, width_cm, depth_cm].some((n) => n != null && !(n > 0))) return "Write the measurements in centimetres, as numbers.";
  if ((height_cm == null) !== (width_cm == null)) return "Give both the height and the width, or leave both empty.";
  return {
    title_en: text(d.titleEn),
    year,
    medium: text(d.medium),
    size_text: text(d.size),
    height_cm,
    width_cm,
    depth_cm,
    materials: text(d.materials),
    edition: text(d.edition),
    credits: text(d.credits),
    price: text(d.price),
    availability: (d.availability || null) as WorkDetails["availability"],
    location_now: text(d.location),
  };
}

function DetailFields({ value, onChange }: { value: DetailInputs; onChange: (v: DetailInputs) => void }) {
  const set = (key: keyof DetailInputs) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ ...value, [key]: e.target.value });
  return (
    <>
      <div style={styles.linkFields}>
        <Field label="Year">
          <input style={styles.input} inputMode="numeric" maxLength={4} value={value.year} onChange={set("year")} />
        </Field>
        <Field label="Medium">
          <input style={styles.input} maxLength={120} placeholder="Oil on canvas" value={value.medium} onChange={set("medium")} />
        </Field>
      </div>
      <Field label="Size">
        <input style={styles.input} maxLength={120} placeholder="40 x 60 cm" value={value.size} onChange={set("size")} />
      </Field>

      <details className="disclosure" style={styles.more}>
        <summary style={styles.moreSummary}>
          More details, optional
          <span className="disclosureCaret">{CHEVRON_DOWN_SVG}</span>
        </summary>
        <div style={{ ...styles.form, marginTop: 12 }}>
          <div style={styles.row3}>
            <Field label="Height, cm">
              <input style={styles.input} inputMode="decimal" value={value.height} onChange={set("height")} />
            </Field>
            <Field label="Width, cm">
              <input style={styles.input} inputMode="decimal" value={value.width} onChange={set("width")} />
            </Field>
            <Field label="Depth, cm">
              <input style={styles.input} inputMode="decimal" value={value.depth} onChange={set("depth")} />
            </Field>
          </div>
          <p style={{ ...styles.hint, marginTop: -6 }}>Height and width as numbers draw the work next to a person, so people see its real size.</p>
          <Field label="Materials">
            <input style={styles.input} maxLength={300} value={value.materials} onChange={set("materials")} />
          </Field>
          <div style={styles.row}>
            <Field label="Edition">
              <input style={styles.input} maxLength={120} placeholder="2 of 5" value={value.edition} onChange={set("edition")} />
            </Field>
            <Field label="Price">
              <input style={styles.input} maxLength={80} placeholder="12,000 THB, or on request" value={value.price} onChange={set("price")} />
            </Field>
          </div>
          <label style={styles.label}>
            Availability
            <select style={styles.select} value={value.availability} onChange={set("availability")}>
              <option value="">Not shown</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="not_for_sale">Not for sale</option>
            </select>
          </label>
          <Field label="Where it is now">
            <input style={styles.input} maxLength={160} placeholder="Venue and city, or Studio" value={value.location} onChange={set("location")} />
          </Field>
          <Field label="Credits">
            <input style={styles.input} maxLength={500} placeholder="Photographer, fabricator, collaborators" value={value.credits} onChange={set("credits")} />
          </Field>
        </div>
      </details>
    </>
  );
}

// Makes or edits an exhibition (a place and dates) or a collection (the
// artist's own works pulled together, with no place).
function ShowForm({
  mode,
  works,
  existing,
  onSubmit,
  onDelete,
  pageHref,
}: {
  mode: "exhibition" | "collection";
  works: StudioArtwork[];
  existing: StudioExhibition | null;
  onSubmit: (fields: ShowFields) => Promise<{ error?: string }>;
  onDelete?: () => Promise<string | null>;
  pageHref?: string;
}) {
  const isExhibition = mode === "exhibition";
  const [title, setTitle] = useState(existing?.title ?? "");
  // Follows the title's English part until edited; a Thai-only title needs one typed.
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [venue, setVenue] = useState(existing?.venue ?? "");
  const [city, setCity] = useState(existing?.city ?? "");
  const [startsOn, setStartsOn] = useState(existing?.starts_on ?? "");
  const [endsOn, setEndsOn] = useState(existing?.ends_on ?? "");
  const [hours, setHours] = useState(existing?.hours ?? "");
  const [entry, setEntry] = useState(existing?.entry ?? "");
  const [kind, setKind] = useState<"solo" | "group">(existing?.kind ?? "solo");
  const [checked, setChecked] = useState<Set<string>>(new Set(existing?.exhibition_artworks.map((a) => a.artwork_id)));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function toggle(id: string) {
    setChecked((s) => {
      const next = new Set(s);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const t = title.trim();
    const v = venue.trim();
    if (!t) {
      setError("Add a title.");
      return;
    }
    if (isExhibition && !v) {
      setError("Add where it is shown, so visitors can find it.");
      return;
    }
    if (!existing && (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 60)) {
      setError("Give it a link in English letters, numbers and dashes, like still-water.");
      return;
    }
    if (startsOn && endsOn && endsOn < startsOn) {
      setError("The last day is before the first day.");
      return;
    }
    // The year comes from the dates; without dates an edited show keeps the one it had.
    const year = +(startsOn || endsOn).slice(0, 4) || existing?.year || new Date().getFullYear();
    setBusy(true);
    const result = await onSubmit({
      title: t,
      slug,
      kind,
      venue: isExhibition ? v : null,
      year: isExhibition ? year : existing?.year ?? null,
      city: isExhibition ? city.trim() || null : null,
      starts_on: isExhibition ? startsOn || null : null,
      ends_on: isExhibition ? endsOn || null : null,
      hours: isExhibition ? hours.trim() || null : null,
      entry: isExhibition ? entry.trim() || null : null,
      workIds: [...checked],
    });
    setBusy(false);
    if (result.error) setError(result.error);
  }

  async function remove() {
    if (!onDelete) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setBusy(true);
    const err = await onDelete();
    setBusy(false);
    if (err) setError(err);
  }

  return (
    <form style={{ ...styles.form, marginTop: 0, marginBottom: 18 }} onSubmit={submit}>
      <Field label="Title">
        <input
          style={styles.input}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!existing && !slugTouched) setSlug(slugify(e.target.value).slice(0, 60));
          }}
          placeholder={isExhibition ? "ชื่อนิทรรศการ" : "ชื่อคอลเลกชัน"}
        />
      </Field>
      {existing ? (
        pageHref && (
          <p style={styles.hint}>
            Its page:{" "}
            <a href={pageHref} target="_blank" rel="noopener noreferrer" style={{ color: "#fff" }}>
              siang.co{pageHref}
            </a>
          </p>
        )
      ) : (
        <label style={styles.label}>
          Link
          <span style={styles.slugWrap}>
            <span style={styles.slugPrefix}>…/shows/</span>
            <input
              style={styles.slugInput}
              value={slug}
              maxLength={60}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="still-water"
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
              }}
            />
          </span>
        </label>
      )}

      {isExhibition && (
        <>
          <div style={styles.linkFields}>
            <Field label="City">
              <input style={styles.input} value={city} maxLength={80} onChange={(e) => setCity(e.target.value)} placeholder="Bangkok" />
            </Field>
            <Field label="Place">
              <input style={styles.input} value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Gallery or venue" />
            </Field>
          </div>
          <div style={styles.row}>
            <Field label="First day">
              <input style={styles.input} type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} />
            </Field>
            <Field label="Last day">
              <input style={styles.input} type="date" value={endsOn} min={startsOn || undefined} onChange={(e) => setEndsOn(e.target.value)} />
            </Field>
          </div>
          <p style={{ ...styles.hint, marginTop: -6 }}>With dates, it shows under Now Showing until its last day.</p>
          <div style={styles.row}>
            <Field label="Hours">
              <input style={styles.input} value={hours} maxLength={160} onChange={(e) => setHours(e.target.value)} placeholder="Tue-Sun 10:00-18:00" />
            </Field>
            <Field label="Entry">
              <input style={styles.input} value={entry} maxLength={80} onChange={(e) => setEntry(e.target.value)} placeholder="Free" />
            </Field>
          </div>
          <div>
            <span style={{ ...styles.label, display: "block", marginBottom: 6 }}>Type</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" style={kind === "solo" ? styles.chipActive : styles.chipInactive} onClick={() => setKind("solo")} aria-pressed={kind === "solo"}>
                Solo
              </button>
              <button type="button" style={kind === "group" ? styles.chipActive : styles.chipInactive} onClick={() => setKind("group")} aria-pressed={kind === "group"}>
                Group
              </button>
            </div>
          </div>
        </>
      )}

      {works.length > 0 && (
        <div>
          <span style={{ ...styles.label, display: "block", marginBottom: 6 }}>Works in it</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {works.map((w) => (
              <label key={w.id} style={styles.checkRow}>
                <input type="checkbox" checked={checked.has(w.id)} onChange={() => toggle(w.id)} />
                <span>{w.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      {error && <p style={styles.error}>{error}</p>}
      <button style={styles.submit} type="submit" disabled={busy}>
        {busy && !confirmDelete ? (
          <>
            <Spinner size={14} /> Saving…
          </>
        ) : existing ? (
          "Save"
        ) : isExhibition ? (
          "Create exhibition"
        ) : (
          "Create collection"
        )}
      </button>
      {onDelete && (
        <button style={{ ...styles.rowBtnDanger, alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6 }} onClick={remove} disabled={busy} type="button">
          {DELETE_ICON} {confirmDelete ? "Tap again to delete" : isExhibition ? "Delete exhibition" : "Delete collection"}
        </button>
      )}
    </form>
  );
}

type Place = { based: string; country: string; lat: number | null; lng: number | null };
const OTHER = "__other";

// Country and city dropdowns (lib/places.ts). Picking a listed city also saves
// its coordinates, so the location pill on the artist's page opens the right
// spot in Google Maps. "Other…" falls back to typing.
function PlacePicker({ value, onChange }: { value: Place; onChange: (p: Place) => void }) {
  const country = findCountry(value.country);
  const [typingCountry, setTypingCountry] = useState(!!value.country && !country);
  const [typingCity, setTypingCity] = useState(!!value.based && !findCity(country, value.based));
  const cityListed = !!country && !typingCountry;

  return (
    <div style={styles.row}>
      <label style={styles.label}>
        Country
        <select
          style={styles.select}
          value={typingCountry ? OTHER : country?.name ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            setTypingCountry(v === OTHER);
            setTypingCity(false);
            onChange({ based: "", country: v === OTHER ? "" : v, lat: null, lng: null });
          }}
        >
          <option value="" disabled>
            Choose…
          </option>
          {COUNTRIES.map((co) => (
            <option key={co.name} value={co.name}>
              {co.name}
            </option>
          ))}
          <option value={OTHER}>Other…</option>
        </select>
        {typingCountry && (
          <input style={styles.input} placeholder="Country" value={value.country} onChange={(e) => onChange({ ...value, country: e.target.value })} />
        )}
      </label>
      <label style={styles.label}>
        City
        {cityListed ? (
          <select
            style={styles.select}
            value={typingCity ? OTHER : findCity(country, value.based)?.name ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === OTHER) {
                setTypingCity(true);
                onChange({ ...value, based: "", lat: null, lng: null });
                return;
              }
              setTypingCity(false);
              const city = findCity(country, v);
              onChange({ ...value, based: v, lat: city?.lat ?? null, lng: city?.lng ?? null });
            }}
          >
            <option value="" disabled>
              Choose…
            </option>
            {country!.cities.map((ci) => (
              <option key={ci.name} value={ci.name}>
                {ci.name}
              </option>
            ))}
            <option value={OTHER}>Other…</option>
          </select>
        ) : null}
        {(!cityListed || typingCity) && (
          <input
            style={styles.input}
            placeholder="City"
            value={value.based}
            onChange={(e) => onChange({ ...value, based: e.target.value, lat: null, lng: null })}
          />
        )}
      </label>
    </div>
  );
}

// "siang.co/[slug]" input: lowercases and swaps spaces for dashes as you type.
function SlugField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label style={styles.label}>
      Your link
      <span style={styles.slugWrap}>
        <span style={styles.slugPrefix}>siang.co/</span>
        <input
          style={styles.slugInput}
          value={value}
          maxLength={SLUG_MAX}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="your-name"
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
        />
      </span>
    </label>
  );
}

function slugTakenMessage(message: string, code?: string) {
  return code === "23505" || /duplicate key|artists_slug_key/i.test(message) ? "Someone already has that link. Try another." : message;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={styles.label}>
      {label}
      {children}
    </label>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div style={styles.backdrop} onClick={onClose} />
      <div style={styles.sheet} role="dialog" aria-label={title}>
        <div style={styles.handle} />
        <h2 style={styles.sheetTitle}>{title}</h2>
        {children}
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background: "#000",
    color: "#fff",
    padding: "20px 16px 60px",
  },
  header: {
    maxWidth: 520,
    margin: "0 auto 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRight: { display: "flex", alignItems: "center", gap: 10 },
  back: {
    display: "inline-grid",
    placeItems: "center",
    width: 36,
    height: 36,
    borderRadius: 999,
    background: "rgba(255,255,255,.08)",
    color: "#fff",
    textDecoration: "none",
  },
  email: { fontSize: 12.5, color: "rgba(255,255,255,.5)" },
  signOut: {
    height: 32,
    padding: "0 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.08)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  select: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    height: 42,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.06)",
    color: "#fff",
    padding: "0 10px",
    fontSize: 14.5,
    fontFamily: "inherit",
    colorScheme: "dark",
  },
  slugWrap: {
    display: "flex",
    alignItems: "center",
    height: 42,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.06)",
    overflow: "hidden",
  },
  slugPrefix: { padding: "0 2px 0 12px", fontSize: 14.5, fontWeight: 400, color: "rgba(255,255,255,.5)" },
  slugInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    border: 0,
    outline: "none",
    background: "none",
    color: "#fff",
    padding: "0 12px 0 0",
    fontSize: 14.5,
    fontFamily: "inherit",
  },
  darkCard: {
    background: "#1b1b1b",
    color: "#fff",
    borderRadius: 20,
    padding: "22px 18px",
    marginTop: 8,
    boxShadow: "0 20px 60px -20px rgba(0,0,0,.4)",
  },
  card: {
    maxWidth: 520,
    margin: "0 auto 40px",
    background: "transparent",
    padding: 0,
  },
  profileHead: { display: "flex", alignItems: "center", gap: 16 },
  avatarBtn: {
    width: 64,
    height: 64,
    borderRadius: 999,
    flex: "none",
    border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(255,255,255,.06) center/cover no-repeat",
    display: "grid",
    placeItems: "center",
    color: "rgba(255,255,255,.5)",
    cursor: "pointer",
  },
  h1: { fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em" },
  h2: { fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em" },
  sub: { fontSize: 13.5, color: "rgba(255,255,255,.55)", marginTop: 6 },
  hint: { fontSize: 12.5, color: "rgba(255,255,255,.45)", margin: 0 },
  fldH: { fontSize: 15, fontWeight: 800, letterSpacing: "-0.025em", marginTop: 8 },
  form: { display: "flex", flexDirection: "column", gap: 12, marginTop: 18 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, margin: "12px 0 8px" },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.7)" },
  input: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    height: 42,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.06)",
    color: "#fff",
    padding: "0 12px",
    fontSize: 14.5,
    fontFamily: "inherit",
  },
  textarea: {
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.06)",
    color: "#fff",
    padding: "10px 12px",
    fontSize: 14.5,
    fontFamily: "inherit",
    resize: "vertical",
  },
  error: { fontSize: 13, color: "#ff8a8a", margin: "10px 0 0" },
  submit: {
    height: 48,
    padding: "0 24px",
    borderRadius: 999,
    border: 0,
    background: "#fff",
    color: "#0f0f0f",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveSm: {
    alignSelf: "flex-start",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 36,
    padding: "0 16px",
    borderRadius: 999,
    border: 0,
    background: "#fff",
    color: "#0f0f0f",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
  },
  savedTag: { fontSize: 12.5, color: "#6FE3B6", fontWeight: 600 },
  worksHead: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  addBtn: {
    height: 34,
    padding: "0 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.08)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  workList: { display: "flex", flexDirection: "column", gap: 10, marginTop: 16 },
  workRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 4px",
    borderBottom: "1px solid rgba(255,255,255,.1)",
  },
  workRowEditing: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "12px 4px",
    borderBottom: "1px solid rgba(255,255,255,.1)",
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    flex: "none",
    border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(255,255,255,.06) center/cover no-repeat",
    display: "grid",
    placeItems: "center",
    color: "rgba(255,255,255,.5)",
    cursor: "pointer",
  },
  coverBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    flex: "none",
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.06) center/cover no-repeat",
    display: "grid",
    placeItems: "center",
    color: "rgba(255,255,255,.5)",
    cursor: "pointer",
  },
  workTitle: { display: "block", fontSize: 14.5, fontWeight: 600, color: "#fff" },
  workMeta: { display: "block", fontSize: 12.5, color: "rgba(255,255,255,.52)", marginTop: 2 },
  rowBtn: {
    height: 38,
    padding: "0 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.16)",
    background: "none",
    color: "#fff",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  rowBtnDanger: {
    height: 38,
    padding: "0 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,138,138,.4)",
    background: "none",
    color: "#ff8a8a",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  empty: { fontSize: 13.5, color: "rgba(255,255,255,.55)" },
  cardPreview: {
    position: "relative",
    marginTop: 14,
    width: "100%",
    maxWidth: 352,
    aspectRatio: "1.585 / 1",
    borderRadius: 15,
    overflow: "hidden",
    boxShadow: "0 14px 30px -12px rgba(0,0,0,.6)",
  },
  linkFields: { display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr)", gap: 12 },
  orderBtn: { width: 30, padding: 0, display: "grid", placeItems: "center", flex: "none" },
  linkList: { display: "flex", flexDirection: "column", gap: 8, marginTop: 14 },
  linkRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,.06)",
  },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: {
    fontSize: 12.5,
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,.08)",
    color: "#fff",
  },
  chipActive: {
    height: 36,
    padding: "0 16px",
    borderRadius: 999,
    border: "1px solid #fff",
    background: "#fff",
    color: "#000",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  chipInactive: {
    height: 36,
    padding: "0 16px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.16)",
    background: "none",
    color: "rgba(255,255,255,.7)",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  notice: { fontSize: 13.5, lineHeight: 1.45, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,.08)", margin: 0 },
  more: { border: "1px solid rgba(255,255,255,.16)", borderRadius: 12, padding: "2px 14px" },
  moreSummary: {
    minHeight: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    listStyle: "none",
  },
  thumbRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 999,
    border: 0,
    background: "#fff",
    color: "#0f0f0f",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  },
  checkRow: { display: "flex", alignItems: "center", gap: 10, minHeight: 40, fontSize: 14.5, color: "rgba(255,255,255,.85)" },

  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 60 },
  sheet: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    maxWidth: 520,
    margin: "0 auto",
    background: "#1b1b1b",
    color: "#fff",
    borderRadius: "20px 20px 0 0",
    padding: "10px 18px calc(24px + env(safe-area-inset-bottom))",
    maxHeight: "88vh",
    overflowY: "auto",
    zIndex: 61,
    boxShadow: "0 -20px 60px -20px rgba(0,0,0,.8)",
  },
  handle: { width: 36, height: 4, borderRadius: 999, background: "rgba(255,255,255,.22)", margin: "6px auto 16px" },
  sheetTitle: { fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16 },

  linkPreview: { fontSize: 20, fontWeight: 500, padding: "14px 16px", borderRadius: 14, background: "#1b1b1b", overflowWrap: "anywhere", margin: 0 },
  avatarPick: {
    width: 96,
    height: 96,
    borderRadius: 999,
    alignSelf: "center",
    border: "1px dashed rgba(255,255,255,.35)",
    background: "#1b1b1b center/cover no-repeat",
    color: "rgba(255,255,255,.66)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  },
  ghostWide: {
    height: 48,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.16)",
    background: "none",
    color: "#fff",
    fontSize: 15,
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    cursor: "pointer",
  },
  composer: {
    position: "fixed",
    inset: 0,
    maxWidth: 520,
    margin: "0 auto",
    background: "#000",
    color: "#fff",
    zIndex: 61,
    display: "flex",
    flexDirection: "column",
  },
  composerTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "calc(14px + env(safe-area-inset-top)) 14px 8px 18px",
  },
  ghostIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    border: 0,
    background: "rgba(255,255,255,.08)",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  },
  composerBody: { flex: 1, overflowY: "auto", padding: "8px 18px 24px" },
  composerHead: { display: "flex", gap: 14, alignItems: "flex-start" },
  coverUpload: {
    position: "relative",
    width: 92,
    aspectRatio: "210/297",
    borderRadius: 6,
    flex: "none",
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
    border: "1px dashed rgba(255,255,255,.32)",
    color: "rgba(255,255,255,.66)",
    fontSize: 12,
    lineHeight: 1.35,
    textAlign: "center",
    cursor: "pointer",
    background: "center/cover no-repeat",
  },
  titleInput: {
    height: 44,
    width: "100%",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.06)",
    color: "#fff",
    padding: "0 12px",
    fontSize: 15,
    fontFamily: "inherit",
    marginBottom: 8,
  },
  composerHint: { fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 6 },
  composerSecHead: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 28, marginBottom: 10 },
  composerSecLabel: { fontSize: 12.5, color: "rgba(255,255,255,.5)" },
  soundBox: {
    borderRadius: 12,
    border: "1px dashed rgba(255,255,255,.28)",
    padding: "18px",
    textAlign: "center",
    color: "rgba(255,255,255,.6)",
    fontSize: 13.5,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  soundBoxFilled: {
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.06)",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13.5,
    color: "#fff",
    cursor: "pointer",
  },
  composerBar: {
    padding: "14px 18px calc(14px + env(safe-area-inset-bottom))",
    borderTop: "1px solid rgba(255,255,255,.1)",
  },
  linkish: { background: "none", border: 0, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  soundHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  soundHeadLabel: { display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700 },
  soundHeadSub: { fontSize: 12, color: "rgba(255,255,255,.5)", fontWeight: 400, marginLeft: 4 },
  chipSmActive: {
    height: 32,
    padding: "0 14px",
    borderRadius: 999,
    border: "1px solid #fff",
    background: "#fff",
    color: "#000",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  chipSmInactive: {
    height: 32,
    padding: "0 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.08)",
    color: "#fff",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  chipSmDisabled: {
    height: 32,
    padding: "0 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.1)",
    background: "rgba(255,255,255,.04)",
    color: "rgba(255,255,255,.35)",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "default",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },

  pillRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 },
  pillDk: {
    height: 34,
    padding: "0 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.08)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    textDecoration: "none",
  },
  makeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 },
  make: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 22,
    minHeight: 116,
    padding: 16,
    borderRadius: 18,
    textAlign: "left",
    color: "#fff",
    background: "rgba(255,255,255,.08)",
    border: 0,
    cursor: "pointer",
  },
  makeTitle: { display: "block", fontSize: 16, fontWeight: 700, letterSpacing: "-0.025em" },
  makeSub: { display: "block", fontSize: 12.5, lineHeight: 1.35, opacity: 0.72, marginTop: 3 },

  qrBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.08)",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    flex: "none",
  },
  kebabWrap: { position: "relative", flex: "none" },
  kebabBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.08)",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  },
  kebabMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    background: "#1c1c1e",
    border: "1px solid rgba(255,255,255,.14)",
    borderRadius: 12,
    padding: 6,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 120,
    zIndex: 20,
    boxShadow: "0 12px 30px -10px rgba(0,0,0,.6)",
  },
  kebabItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: 34,
    padding: "0 10px",
    borderRadius: 8,
    border: 0,
    background: "none",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "left",
  },
  kebabItemDanger: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: 34,
    padding: "0 10px",
    borderRadius: 8,
    border: 0,
    background: "none",
    color: "#ff8a8a",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "left",
  },
};
