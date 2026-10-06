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
  Eye,
  EyeSlash,
  CaretUp,
  ArrowsOutCardinal,
  PaintBrushBroad,
  CalendarDots,
  CalendarBlank,
  Palette,
  Books,
  Info,
  MagnifyingGlass,
  Fire,
  UserPlus,
  Feather,
  Scan,
  Flag,
  BookmarkSimple,
  Headphones,
  Clock,
  Ticket,
  Ruler,
  SquaresFour,
  Aperture,
  Cube,
  Shapes,
  Scissors,
  FilmSlate,
  SpeakerHigh,
  PersonArmsSpread,
  HandGrabbing,
  Star,
  Backspace,
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
export const EYE_ICON = <Eye size={18} weight="regular" />;
export const MOVE_ICON = <ArrowsOutCardinal size={15} weight="bold" />;
export const UP_ICON = <CaretUp size={14} weight="bold" />;
export const DOWN_ICON = <CaretDown size={14} weight="bold" />;
export const EYE_SLASH_ICON = <EyeSlash size={18} weight="regular" />;

// The tab bar, and the same glyphs at chip size for the tabs on a profile.
export const NAV_ART = <PaintBrushBroad size={26} weight="bold" />;
export const NAV_SHOWS = <CalendarDots size={26} weight="bold" />;
export const NAV_ARTISTS = <Palette size={26} weight="bold" />;
export const NAV_PROFILE = <User size={26} weight="bold" />;

export const ART_CHIP = <PaintBrushBroad size={17} weight="bold" />;
export const SHOWS_CHIP = <CalendarDots size={17} weight="bold" />;
export const COLLECTION_CHIP = <Books size={17} weight="bold" />;
export const ABOUT_CHIP = <Info size={17} weight="bold" />;
export const PIN_CHIP = <MapPin size={17} weight="bold" />;
export const HOT_CHIP = <Fire size={17} weight="bold" />;
export const NEW_ARTIST_CHIP = <UserPlus size={17} weight="bold" />;
export const LEGEND_CHIP = <Feather size={17} weight="bold" />;
export const ALL_CHIP = <SquaresFour size={17} weight="bold" />;

// One glyph per main art type (lib/art-types.ts).
export const ART_TYPE_ICON: Record<string, React.ReactNode> = {
  Painting: <PaintBrushBroad size={17} weight="bold" />,
  Photo: <Aperture size={17} weight="bold" />,
  Sculpture: <HandGrabbing size={17} weight="bold" />,
  Ceramics: <Cube size={17} weight="bold" />,
  Installation: <Shapes size={17} weight="bold" />,
  Textile: <Scissors size={17} weight="bold" />,
  Sound: <SpeakerHigh size={17} weight="bold" />,
  Video: <FilmSlate size={17} weight="bold" />,
  Performance: <PersonArmsSpread size={17} weight="bold" />,
  Other: <Star size={17} weight="bold" />,
};

export const SEARCH_ICON = <MagnifyingGlass size={22} weight="bold" />;
export const SCAN_ICON = <Scan size={22} weight="bold" />;
export const CLOSE_BIG = <X size={28} weight="regular" />;
export const CLOSE_ICON = <X size={18} weight="bold" />;
export const PLUS_SM = <Plus size={11} weight="bold" />;
export const CHECK_SM = <Check size={11} weight="bold" />;
export const PIN_SM = <MapPin size={12} weight="bold" />;
export const CALENDAR_SM = <CalendarBlank size={12} weight="bold" />;
export const CLOCK_ICON = <Clock size={16} weight="bold" />;
export const TICKET_ICON = <Ticket size={16} weight="bold" />;
export const PIN_ICON = <MapPin size={16} weight="bold" />;
export const CALENDAR_ICON = <CalendarBlank size={16} weight="bold" />;
export const RULER_ICON = <Ruler size={16} weight="bold" />;
export const HEADPHONES_ICON = <Headphones size={16} weight="bold" />;
export const SAVE_ICON = <BookmarkSimple size={17} weight="bold" />;
export const SAVED_ICON = <BookmarkSimple size={17} weight="fill" />;
export const FLAG_ICON = <Flag size={14} weight="bold" />;
export const SHARE_ICON = <ShareNetwork size={17} weight="bold" />;
export const DOWNLOAD_BOLD = <DownloadSimple size={17} weight="bold" />;
export const QR_SCAN_ICON = <Scan size={17} weight="bold" />;
export const PLAY_XL = <Play size={28} weight="fill" />;
export const PAUSE_XL = <Pause size={28} weight="fill" />;
export const BACKSPACE_ICON = <Backspace size={24} weight="regular" />;

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
