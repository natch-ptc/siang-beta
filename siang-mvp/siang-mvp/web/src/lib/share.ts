import { slugify } from "./slug";
import type { ArtistCard, Artwork } from "./types";

export type ShareTarget =
  | { kind: "artist"; artist: ArtistCard }
  | { kind: "work"; artist: ArtistCard; work: Artwork }
  | { kind: "exhibition"; artist: ArtistCard; showIndex: number };

export function shareInfo(target: ShareTarget) {
  if (target.kind === "artist") {
    const { artist } = target;
    return {
      title: artist.name,
      subtitle: [artist.based, artist.country].filter(Boolean).join(", "),
      url: `https://siang.co/${artist.slug}`,
      file: `siang-${artist.slug}`,
    };
  }
  if (target.kind === "work") {
    const { artist, work } = target;
    return {
      title: work.title,
      subtitle: artist.name,
      url: `https://siang.co/${artist.slug}/${work.id}`,
      file: `siang-${work.code}`,
    };
  }
  const { artist, showIndex } = target;
  const show = artist.shows[showIndex];
  const showSlug = slugify(show.title) || `show-${showIndex + 1}`;
  return {
    title: show.title,
    subtitle: artist.name,
    url: `https://siang.co/${artist.slug}/shows/${showSlug}`,
    file: `siang-${artist.slug}-${showSlug}`,
  };
}
