import type { Metadata } from "next";
import "./globals.css";

// What link previews (LINE, Facebook, Messenger…) show for siang.co. Artist,
// work and exhibition pages set their own title and description; the Open
// Graph fields here only add the site name and language, so previews of those
// pages fall back to their own title and description.
export const metadata: Metadata = {
  metadataBase: new URL("https://www.siang.co"),
  title: "Siang.co ศิลปะฟังได้",
  description: "ฟังเสียงของงานศิลปะ และเรื่องเล่าจากศิลปินเจ้าของผลงาน · Art you can hear, told by the artists who made it.",
  openGraph: { siteName: "Siang.co", locale: "th_TH", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400..900&family=Anuphan:wght@400..600&family=EB+Garamond:ital,wght@0,400..600;1,400..500&family=Noto+Serif+Thai:wght@400..600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
