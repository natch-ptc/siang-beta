// The main art types an artist picks from (PRD 7.1), and the filter chips on
// the Exploring tab.
export const ART_TYPES = [
  "Painting",
  "Photo",
  "Sculpture",
  "Ceramics",
  "Installation",
  "Textile",
  "Sound",
  "Video",
  "Performance",
  "Other",
] as const;

export type ArtType = (typeof ART_TYPES)[number];

// Artists who joined before the list existed typed their discipline freely
// ("Ceramics and sound"); the first listed type it mentions is theirs.
export function artTypeOf(discipline: string): ArtType {
  const d = discipline.toLowerCase();
  return ART_TYPES.find((t) => d.includes(t.toLowerCase())) ?? "Other";
}
