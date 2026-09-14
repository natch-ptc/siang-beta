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
  KEBAB_ICON,
  DOWNLOAD_ICON,
  SHARE_GLYPH,
  QR_GLYPH,
  contactIcon,
} from "@/lib/icons";
import { QRCodeCanvas } from "qrcode.react";
import { slugify } from "@/lib/slug";

export type StudioArtist = {
  id: string;
  slug: string;
  name: string;
  discipline: string | null;
  based: string | null;
  country: string | null;
  bio: string | null;
  avatar_url: string | null;
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
}: {
  email: string;
  artist: StudioArtist | null;
  works: StudioArtwork[];
  contacts: StudioContact[];
  shows: StudioExhibition[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [composing, setComposing] = useState(false);
  const [addingExhibition, setAddingExhibition] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <Link href="/" style={styles.back} aria-label="Back to Pocket">
          {BACK_CHEVRON_SVG}
        </Link>
        <div style={styles.headerRight}>
          <span style={styles.email}>{email}</span>
          <button style={{ ...styles.signOut, display: "inline-flex", alignItems: "center", gap: 6 }} onClick={signOut}>
            {SIGN_OUT_ICON} Sign out
          </button>
        </div>
      </header>

      {!artist ? (
        <CreateProfile />
      ) : (
        <>
          <ProfileEditor artist={artist} contacts={contacts} onUpload={() => setComposing(true)} onNewExhibition={() => setAddingExhibition(true)} />
          <WorksSection
            artistId={artist.id}
            artistSlug={artist.slug}
            works={works}
            shows={shows}
            composing={composing}
            setComposing={setComposing}
          />
          <ExhibitionsSection artistId={artist.id} works={works} shows={shows} adding={addingExhibition} setAdding={setAddingExhibition} />
        </>
      )}
    </main>
  );
}

function CreateProfile() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [based, setBased] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

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
      slug: slugify(name) || `artist-${Date.now()}`,
      name,
      discipline: discipline || null,
      based: based || null,
      country: country || null,
      bio: bio || null,
      card_bg: "#000000",
      card_ink: "#ffffff",
      card_tint: "#333333",
    });

    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <section style={styles.card}>
      <h1 style={styles.h1}>Set up your artist profile</h1>
      <p style={styles.sub}>This becomes your public card on Pocket. You can add a photo after creating it.</p>
      <form onSubmit={submit} style={styles.form}>
        <Field label="Name">
          <input style={styles.input} required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Discipline">
          <input style={styles.input} value={discipline} onChange={(e) => setDiscipline(e.target.value)} placeholder="e.g. Ceramics" />
        </Field>
        <div style={styles.row}>
          <Field label="Based in">
            <input style={styles.input} value={based} onChange={(e) => setBased(e.target.value)} placeholder="City" />
          </Field>
          <Field label="Country">
            <input style={styles.input} value={country} onChange={(e) => setCountry(e.target.value)} />
          </Field>
        </div>
        <Field label="Bio">
          <textarea style={styles.textarea} value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
        </Field>
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.submit} type="submit" disabled={busy}>
          {busy ? "..." : "Create profile"}
        </button>
      </form>
    </section>
  );
}

function contactValue(contacts: StudioContact[], kind: StudioContact["kind"]) {
  return contacts.find((c) => c.kind === kind)?.value ?? "";
}

