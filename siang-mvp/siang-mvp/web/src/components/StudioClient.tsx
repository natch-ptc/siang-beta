"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { clock, secs } from "@/lib/format";
import { SIGN_OUT_ICON, EDIT_ICON, DELETE_ICON, ADD_ICON, CHECK_ICON, CAMERA_ICON, BACK_CHEVRON_SVG } from "@/lib/icons";
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
  title: string;
  duration_sec: number | null;
  description: string | null;
  cover_url: string | null;
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
// supabase/migrations/0004_storage.sql) and returns the public URL.
async function uploadPhoto(supabase: SupabaseClient, file: File): Promise<string> {
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
          <ProfileEditor artist={artist} contacts={contacts} />
          <WorksSection artistId={artist.id} works={works} />
          <ExhibitionsSection artistId={artist.id} works={works} shows={shows} />
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

function ProfileEditor({ artist, contacts }: { artist: StudioArtist; contacts: StudioContact[] }) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(artist.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
      const url = await uploadPhoto(supabase, file);
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

      {!editing ? (
        <>
          {artist.bio && <p style={{ ...styles.sub, marginTop: 14, color: "rgba(0,0,0,.78)" }}>{artist.bio}</p>}
          {contacts.length > 0 && (
            <div style={styles.chipRow}>
              {contacts.map((c) => (
                <span key={c.kind} style={styles.chip}>
                  {c.kind === "ig" ? "Instagram" : c.kind === "line" ? "LINE" : c.kind === "email" ? "Email" : "Website"}: {c.value}
                </span>
              ))}
            </div>
          )}
          {saved && <span style={{ ...styles.savedTag, display: "block", marginTop: 10 }}>Saved</span>}
        </>
      ) : (
        <div style={{ ...styles.form, marginTop: 18 }}>
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
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...styles.saveSm, display: "inline-flex", alignItems: "center", gap: 6 }} onClick={save} disabled={busy}>
              {!busy && CHECK_ICON} {busy ? "Saving..." : "Save profile"}
            </button>
            <button style={styles.rowBtn} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function WorksSection({ artistId, works }: { artistId: string; works: StudioArtwork[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [rows, setRows] = useState(works);
  const [adding, setAdding] = useState(false);

  async function addWork(title: string, duration: string, description: string) {
    const slug = slugify(title) || `work-${Date.now()}`;
    const { data, error } = await supabase
      .from("artworks")
      .insert({
        artist_id: artistId,
        slug,
        code: makeCode(),
        title,
        duration_sec: duration ? secs(duration) : null,
        description: description || null,
        sort_order: rows.length,
      })
      .select("id, title, duration_sec, description, cover_url, listen_count, sort_order")
      .single();
    if (!error && data) {
      setRows((r) => [...r, data as StudioArtwork]);
    }
    setAdding(false);
    router.refresh();
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
        <h2 style={styles.h2}>Works ({rows.length})</h2>
        <button style={{ ...styles.addBtn, display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => setAdding((a) => !a)}>
          {!adding && ADD_ICON} {adding ? "Cancel" : "Add work"}
        </button>
      </div>

      {adding && <AddWorkForm onSubmit={addWork} />}

      <div style={styles.workList}>
        {rows.map((w) => (
          <WorkRow key={w.id} work={w} onUpdate={updateWork} onDelete={deleteWork} />
        ))}
        {rows.length === 0 && !adding && <p style={styles.empty}>No works yet.</p>}
      </div>
    </section>
  );
}

function AddWorkForm({ onSubmit }: { onSubmit: (title: string, duration: string, description: string) => void }) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");

  return (
    <form
      style={{ ...styles.form, marginBottom: 18 }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(title, duration, description);
      }}
    >
      <Field label="Title">
        <input style={styles.input} required value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Duration (m:ss)">
        <input style={styles.input} placeholder="3:12" value={duration} onChange={(e) => setDuration(e.target.value)} />
      </Field>
      <Field label="Description">
        <textarea style={styles.textarea} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <p style={styles.hint}>You can add a cover photo after creating the work — until then it shows generated line art.</p>
      <button style={styles.saveSm} type="submit">
        Add
      </button>
    </form>
  );
}

function WorkRow({
  work,
  onUpdate,
  onDelete,
}: {
  work: StudioArtwork;
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

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(supabase, file);
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
        <button style={{ ...styles.rowBtn, display: "inline-flex", alignItems: "center", gap: 5 }} onClick={() => setEditing(true)}>
          {EDIT_ICON} Edit
        </button>
        <button style={{ ...styles.rowBtnDanger, display: "inline-flex", alignItems: "center", gap: 5 }} onClick={() => onDelete(work.id)}>
          {DELETE_ICON} Delete
        </button>
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

function ExhibitionsSection({ artistId, works, shows }: { artistId: string; works: StudioArtwork[]; shows: StudioExhibition[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [rows, setRows] = useState(shows);
  const [adding, setAdding] = useState(false);

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
        <h2 style={styles.h2}>Exhibitions ({rows.length})</h2>
        <button style={{ ...styles.addBtn, display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => setAdding((a) => !a)}>
          {!adding && ADD_ICON} {adding ? "Cancel" : "New exhibition"}
        </button>
      </div>

      {adding && <NewExhibitionForm works={works} onSubmit={createExhibition} />}

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
      const url = await uploadPhoto(supabase, file);
      onCoverChange(show.id, url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={styles.workRow}>
      <button
        style={{ ...styles.thumb, backgroundImage: show.cover_url ? `url(${show.cover_url})` : undefined }}
        onClick={() => fileRef.current?.click()}
        aria-label="Change exhibition cover photo"
        type="button"
      >
        {!show.cover_url && (uploading ? "…" : CAMERA_ICON)}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleCover} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <b style={styles.workTitle}>{show.title}</b>
        <span style={styles.workMeta}>
          {show.kind === "solo" ? "Solo" : "Group"} · {show.year ?? "—"} · {show.venue ?? "No venue"} · {show.exhibition_artworks.length} work
          {show.exhibition_artworks.length === 1 ? "" : "s"}
        </span>
      </div>
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

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background: "linear-gradient(180deg,#E9E9E7 0%,#E9E9E7 22%,#B8B8B6 100%)",
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
    background: "rgba(0,0,0,.06)",
    color: "rgba(0,0,0,.7)",
    textDecoration: "none",
  },
  email: { fontSize: 12.5, color: "rgba(0,0,0,.5)" },
  signOut: {
    height: 32,
    padding: "0 14px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,.14)",
    background: "rgba(255,255,255,.6)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  card: {
    maxWidth: 520,
    margin: "0 auto 16px",
    background: "#fff",
    borderRadius: 20,
    padding: "24px",
    boxShadow: "0 20px 60px -30px rgba(0,0,0,.3)",
  },
  profileHead: { display: "flex", alignItems: "center", gap: 16 },
  avatarBtn: {
    width: 64,
    height: 64,
    borderRadius: 999,
    flex: "none",
    border: "1px solid rgba(0,0,0,.12)",
    background: "rgba(0,0,0,.04) center/cover no-repeat",
    display: "grid",
    placeItems: "center",
    color: "rgba(0,0,0,.5)",
    cursor: "pointer",
  },
  h1: { fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em" },
  h2: { fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em" },
  sub: { fontSize: 13.5, color: "rgba(0,0,0,.55)", marginTop: 6 },
  hint: { fontSize: 12.5, color: "rgba(0,0,0,.45)", margin: 0 },
  fldH: { fontSize: 15, fontWeight: 800, letterSpacing: "-0.025em", marginTop: 8 },
  form: { display: "flex", flexDirection: "column", gap: 12, marginTop: 18 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "rgba(0,0,0,.7)" },
  input: {
    height: 42,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,.14)",
    padding: "0 12px",
    fontSize: 14.5,
    fontFamily: "inherit",
  },
  textarea: {
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,.14)",
    padding: "10px 12px",
    fontSize: 14.5,
    fontFamily: "inherit",
    resize: "vertical",
  },
  error: { fontSize: 13, color: "#B63878", margin: "10px 0 0" },
  submit: {
    height: 44,
    borderRadius: 999,
    border: 0,
    background: "#000",
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
    background: "#000",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
  },
  savedTag: { fontSize: 12.5, color: "#1F5340", fontWeight: 600 },
  worksHead: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  addBtn: {
    height: 34,
    padding: "0 14px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,.14)",
    background: "rgba(0,0,0,.04)",
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
    borderBottom: "1px solid rgba(0,0,0,.08)",
  },
  workRowEditing: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "12px 4px",
    borderBottom: "1px solid rgba(0,0,0,.08)",
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    flex: "none",
    border: "1px solid rgba(0,0,0,.12)",
    background: "rgba(0,0,0,.04) center/cover no-repeat",
    display: "grid",
    placeItems: "center",
    color: "rgba(0,0,0,.5)",
    cursor: "pointer",
  },
  workTitle: { display: "block", fontSize: 14.5, fontWeight: 600 },
  workMeta: { display: "block", fontSize: 12.5, color: "rgba(0,0,0,.5)", marginTop: 2 },
  rowBtn: {
    height: 30,
    padding: "0 12px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,.14)",
    background: "none",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  rowBtnDanger: {
    height: 30,
    padding: "0 12px",
    borderRadius: 999,
    border: "1px solid rgba(182,56,120,.3)",
    background: "none",
    color: "#B63878",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  empty: { fontSize: 13.5, color: "rgba(0,0,0,.5)" },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: {
    fontSize: 12.5,
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(0,0,0,.05)",
    color: "rgba(0,0,0,.65)",
  },
  chipActive: {
    height: 36,
    padding: "0 16px",
    borderRadius: 999,
    border: "1px solid #000",
    background: "#000",
    color: "#fff",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  chipInactive: {
    height: 36,
    padding: "0 16px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,.14)",
    background: "none",
    color: "rgba(0,0,0,.7)",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  checkRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "rgba(0,0,0,.8)" },
};
