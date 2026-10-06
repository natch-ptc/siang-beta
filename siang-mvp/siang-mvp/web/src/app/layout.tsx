import type { Metadata, Viewport } from "next";
import TabBar from "@/components/TabBar";
import "./globals.css";

// What link previews (LINE, Facebook, Messenger…) show for siang.co. Artist,
// work and exhibition pages set their own title and description; the Open
// Graph fields here only add the site name and language, so previews of those
// pages fall back to their own title and description.
export const metadata: Metadata = {
  metadataBase: new URL("https://www.siang.co"),
  title: "Siang.co ศิลปะฟังได้",
  description: "ฟังเสียงของงานศิลปะ และเรื่องเล่าจากศิลปินเจ้าของผลงาน · Art, artists and places in one place, with sound.",
  openGraph: { siteName: "Siang.co", locale: "th_TH", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Outfit for the interface, Prompt for Thai, as in the Draft-1 design. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300..700&family=Prompt:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <TabBar />
      </body>
    </html>
  );
}