function ProfileEditor({
  artist,
  contacts,
  onUpload,
  onNewExhibition,
}: {
  artist: StudioArtist;
  contacts: StudioContact[];
  onUpload: () => void;
  onNewExhibition: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(artist.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`https://siang.co/${artist.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard API unavailable — nothing to fall back to here
    }
  }

  async function shareLink() {
    const url = `https://siang.co/${artist.slug}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: artist.name, url });
      } catch {
        // user cancelled the native share sheet
      }
    } else {
      copyLink();
    }
  }

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(artist.name);
  const [discipline, setDiscipline] = useState(artist.discipline ?? "");
  const [based, setBased] = useState(artist.based ?? "");
  const [country, setCountry] = useState(artist.country ?? "");
  const [bio, setBio] = useState(artist.bio ?? "");
  const [ig, setIg] = useState(contactValue(contacts, "ig") ? "@" + contactValue(contacts, "ig") : "");
  const [line, setLine] = useState(contactValue(contacts, "line"));
  const [emailContact, setEmailContact] = useState(contactValue(contacts, "email"));
  const [web, setWeb] = useState(contactValue(contacts, "web"));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadFile(supabase, file);
      await supabase.from("artists").update({ avatar_url: url }).eq("id", artist.id);
      setAvatarUrl(url);
      router.refresh();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

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

    setBusy(true);
    setSaved(false);

    await supabase
      .from("artists")
      .update({
        name: trimmedName,
        discipline: discipline.trim() || null,
        based: based.trim() || null,
        country: country.trim() || null,
        bio: bio.trim() || null,
      })
      .eq("id", artist.id);

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
    setSaved(true);
    setEditing(false);
    router.refresh();
  }

  return (
    <section style={styles.card}>
      <div style={styles.profileHead}>
        <button
          style={{ ...styles.avatarBtn, backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined }}
          onClick={() => fileRef.current?.click()}
          aria-label="Change your photo"
          type="button"
        >
          {!avatarUrl && (uploading ? "…" : CAMERA_ICON)}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={styles.h1}>{artist.name}</h1>
          <p style={styles.sub}>
            siang.co/{artist.slug} · {[artist.discipline, artist.based].filter(Boolean).join(" · ")}
          </p>
        </div>
        {!editing && (
          <button style={{ ...styles.addBtn, display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start" }} onClick={() => setEditing(true)}>
            {EDIT_ICON} Edit profile
          </button>
        )}
      </div>
      {uploadError && <p style={styles.error}>{uploadError}</p>}

      <p style={styles.hint}>One link for your Instagram bio. Everything you publish appears there.</p>

      {!editing ? (
        <>
          {artist.bio && <p style={{ ...styles.sub, marginTop: 14, color: "rgba(255,255,255,.86)" }}>{artist.bio}</p>}
          {contacts.length > 0 && (
            <div style={styles.chipRow}>
              {contacts.map((c) => (
                <span key={c.kind} style={{ ...styles.chip, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {contactIcon(c.kind)} {c.value}
                </span>
              ))}
            </div>
          )}
          {saved && <span style={{ ...styles.savedTag, display: "block", marginTop: 10 }}>Saved</span>}

          <div style={{ ...styles.pillRow, marginTop: 20 }}>
            <button style={styles.pillDk} onClick={copyLink} type="button">
              {LINK_ICON} {copied ? "Copied" : "Copy link"}
            </button>
            <Link href="/" style={styles.pillDk}>
              View your page
            </Link>
            <button style={styles.pillDk} onClick={shareLink} type="button">
              {SHARE_GLYPH} Share
            </button>
          </div>
          <div style={styles.makeGrid}>
            <button style={styles.makePink} onClick={onUpload} type="button">
              <span>{ADD_ICON}</span>
              <span>
                <span style={styles.makeTitle}>Upload a work</span>
                <span style={styles.makeSub}>Sound, text, images and video</span>
              </span>
            </button>
            <button style={styles.make} onClick={onNewExhibition} type="button">
              <span>{IMAGE_ICON}</span>
              <span>
                <span style={styles.makeTitle}>New exhibition</span>
                <span style={styles.makeSub}>Group works for one show</span>
              </span>
            </button>
          </div>
        </>
      ) : (
        <Sheet title="Edit profile" onClose={() => setEditing(false)}>
          <div style={styles.form}>
            <Field label="Name">
              <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <p style={styles.hint}>Your link stays siang.co/{artist.slug}, even if you change your name.</p>
            <div style={styles.row}>
              <Field label="Discipline">
                <input style={styles.input} value={discipline} onChange={(e) => setDiscipline(e.target.value)} />
              </Field>
              <Field label="Based in">
                <input style={styles.input} value={based} onChange={(e) => setBased(e.target.value)} />
              </Field>
            </div>
            <Field label="Country">
              <input style={styles.input} value={country} onChange={(e) => setCountry(e.target.value)} />
            </Field>
            <label style={styles.label}>
              <span style={{ display: "flex", justifyContent: "space-between" }}>
                Short bio <em style={{ fontStyle: "normal", opacity: 0.6 }}>{bio.length}/{BIO_LIMIT}</em>
              </span>
              <textarea
                style={styles.textarea}
                rows={3}
                maxLength={BIO_LIMIT}
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, BIO_LIMIT))}
              />
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
            {error && <p style={styles.error}>{error}</p>}
            <button style={styles.submit} onClick={save} disabled={busy}>
              {busy ? "Saving..." : "Save profile"}
            </button>
          </div>
        </Sheet>
      )}
    </section>
  );
}

