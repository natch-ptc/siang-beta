"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { clock, secs } from "@/lib/format";
import {
  SIGN_OUT_ICON,
  EDIT_ICON,
  DELETE_ICON,
  ADD_ICON,
  CAMERA_ICON,
  BACK_CHEVRON_SVG,
  CLOSE_GLYPH,
  MUSIC_ICON,
  IMAGE_ICON,
  VIDEO_ICON,
  TEXT_ICON,
  LINK_ICON,
  DOWNLOAD_ICON,
  SHARE_GLYPH,
  QR_GLYPH,
  UP_ICON,
  DOWN_ICON,
  PIN,
  contactIcon,
  contactHref,
  contactLabel,
} from "@/lib/icons";
import { QRCodeCanvas } from "qrcode.react";
import { slugify, slugProblem, SLUG_MAX } from "@/lib/slug";
import { COUNTRIES, findCity, findCountry } from "@/lib/places";
import { BETA_PATH } from "@/lib/beta";
import { PHOTO_CARD_INK, PLAIN_CARD, averageHex, photoCardBg, photoFromCardBg } from "@/lib/card-cover";
import CardFace from "./CardFace";
import Spinner from "./Spinner";
// The Studio reuses the detail sheet's styles so the artist edits their page as visitors see it.
import ds from "./DetailSheet.module.css";
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
};

export type StudioLink = {
  id: string;
  label: string;
  url: string;
  sort_order: number;
};

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
};

export type StudioContact = {
  kind: "ig" | "line" | "email" | "web";
  value: string;
};

export type StudioExhibition = {
  id: string;
  title: string;
  kind: "solo" | "group";
  year: number | null;
  venue: string | null;
  cover_url: string | null;
  exhibition_artworks: { artwork_id: string }[];
};

const makeCode = () => String(100000 + Math.floor(Math.random() * 899999));
const BIO_LIMIT = 160;

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

export default function StudioClient({
  email,
  artist,
  works,
  contacts,
  shows,
  links,
}: {
  email: string;
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
    router.push(BETA_PATH);
    router.refresh();
  }

  if (!artist) {
    return (
      <main className={st.page}>
        <div className={st.column}>
          <div className={ds.detailTop}>
            <Link href={BETA_PATH} className={ds.close} aria-label="Back to Pocket">
              {BACK_CHEVRON_SVG}
            </Link>
            <div className={ds.dtActs} style={{ alignItems: "center" }}>
              <span className={ds.k}>{email}</span>
              <button className={ds.close} onClick={signOut} aria-label="Sign out" type="button">
                {SIGN_OUT_ICON}
              </button>
            </div>
          </div>
          <div className={st.body}>
            <CreateProfile />
          </div>
        </div>
      </main>
    );
  }

  return <ArtistPage artist={artist} works={works} contacts={contacts} shows={shows} links={links} onSignOut={signOut} />;
}

function CreateProfile() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  // Follows the name until the artist types their own link (a Thai name has no Latin slug to suggest).
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [discipline, setDiscipline] = useState("");
  const [place, setPlace] = useState<Place>({ based: "", country: "Thailand", lat: null, lng: null });
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const problem = slugProblem(slug);
    if (problem) {
      setError(`Your link: ${problem}`);
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

    const { error } = await supabase.from("artists").insert({
      user_id: user.id,
      slug,
      name,
      discipline: discipline || null,
      based: place.based.trim() || null,
      country: place.country.trim() || null,
      lat: place.lat,
      lng: place.lng,
      bio: bio || null,
      ...PLAIN_CARD,
    });

    setBusy(false);
    if (error) {
      setError(slugTakenMessage(error.message, error.code));
      return;
    }
    router.refresh();
  }

  return (
    <section style={styles.darkCard}>
      <h1 style={styles.h1}>Set up your artist profile</h1>
      <p style={styles.sub}>This becomes your public card on Pocket. You can add a card photo right after.</p>
      <form onSubmit={submit} style={styles.form}>
        <Field label="Name">
          <input
            style={styles.input}
            required
            value={name}
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
        <p style={{ ...styles.hint, marginTop: -6 }}>Your page and QR codes use this address. English letters, numbers and dashes.</p>
        <Field label="Discipline">
          <input style={styles.input} value={discipline} onChange={(e) => setDiscipline(e.target.value)} placeholder="e.g. Ceramics" />
        </Field>
        <PlacePicker value={place} onChange={setPlace} />
        <Field label="Bio">
          <textarea style={styles.textarea} value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
        </Field>
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.submit} type="submit" disabled={busy}>
          {busy ? (
            <>
              <Spinner /> Creating…
            </>
          ) : (
            "Create profile"
          )}
        </button>
      </form>
    </section>
  );
}

