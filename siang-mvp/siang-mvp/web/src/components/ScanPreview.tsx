"use client";

import { CaretRight } from "@phosphor-icons/react";
import { CLOSE_ICON } from "@/lib/icons";
import { createClient } from "@/lib/supabase/client";
import Spinner from "./Spinner";
import styles from "./ScanPreview.module.css";

// What a scanned QR code points at, shown as a card before the page opens.
export type Preview = {
  kind: "artist" | "work";
  name: string; // the artist
  handle: string;
  avatar: string | null;
  title?: string; // the work
  cover?: string | null;
};

type ArtistRow = { name: string; slug: string; avatar_url: string | null };
type WorkRow = { title: string; cover_url: string | null; artists: ArtistRow | null };

// Looks up who or what a Siang path leads to: an artist (/handle), a work
// (/handle/work-id) or a work's code (/w/123456). Null when it is none of
// these, or can't be found, and the caller just opens the path.
export async function lookupPreview(path: string): Promise<Preview | null> {
  const parts = path
    .split(/[?#]/)[0]
    .split("/")
    .filter(Boolean)
    .map((p) => decodeURIComponent(p));
  const supabase = createClient();
  try {
    if (parts.length === 1) {
      const { data } = await supabase.from("artists").select("name, slug, avatar_url").eq("slug", parts[0].toLowerCase()).maybeSingle<ArtistRow>();
      return data ? { kind: "artist", name: data.name, handle: data.slug, avatar: data.avatar_url } : null;
    }
    if (parts.length !== 2) return null;
    const works = supabase.from("artworks");
    const { data } =
      parts[0] === "w"
        ? await works.select("title, cover_url, artists ( name, slug, avatar_url )").eq("code", parts[1]).maybeSingle<WorkRow>()
        : await works
            .select("title, cover_url, artists!inner ( name, slug, avatar_url )")
            .eq("slug", parts[1])
            .eq("artists.slug", parts[0].toLowerCase())
            .maybeSingle<WorkRow>();
    const artist = data?.artists;
    return data && artist ? { kind: "work", name: artist.name, handle: artist.slug, avatar: artist.avatar_url, title: data.title, cover: data.cover_url } : null;
  } catch {
    return null;
  }
}

// Rises over the camera; tapping it opens the page, the X goes back to scanning.
export default function ScanPreview({
  preview,
  onOpen,
  onDismiss,
}: {
  preview: Preview | null; // null while it is still being looked up
  onOpen: () => void;
  onDismiss: () => void;
}) {
  if (!preview) {
    return (
      <div className={`${styles.card} ${styles.loading}`} role="status">
        <Spinner size={18} label="Looking it up" />
        <span>Found a Siang code…</span>
      </div>
    );
  }
  const isWork = preview.kind === "work";
  const picture = isWork ? preview.cover : preview.avatar;
  return (
    <div className={styles.wrap}>
      <button className={styles.card} onClick={onOpen} type="button">
        {picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={isWork ? styles.cover : styles.avatar} src={picture} alt="" />
        ) : (
          <span className={styles.avatar} aria-hidden="true">
            {[...preview.name.trim()][0]?.toUpperCase()}
          </span>
        )}
        <span className={styles.text}>
          <span className={styles.kicker}>{isWork ? "Work" : "Artist"}</span>
          <span className={styles.name}>{isWork ? preview.title : preview.name}</span>
          <span className={styles.sub}>{isWork ? `${preview.name} · @${preview.handle}` : `@${preview.handle}`}</span>
        </span>
        <span className={styles.open}>
          Open <CaretRight size={14} weight="bold" />
        </span>
      </button>
      <button className={styles.dismiss} onClick={onDismiss} aria-label="Scan again" type="button">
        {CLOSE_ICON}
      </button>
    </div>
  );
}