function WorksSection({
  artistId,
  artistSlug,
  works,
  shows,
  composing,
  setComposing,
}: {
  artistId: string;
  artistSlug: string;
  works: StudioArtwork[];
  shows: StudioExhibition[];
  composing: boolean;
  setComposing: (v: boolean) => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [rows, setRows] = useState(works);

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
        artist_id: artistId,
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
    }

    setRows((r) => [...r, data as StudioArtwork]);
    setComposing(false);
    router.refresh();
    return {};
  }

  async function updateWork(id: string, fields: Partial<Pick<StudioArtwork, "title" | "description" | "duration_sec" | "cover_url">>) {
    await supabase.from("artworks").update(fields).eq("id", id);
    setRows((r) => r.map((w) => (w.id === id ? { ...w, ...fields } : w)));
  }

  async function deleteWork(id: string) {
    await supabase.from("artworks").delete().eq("id", id);
    setRows((r) => r.filter((w) => w.id !== id));
  }

  return (
    <section style={styles.card}>
      <div style={styles.worksHead}>
        <h2 style={styles.h2}>Works</h2>
        <span style={styles.composerSecLabel}>{rows.length} work{rows.length === 1 ? "" : "s"}</span>
      </div>

      {composing && <WorkComposer artistSlug={artistSlug} shows={shows} onClose={() => setComposing(false)} onSubmit={addWork} />}

      <div style={styles.workList}>
        {rows.map((w) => (
          <WorkRow key={w.id} work={w} artistSlug={artistSlug} onUpdate={updateWork} onDelete={deleteWork} />
        ))}
        {rows.length === 0 && !composing && <p style={styles.empty}>No works yet.</p>}
      </div>
    </section>
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
                  "…"
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
                {soundUploading ? "Uploading…" : soundName}
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
          <button style={styles.submit} onClick={publish} disabled={busy || soundUploading || coverUploading} type="button">
            {busy ? "Publishing..." : "Publish"}
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

function WorkRow({
  work,
  artistSlug,
  onUpdate,
  onDelete,
}: {
  work: StudioArtwork;
  artistSlug: string;
  onUpdate: (id: string, fields: Partial<Pick<StudioArtwork, "title" | "description" | "duration_sec" | "cover_url">>) => void;
  onDelete: (id: string) => void;
}) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(work.title);
  const [description, setDescription] = useState(work.description ?? "");
  const [duration, setDuration] = useState(work.duration_sec ? clock(work.duration_sec) : "");
  const [uploading, setUploading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(supabase, file);
      onUpdate(work.id, { cover_url: url });
    } finally {
      setUploading(false);
    }
  }

  const thumb = (
    <button
      style={{ ...styles.thumb, backgroundImage: work.cover_url ? `url(${work.cover_url})` : undefined }}
      onClick={() => fileRef.current?.click()}
      aria-label="Change cover photo"
      type="button"
    >
      {!work.cover_url && (uploading ? "…" : CAMERA_ICON)}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleCover} />
    </button>
  );

  if (!editing) {
    return (
      <div style={styles.workRow}>
        {thumb}
        <div style={{ flex: 1, minWidth: 0 }}>
          <b style={styles.workTitle}>{work.title}</b>
          <span style={styles.workMeta}>
            {work.duration_sec ? clock(work.duration_sec) : "—"} · {work.listen_count.toLocaleString()} listens
          </span>
        </div>
        <button style={styles.qrBtn} onClick={() => setShowQR(true)} aria-label={`Share or print the code for ${work.title}`} type="button">
          {QR_GLYPH}
        </button>
        <div style={styles.kebabWrap}>
          <button style={styles.kebabBtn} onClick={() => setMenuOpen((m) => !m)} aria-label="More options" type="button">
            {KEBAB_ICON}
          </button>
          {menuOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 19 }} onClick={() => setMenuOpen(false)} />
              <div style={styles.kebabMenu}>
                <button
                  style={styles.kebabItem}
                  onClick={() => {
                    setEditing(true);
                    setMenuOpen(false);
                  }}
                  type="button"
                >
                  {EDIT_ICON} Edit
                </button>
                <button
                  style={styles.kebabItemDanger}
                  onClick={() => {
                    onDelete(work.id);
                    setMenuOpen(false);
                  }}
                  type="button"
                >
                  {DELETE_ICON} Delete
                </button>
              </div>
            </>
          )}
        </div>
        {showQR && <WorkQRSheet artistSlug={artistSlug} work={work} onClose={() => setShowQR(false)} />}
      </div>
    );
  }

  return (
    <div style={styles.workRowEditing}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        {thumb}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
          <input style={styles.input} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="m:ss" />
        </div>
      </div>
      <textarea style={styles.textarea} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      <div style={{ display: "flex", gap: 8 }}>
        <button
          style={styles.saveSm}
          onClick={() => {
            onUpdate(work.id, { title, description: description || null, duration_sec: duration ? secs(duration) : null });
            setEditing(false);
          }}
        >
          Save
        </button>
        <button style={styles.rowBtn} onClick={() => setEditing(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function ExhibitionsSection({
  artistId,
  works,
  shows,
  adding,
  setAdding,
}: {
  artistId: string;
  works: StudioArtwork[];
  shows: StudioExhibition[];
  adding: boolean;
  setAdding: (v: boolean) => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [rows, setRows] = useState(shows);

  async function createExhibition(title: string, venue: string, year: number, kind: "solo" | "group", workIds: string[]) {
    const { data, error } = await supabase
      .from("exhibitions")
      .insert({ artist_id: artistId, title, venue, year, kind })
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
        setRows((r) => [{ ...data, exhibition_artworks: [] }, ...r]);
        setAdding(false);
        router.refresh();
        return { error: `Exhibition created, but couldn't link works: ${linkError.message}` };
      }
      linkedIds = (linked ?? []).map((l) => l.artwork_id);
    }
    setRows((r) => [{ ...data, exhibition_artworks: linkedIds.map((id) => ({ artwork_id: id })) }, ...r]);
    setAdding(false);
    router.refresh();
    return {};
  }

  async function updateCover(id: string, cover_url: string) {
    setRows((r) => r.map((sh) => (sh.id === id ? { ...sh, cover_url } : sh)));
    await supabase.from("exhibitions").update({ cover_url }).eq("id", id);
  }

  return (
    <section style={styles.card}>
      <div style={styles.worksHead}>
        <h2 style={styles.h2}>Exhibitions</h2>
        <span style={styles.composerSecLabel}>{rows.length} show{rows.length === 1 ? "" : "s"}</span>
      </div>

      {adding && (
        <Sheet title="New exhibition" onClose={() => setAdding(false)}>
          <NewExhibitionForm works={works} onSubmit={createExhibition} />
        </Sheet>
      )}

      <div style={styles.workList}>
        {rows.map((sh) => (
          <ExhibitionRow key={sh.id} show={sh} onCoverChange={updateCover} />
        ))}
        {rows.length === 0 && !adding && <p style={styles.empty}>No exhibitions yet.</p>}
      </div>
    </section>
  );
}

function ExhibitionRow({ show, onCoverChange }: { show: StudioExhibition; onCoverChange: (id: string, cover_url: string) => void }) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(supabase, file);
      onCoverChange(show.id, url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={styles.workRow}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <b style={styles.workTitle}>{show.title}</b>
        <span style={styles.workMeta}>
          {show.kind === "solo" ? "Solo" : "Group"} · {show.year ?? "—"} · {show.venue ?? "No venue"} · {show.exhibition_artworks.length} work
          {show.exhibition_artworks.length === 1 ? "" : "s"}
        </span>
      </div>
      <button
        style={{ ...styles.coverBtn, backgroundImage: show.cover_url ? `url(${show.cover_url})` : undefined }}
        onClick={() => fileRef.current?.click()}
        aria-label="Change exhibition cover photo"
        type="button"
      >
        {!show.cover_url && (uploading ? "…" : CAMERA_ICON)}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleCover} />
      </button>
    </div>
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
        {busy ? "Creating..." : "Create exhibition"}
      </button>
    </form>
  );
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
    height: 44,
    borderRadius: 999,
    border: 0,
    background: "#B63878",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14.5,
    cursor: "pointer",
  },
  saveSm: {
    alignSelf: "flex-start",
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
