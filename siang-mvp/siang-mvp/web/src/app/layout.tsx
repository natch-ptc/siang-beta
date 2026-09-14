import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pocket · artist cards",
  description: "Artist cards, ported to Next.js + Supabase",
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