function contactValue(contacts: StudioContact[], kind: StudioContact["kind"]) {
  return contacts.find((c) => c.kind === kind)?.value ?? "";
}

function monthYear(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en", { month: "short", year: "numeric", timeZone: "UTC" });
}

type OpenSheet = null | "profile" | "links" | "compose" | "exhibition" | { work: StudioArtwork } | { qr: StudioArtwork };

// The artist's page exactly as visitors see it in the app (the detail sheet),
// with edit controls on top: tap the card or avatar to change the photo, the
// pencil to edit details, the tiles to edit works.
function ArtistPage({
  artist,
  works,
  contacts,
  shows,
  links,
  onSignOut,
}: {
  artist: StudioArtist;
  works: StudioArtwork[];
  contacts: StudioContact[];
  shows: StudioExhibition[];
  links: StudioLink[];
  onSignOut: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const cardRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const [card, setCard] = useState({ card_bg: artist.card_bg, card_ink: artist.card_ink });
  const [avatarUrl, setAvatarUrl] = useState(artist.avatar_url);
  const [uploading, setUploading] = useState<null | "card" | "avatar">(null);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState(works);
  const [showRows, setShowRows] = useState(shows);
  const [linkRows, setLinkRows] = useState(links);
  const [copied, setCopied] = useState(false);

  const hasCardPhoto = !!photoFromCardBg(card.card_bg);
  const listens = rows.reduce((sum, w) => sum + w.listen_count, 0);
  const url = `https://siang.co/${artist.slug}`;

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
    coverUrl: string | null;
    audioUrl: string;
    durationSec: number | null;
    description: string;
    exhibitionId: string | null;
  }) {
    const slug = slugify(fields.title) || `work-${Date.now()}`;
    const { data, error } = await supabase
      .from("artworks")
      .insert({
        artist_id: artist.id,
        slug,
        code: makeCode(),
        title: fields.title,
        duration_sec: fields.durationSec,
        description: fields.description || null,
        cover_url: fields.coverUrl,
        audio_url: fields.audioUrl,
        sort_order: rows.length,
      })
      .select("id, slug, code, title, duration_sec, description, cover_url, audio_url, listen_count, sort_order")
      .single();
    if (error || !data) return { error: error?.message ?? "Could not publish the work." };

    if (fields.exhibitionId) {
      await supabase.from("exhibition_artworks").insert({ exhibition_id: fields.exhibitionId, artwork_id: data.id });
      setShowRows((r) =>
        r.map((sh) => (sh.id === fields.exhibitionId ? { ...sh, exhibition_artworks: [...sh.exhibition_artworks, { artwork_id: data.id }] } : sh))
      );
    }

    setRows((r) => [...r, data as StudioArtwork]);
    setSheet(null);
    router.refresh();
    return {};
  }

  async function updateWork(id: string, fields: Partial<Pick<StudioArtwork, "title" | "description" | "duration_sec" | "cover_url">>) {
    const { error } = await supabase.from("artworks").update(fields).eq("id", id);
    if (error) return error.message;
    setRows((r) => r.map((w) => (w.id === id ? { ...w, ...fields } : w)));
    router.refresh();
    return null;
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

  async function createExhibition(title: string, venue: string, year: number, kind: "solo" | "group", workIds: string[]) {
    const { data, error } = await supabase
      .from("exhibitions")
      .insert({ artist_id: artist.id, title, venue, year, kind })
      .select("id, title, kind, year, venue, cover_url")
      .single();
    if (error || !data) return { error: error?.message ?? "Could not create the exhibition." };

    let linkedIds: string[] = [];
    if (workIds.length) {
      const { data: linked, error: linkError } = await supabase
        .from("exhibition_artworks")
        .insert(workIds.map((artwork_id) => ({ exhibition_id: data.id, artwork_id })))
        .select("artwork_id");
      if (linkError) {
        // the exhibition itself was created; only the work links failed —
        // still show it, but surface the error so it isn't silently wrong
        setShowRows((r) => [{ ...data, exhibition_artworks: [] }, ...r]);
        router.refresh();
        return { error: `Exhibition created, but couldn't link works: ${linkError.message}` };
      }
      linkedIds = (linked ?? []).map((l) => l.artwork_id);
    }
    setShowRows((r) => [{ ...data, exhibition_artworks: linkedIds.map((id) => ({ artwork_id: id })) }, ...r]);
    setSheet(null);
    router.refresh();
    return {};
  }

  async function updateShowCover(id: string, cover_url: string) {
    setShowRows((r) => r.map((sh) => (sh.id === id ? { ...sh, cover_url } : sh)));
    await supabase.from("exhibitions").update({ cover_url }).eq("id", id);
  }

  const tile = (w: StudioArtwork, meta: React.ReactNode) => (
    <button key={w.id} className={ds.tile} onClick={() => setSheet({ work: w })} type="button" aria-label={`Edit ${w.title}`}>
      <span
        className={`${ds.piece} ${w.cover_url ? "" : st.placeholderPiece}`}
        style={w.cover_url ? { background: `center/cover no-repeat url("${w.cover_url}")` } : undefined}
      />
      <span className={ds.cap}>{w.title}</span>
      {meta}
    </button>
  );

  return (
    <main className={st.page}>
      <div className={st.column}>
        <div className={ds.detailTop}>
          <div className={st.topLeft}>
            <Link href={BETA_PATH} className={ds.close} aria-label="Back to Pocket">
              {BACK_CHEVRON_SVG}
            </Link>
            <span className={ds.k}>{copied ? "Link copied" : "Your page"}</span>
          </div>
          <div className={ds.dtActs}>
            <button className={ds.close} onClick={share} aria-label="Share your page" type="button">
              {SHARE_GLYPH}
            </button>
            <button className={ds.close} onClick={() => setSheet("profile")} aria-label="Edit your details" type="button">
              {EDIT_ICON}
            </button>
            <button className={ds.close} onClick={onSignOut} aria-label="Sign out" type="button">
              {SIGN_OUT_ICON}
            </button>
          </div>
        </div>

        <div className={st.body}>
          <button
            className={`${ds.hero} ${st.heroBtn}`}
            onClick={() => cardRef.current?.click()}
            disabled={uploading === "card"}
            aria-label={hasCardPhoto ? "Change your card photo" : "Add a photo to your card"}
            type="button"
          >
            <span className={ds.side}>
              <CardFace
                card={{
                  cardBg: card.card_bg,
                  cardInk: card.card_ink,
                  based: artist.based ?? "",
                  country: artist.country ?? "",
                  addedAt: artist.joined_at ?? new Date().toISOString(),
                  name: artist.name,
                  slug: artist.slug,
                }}
              />
              {uploading === "card" && (
                <span className={st.veil}>
                  <Spinner size={28} label="Uploading card photo" />
                </span>
              )}
            </span>
            <span className={st.cardEdit}>
              {CAMERA_ICON} {hasCardPhoto ? "Change photo" : "Add photo"}
            </span>
          </button>
          <input ref={cardRef} type="file" accept="image/*" hidden onChange={changeCardPhoto} />
          <p className={ds.fliphint}>
            Tap the card to change its photo
            {hasCardPhoto && (
              <>
                {" · "}
                <button onClick={removeCardPhoto} style={{ textDecoration: "underline", fontSize: "inherit", color: "inherit" }} type="button">
                  Remove
                </button>
              </>
            )}
          </p>

          <div className={ds.dwho}>
            <button
              className={`${ds.avatar} ${st.avatarBtn}`}
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
            <div>
              <h1 className={ds.dname}>{artist.name}</h1>
              <div className={ds.dkind}>siang.co/{artist.slug}</div>
            </div>
          </div>
          {error && <p style={{ ...styles.error, color: "#B63878" }}>{error}</p>}

          {artist.bio ? (
            <p className={ds.dbio}>{artist.bio}</p>
          ) : (
            <button className={st.addHint} onClick={() => setSheet("profile")} type="button">
              + Add a short bio
            </button>
          )}

          <div className={ds.dcontacts}>
            {contacts.map((c) => (
              <a key={c.kind} className={ds.mappill} href={contactHref(c.kind, c.value)} target="_blank" rel="noopener noreferrer">
                {contactIcon(c.kind)}
                <span>{contactLabel(c.kind)}</span>
              </a>
            ))}
            {linkRows.map((l) => (
              <a key={l.id} className={ds.mappill} href={l.url} target="_blank" rel="noopener noreferrer">
                {LINK_ICON}
                <span>{l.label}</span>
              </a>
            ))}
            <button className={`${ds.mappill} ${st.dashed}`} onClick={() => setSheet("links")} type="button">
              {ADD_ICON}
              <span>{linkRows.length ? "Edit links" : "Add links"}</span>
            </button>
          </div>

          <div className={ds.dmeta}>
            <div className={ds.dmetaRow}>
              <b>{listens.toLocaleString()} listens this month</b>
              {artist.based && (
                <span className={ds.mappill}>
                  {PIN}
                  <span>{artist.based}</span>
                </span>
              )}
            </div>
            <span>
              {[artist.based, artist.country].filter(Boolean).join(", ") || "Add where you're based"} · on Siang since {monthYear(artist.joined_at)}
            </span>
          </div>

          <div className={ds.dpanel}>
            <section className={ds.dsec}>
              <div className={ds.dsecHead}>
                <h2>Art</h2>
                <span>
                  {rows.length} work{rows.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className={ds.shelf}>
                <button className={ds.tile} onClick={() => setSheet("compose")} type="button">
                  <span className={`${ds.piece} ${st.addPiece}`}>
                    {ADD_ICON}
                    <span>Upload a work</span>
                  </span>
                  <span className={ds.cap}>New work</span>
                </button>
                {rows.map((w) =>
                  tile(
                    w,
                    <span className={ds.loc}>
                      <span>
                        {w.duration_sec ? clock(w.duration_sec) : "—"} · {w.listen_count.toLocaleString()} listens
                      </span>
                    </span>
                  )
                )}
              </div>
            </section>

            <section className={ds.dsec}>
              <div className={ds.dsecHead}>
                <h2>Exhibitions</h2>
                <span>
                  {showRows.length} show{showRows.length === 1 ? "" : "s"}
                </span>
              </div>
              {showRows.map((sh) => {
                const showWorks = rows.filter((w) => sh.exhibition_artworks.some((a) => a.artwork_id === w.id));
                return (
                  <div className={ds.show} key={sh.id}>
                    <div className={ds.showHead}>
                      <ShowCoverButton show={sh} onChange={updateShowCover} />
                      <span className={ds.t}>
                        <em>{sh.title}</em>
                        <span className={ds.loc}>
                          {PIN}
                          <span>
                            {sh.venue ?? "No venue"} · {sh.year ?? "—"} · {sh.kind === "solo" ? "Solo" : "Group"}
                          </span>
                        </span>
                      </span>
                      <span className={ds.more}>
                        {showWorks.length} work{showWorks.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    {showWorks.length > 0 && <div className={ds.shelf}>{showWorks.slice(0, 3).map((w) => tile(w, null))}</div>}
                  </div>
                );
              })}
              {showRows.length === 0 && <p className={st.empty}>Group works into a show so visitors can find where they hung.</p>}
              <button className={st.darkAdd} onClick={() => setSheet("exhibition")} type="button">
                {ADD_ICON} New exhibition
              </button>
            </section>
          </div>
        </div>
      </div>

      <div className={st.doneBar}>
        <span className={st.doneNote}>✓ Changes save as you go</span>
        <Link href={`/${artist.slug}`} className={st.doneBtn}>
          Done · view my page
        </Link>
      </div>

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
      {sheet === "compose" && <WorkComposer artistSlug={artist.slug} shows={showRows} onClose={() => setSheet(null)} onSubmit={addWork} />}
      {sheet === "exhibition" && (
        <Sheet title="New exhibition" onClose={() => setSheet(null)}>
          <NewExhibitionForm works={rows} onSubmit={createExhibition} />
        </Sheet>
      )}
      {sheet && typeof sheet === "object" && "work" in sheet && (
        <WorkSheet
          work={sheet.work}
          onClose={() => setSheet(null)}
          onUpdate={updateWork}
          onDelete={deleteWork}
          onShowQR={() => setSheet({ qr: sheet.work })}
        />
      )}
      {sheet && typeof sheet === "object" && "qr" in sheet && (
        <WorkQRSheet artistSlug={artist.slug} work={sheet.qr} onClose={() => setSheet(null)} />
      )}
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
    <label
      className={st.showCover}
      style={show.cover_url ? { backgroundImage: `url("${show.cover_url}")` } : undefined}
      aria-label="Change exhibition cover photo"
    >
      {uploading ? <Spinner size={16} label="Uploading cover" /> : !show.cover_url && CAMERA_ICON}
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
  const [ig, setIg] = useState(contactValue(contacts, "ig") ? "@" + contactValue(contacts, "ig") : "");
  const [line, setLine] = useState(contactValue(contacts, "line"));
  const [emailContact, setEmailContact] = useState(contactValue(contacts, "email"));
  const [web, setWeb] = useState(contactValue(contacts, "web"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slugChanged = slug !== artist.slug;

  async function save() {
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Add your name. It is the first thing visitors read.");
      return;
    }
    const trimmedEmail = emailContact.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Check the email address. It needs an @ and a domain.");
      return;
    }
    const problem = slugChanged ? slugProblem(slug) : null;
    if (problem) {
      setError(`Your link: ${problem}`);
      return;
    }

    setBusy(true);
    const { error: updateError } = await supabase
      .from("artists")
      .update({
        name: trimmedName,
        slug,
        discipline: discipline.trim() || null,
        based: place.based.trim() || null,
        country: place.country.trim() || null,
        lat: place.lat,
        lng: place.lng,
        bio: bio.trim() || null,
      })
      .eq("id", artist.id);
    if (updateError) {
      setBusy(false);
      setError(slugTakenMessage(updateError.message, updateError.code));
      return;
    }

    const contactPairs: [StudioContact["kind"], string][] = [
      ["ig", ig.trim().replace(/^@/, "")],
      ["line", line.trim()],
      ["email", trimmedEmail],
      ["web", web.trim().replace(/^https?:\/\//i, "")],
    ];
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
      <SlugField value={slug} onChange={setSlug} />
      <p style={{ ...styles.hint, marginTop: -6, color: slugChanged ? "#FF6FA5" : undefined }}>
        {slugChanged
          ? `QR codes and links you already shared point to siang.co/${artist.slug} and will stop working.`
          : "Changing your name doesn't change your link."}
      </p>
      <Field label="Discipline">
        <input style={styles.input} value={discipline} onChange={(e) => setDiscipline(e.target.value)} />
      </Field>
      <PlacePicker value={place} onChange={setPlace} />
      <label style={styles.label}>
        <span style={{ display: "flex", justifyContent: "space-between" }}>
          Short bio <em style={{ fontStyle: "normal", opacity: 0.6 }}>{bio.length}/{BIO_LIMIT}</em>
        </span>
        <textarea style={styles.textarea} rows={3} maxLength={BIO_LIMIT} value={bio} onChange={(e) => setBio(e.target.value.slice(0, BIO_LIMIT))} />
      </label>
      <div style={styles.fldH}>Contact</div>
      <Field label="Instagram">
        <input style={styles.input} placeholder="@handle" value={ig} onChange={(e) => setIg(e.target.value)} />
      </Field>
      <Field label="LINE ID">
        <input style={styles.input} value={line} onChange={(e) => setLine(e.target.value)} />
      </Field>
      <Field label="Email">
        <input style={styles.input} type="email" value={emailContact} onChange={(e) => setEmailContact(e.target.value)} />
      </Field>
      <Field label="Website">
        <input style={styles.input} value={web} onChange={(e) => setWeb(e.target.value)} />
      </Field>
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
}: {
  artistSlug: string;
  shows: StudioExhibition[];
  onClose: () => void;
  onSubmit: (fields: {
    title: string;
    coverUrl: string | null;
    audioUrl: string;
    durationSec: number | null;
    description: string;
    exhibitionId: string | null;
  }) => Promise<{ error?: string }>;
}) {
  const supabase = createClient();
  const coverRef = useRef<HTMLInputElement>(null);
  const soundRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
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
    if (!audioUrl) {
      setError("Add a sound file — every work needs one.");
      return;
    }
    setBusy(true);
    const result = await onSubmit({ title: t, coverUrl, audioUrl, durationSec, description, exhibitionId });
    setBusy(false);
    if (result.error) setError(result.error);
  }

  function fillSample() {
    setTitle("น้ำนิ่ง (ตัวอย่าง)");
    setTitleEn("Still Water (sample)");
    setAddText(true);
    setDescription("Thrown celadon, recorded inside the kiln while it fires.");
  }

  const linkSlug = slugify(titleEn || title);

  return (
    <>
      <div style={styles.backdrop} onClick={onClose} />
      <div style={styles.composer} role="dialog" aria-label="New work">
        <div style={styles.composerTop}>
          <button style={styles.ghostIconBtn} onClick={onClose} aria-label="Close" type="button">
            {CLOSE_GLYPH}
          </button>
          <b style={{ fontSize: 14, fontWeight: 700 }}>New work</b>
          <button style={styles.linkish} onClick={fillSample} type="button">
            Fill a sample
          </button>
        </div>
        <div style={styles.composerBody}>
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
                    <span style={{ opacity: 0.7, fontSize: 11 }}>optional</span>
                  </>
                ))}
            </button>
            <input ref={coverRef} type="file" accept="image/*" hidden onChange={handleCover} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <input style={styles.titleInput} placeholder="ชื่องาน" value={title} onChange={(e) => setTitle(e.target.value)} />
              <input
                style={{ ...styles.titleInput, marginBottom: 4 }}
                placeholder="Title in English (optional)"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
              />
              {linkSlug && <p style={styles.composerHint}>Link: siang.co/{artistSlug}/{linkSlug} (from the English title)</p>}
            </div>
          </div>

          <div style={styles.composerSecHead}>
            <h2 style={styles.h2}>Content</h2>
            <span style={styles.composerSecLabel}>Shown in this order</span>
          </div>

          <div style={styles.soundHead}>
            <span style={styles.soundHeadLabel}>
              {MUSIC_ICON} Sound <span style={styles.soundHeadSub}>One per work, required</span>
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

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <span style={styles.chipSmActive}>{MUSIC_ICON} Sound</span>
            <button type="button" style={addText ? styles.chipSmActive : styles.chipSmInactive} onClick={() => setAddText((a) => !a)}>
              {TEXT_ICON} Text
            </button>
            <button type="button" style={styles.chipSmInactive} onClick={() => coverRef.current?.click()}>
              {IMAGE_ICON} Image
            </button>
            <span style={styles.chipSmDisabled} title="Video isn't supported yet">
              {VIDEO_ICON} Video
            </span>
          </div>

          {addText && (
            <textarea
              style={{ ...styles.textarea, width: "100%", marginTop: 10, boxSizing: "border-box" }}
              rows={3}
              placeholder="Say something about this work"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          )}

          {shows.length > 0 && (
            <>
              <div style={styles.composerSecHead}>
                <h2 style={styles.h2}>Exhibition</h2>
                <span style={styles.composerSecLabel}>Optional</span>
              </div>
              <div style={styles.chipRow}>
                <button
                  type="button"
                  style={exhibitionId === null ? styles.chipActive : styles.chipInactive}
                  onClick={() => setExhibitionId(null)}
                >
                  Not in an exhibition
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
          <p style={styles.composerHint}>Publishing gives the work its page, a six-digit code and a QR to print.</p>
        </div>
      </div>
    </>
  );
}

function formatCode(code: string) {
  return code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;
}

function WorkQRSheet({ artistSlug, work, onClose }: { artistSlug: string; work: StudioArtwork; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = `https://siang.co/${artistSlug}/${work.slug}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard API unavailable — nothing to fall back to here
    }
  }

  function downloadQR() {
    const canvas = document.getElementById(`work-qr-${work.id}`) as HTMLCanvasElement | null;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `${work.slug}-qr.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  return (
    <Sheet title={work.title} onClose={onClose}>
      <p style={{ ...styles.sub, marginTop: -8, marginBottom: 16 }}>Scan to hear this work</p>
      <div style={styles.qrWrap}>
        <QRCodeCanvas id={`work-qr-${work.id}`} value={url} size={200} includeMargin />
      </div>
      <p style={styles.qrCodeText}>{formatCode(work.code)}</p>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ ...styles.saveSm, display: "inline-flex", alignItems: "center", gap: 6 }} onClick={copyLink} type="button">
          {LINK_ICON} {copied ? "Copied" : "Copy link"}
        </button>
        <button style={{ ...styles.rowBtn, display: "inline-flex", alignItems: "center", gap: 6 }} onClick={downloadQR} type="button">
          {DOWNLOAD_ICON} Download QR
        </button>
      </div>
    </Sheet>
  );
}

// Opened by tapping a work's tile: change its cover, fix its details, print
// its QR, or delete it.
function WorkSheet({
  work,
  onClose,
  onUpdate,
  onDelete,
  onShowQR,
}: {
  work: StudioArtwork;
  onClose: () => void;
  onUpdate: (id: string, fields: Partial<Pick<StudioArtwork, "title" | "description" | "duration_sec" | "cover_url">>) => Promise<string | null>;
  onDelete: (id: string) => Promise<string | null>;
  onShowQR: () => void;
}) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [coverUrl, setCoverUrl] = useState(work.cover_url);
  const [title, setTitle] = useState(work.title);
  const [description, setDescription] = useState(work.description ?? "");
  const [duration, setDuration] = useState(work.duration_sec ? clock(work.duration_sec) : "");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadFile(supabase, file);
      const err = await onUpdate(work.id, { cover_url: url });
      if (err) setError(err);
      else setCoverUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setError(null);
    const t = title.trim();
    if (!t) {
      setError("A work needs a title.");
      return;
    }
    if (duration && !/^\d+:\d{2}$/.test(duration.trim())) {
      setError("Write the length as minutes:seconds, like 3:12.");
      return;
    }
    setBusy(true);
    const err = await onUpdate(work.id, { title: t, description: description.trim() || null, duration_sec: duration ? secs(duration.trim()) : null });
    setBusy(false);
    if (err) setError(err);
    else onClose();
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
      <div style={styles.form}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <button
            type="button"
            style={{ ...styles.coverUpload, backgroundImage: coverUrl ? `url("${coverUrl}")` : undefined }}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label="Change the cover image"
          >
            {uploading ? <Spinner size={22} label="Uploading cover" /> : !coverUrl && <>{CAMERA_ICON}<br />Add cover</>}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleCover} />
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            <Field label="Title">
              <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Length">
              <input style={styles.input} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="m:ss" inputMode="numeric" />
            </Field>
          </div>
        </div>
        <Field label="About this work">
          <textarea style={styles.textarea} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <p style={styles.hint}>
          Code {formatCode(work.code)} · {work.listen_count.toLocaleString()} listens
        </p>
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.submit} onClick={save} disabled={busy || uploading} type="button">
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
            {QR_GLYPH} QR code to print
          </button>
          <button style={{ ...styles.rowBtnDanger, display: "inline-flex", alignItems: "center", gap: 6 }} onClick={remove} disabled={busy} type="button">
            {DELETE_ICON} {confirmDelete ? "Tap again to delete" : "Delete work"}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

