// Every functional UI icon in the app, in one place — all from Phosphor
// (https://phosphoricons.com), not hand-rolled paths. Artist "marks" (the
// per-artist card glyphs in marks.ts) and generated artwork line-art
// (artwork-art.ts) are deliberately NOT icons — those stay bespoke.
import {
  MapPin,
  CaretRight,
  CaretLeft,
  CaretDown,
  X,
  ShareNetwork,
  QrCode,
  ArrowsClockwise,
  Play,
  Pause,
  Shuffle,
  SkipBack,
  SkipForward,
  Repeat,
  RepeatOnce,
  InstagramLogo,
  ChatCircleDots,
  EnvelopeSimple,
  Globe,
  Camera,
  User,
  PencilSimple,
  Trash,
  Plus,
  Check,
  SignOut,
  MusicNotes,
  Image as ImageIcon,
  VideoCamera,
  TextAlignLeft,
  LinkSimple,
  DotsThreeVertical,
  DownloadSimple,
} from "@phosphor-icons/react/dist/ssr";

export const PIN = <MapPin size={13} weight="fill" />;
export const CHEV = <CaretRight size={14} weight="bold" />;
export const CLOSE_GLYPH = <X size={13} weight="bold" />;
export const SHARE_GLYPH = <ShareNetwork size={19} weight="regular" />;
export const QR_GLYPH = <QrCode size={15} weight="regular" />;
export const QR_GLYPH_BIG = <QrCode size={21} weight="regular" />;
export const BACK_GLYPH = <ArrowsClockwise size={15} weight="regular" />;

export const PLAY_SVG = <Play size={17} weight="fill" />;
export const PAUSE_SVG = <Pause size={17} weight="fill" />;
export const PLAY_BIG = <Play size={24} weight="fill" />;
export const PAUSE_BIG = <Pause size={24} weight="fill" />;
export const SHUFFLE_SVG = <Shuffle size={23} weight="bold" />;
export const PREV_SVG = <SkipBack size={26} weight="fill" />;
export const NEXT_SVG = <SkipForward size={26} weight="fill" />;
export const REPEAT_SVG = <Repeat size={23} weight="bold" />;
export const REPEAT_ONE_SVG = <RepeatOnce size={23} weight="bold" />;
export const BACK_CHEVRON_SVG = <CaretLeft size={18} weight="bold" />;
export const CHEVRON_DOWN_SVG = <CaretDown size={18} weight="bold" />;

export const CAMERA_ICON = <Camera size={21} weight="regular" />;
export const USER_ICON = <User size={18} weight="regular" />;
export const EDIT_ICON = <PencilSimple size={14} weight="bold" />;
export const DELETE_ICON = <Trash size={14} weight="bold" />;
export const ADD_ICON = <Plus size={14} weight="bold" />;
export const CHECK_ICON = <Check size={14} weight="bold" />;
export const SIGN_OUT_ICON = <SignOut size={14} weight="bold" />;
export const MUSIC_ICON = <MusicNotes size={16} weight="regular" />;
export const IMAGE_ICON = <ImageIcon size={20} weight="regular" />;
export const VIDEO_ICON = <VideoCamera size={16} weight="regular" />;
export const TEXT_ICON = <TextAlignLeft size={16} weight="regular" />;
export const LINK_ICON = <LinkSimple size={15} weight="regular" />;
export const KEBAB_ICON = <DotsThreeVertical size={18} weight="bold" />;
export const DOWNLOAD_ICON = <DownloadSimple size={15} weight="regular" />;

const CONTACT_ICON: Record<string, React.ReactNode> = {
  ig: <InstagramLogo size={14} weight="regular" />,
  line: <ChatCircleDots size={14} weight="regular" />,
  email: <EnvelopeSimple size={14} weight="regular" />,
  web: <Globe size={14} weight="regular" />,
};

const CONTACT_LABEL: Record<string, string> = { ig: "Instagram", line: "LINE", email: "Email", web: "Website" };

const CONTACT_HREF: Record<string, (v: string) => string> = {
  ig: (v) => "https://instagram.com/" + v.replace(/^@/, ""),
  line: (v) => "https://line.me/ti/p/~" + v,
  email: (v) => "mailto:" + v,
  web: (v) => (/^https?:/i.test(v) ? v : "https://" + v),
};

export function contactIcon(kind: string) {
  return CONTACT_ICON[kind];
}
export function contactLabel(kind: string) {
  return CONTACT_LABEL[kind] ?? kind;
}
export function contactHref(kind: string, value: string) {
  return (CONTACT_HREF[kind] ?? ((v: string) => v))(value);
}