function NewExhibitionForm({
  works,
  onSubmit,
}: {
  works: StudioArtwork[];
  onSubmit: (
    title: string,
    venue: string,
    year: number,
    kind: "solo" | "group",
    workIds: string[]
  ) => Promise<{ error?: string }>;
}) {
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [kind, setKind] = useState<"solo" | "group">("solo");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function toggle(id: string) {
    setChecked((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const t = title.trim();
    const v = venue.trim();
    if (!t) {
      setError("Add a title to create the exhibition.");
      return;
    }
    if (!v) {
      setError("Add where it is shown, so visitors can find it.");
      return;
    }
    const y = +year;
    setBusy(true);
    const result = await onSubmit(t, v, y > 1900 ? y : new Date().getFullYear(), kind, [...checked]);
    setBusy(false);
    if (result.error) setError(result.error);
  }

  return (
    <form style={{ ...styles.form, marginBottom: 18 }} onSubmit={submit}>
      <Field label="Title">
        <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ชื่อนิทรรศการ" />
      </Field>
      <Field label="Where it's shown">
        <input style={styles.input} value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Gallery or venue, city" />
      </Field>
      <div style={styles.row}>
        <Field label="Year">
          <input style={styles.input} inputMode="numeric" maxLength={4} value={year} onChange={(e) => setYear(e.target.value)} />
        </Field>
        <div>
          <span style={{ ...styles.label, display: "block", marginBottom: 6 }}>Type</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" style={kind === "solo" ? styles.chipActive : styles.chipInactive} onClick={() => setKind("solo")}>
              Solo
            </button>
            <button type="button" style={kind === "group" ? styles.chipActive : styles.chipInactive} onClick={() => setKind("group")}>
              Group
            </button>
          </div>
        </div>
      </div>
      {works.length > 0 && (
        <div>
          <span style={{ ...styles.label, display: "block", marginBottom: 6 }}>Works in this exhibition</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
      <button style={styles.saveSm} type="submit" disabled={busy}>
        {busy ? (
          <>
            <Spinner size={14} /> Creating…
          </>
        ) : (
          "Create exhibition"
        )}
      </button>
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
    background: "#161617",
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
  error: { fontSize: 13, color: "#FF6FA5", margin: "10px 0 0" },
  submit: {
    height: 48,
    padding: "0 24px",
    borderRadius: 999,
    border: 0,
    background: "#B63878",
    color: "#fff",
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
    background: "#B63878",
    color: "#fff",
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
    height: 30,
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
    height: 30,
    padding: "0 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,111,165,.35)",
    background: "none",
    color: "#FF6FA5",
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
  checkRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "rgba(255,255,255,.85)" },

  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 60 },
  sheet: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    maxWidth: 520,
    margin: "0 auto",
    background: "#161617",
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
  makePink: {
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
    background: "#B63878",
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
    color: "#FF6FA5",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "left",
  },
  qrCodeText: { fontSize: 22, fontWeight: 700, letterSpacing: "0.1em", textAlign: "center", margin: "4px 0 18px" },
  qrWrap: { display: "flex", justifyContent: "center", padding: 16, background: "#fff", borderRadius: 12, marginBottom: 16 },
};
