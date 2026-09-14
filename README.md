# Siang (เสียง)

**Art you can hear.** Siang pairs artists and their works with sound — one tap or scan away.

Artists publish a card: a visual identity, a bio, their works, and the exhibitions they've shown in. Each work carries its own recording. Visitors collect cards into a personal "Pocket," scan a printed QR to add one on the spot, and listen straight from the piece.

> This repo also holds the project's original single-file HTML/CSS/JS mockup (`index.html`) — the working app is the Next.js + Supabase port under [`siang-mvp/siang-mvp/web`](siang-mvp/siang-mvp/web).

## Features

- **Card stack** — swipe through your collected artist cards
- **Artist detail** — a flippable card with a real, scannable QR code, bio, contacts, works, and exhibitions
- **Exhibitions** — every work shown together, with a play-all queue
- **Player** — mini player + full "Now Playing" screen with shuffle, repeat, and scrubbing
- **Scanner** — decodes a card's QR from the camera, a pasted link, or a typed six-digit work code, and adds the artist to your Pocket
- **Share** — copy a link, use native share, or download a printable QR for any artist, work, or exhibition
- **Studio** — artists sign in, manage their profile and works, and upload real photos that replace the generated line-art
- **Generative art** — every work without a photo gets its own line-art drawing, generated from the artist's card motif

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript)
- [Supabase](https://supabase.com) — Postgres, Auth, Storage, Row Level Security
- [Phosphor Icons](https://phosphoricons.com)
- [jsQR](https://github.com/cozmo/jsQR) for real camera-based QR scanning
- [qrcode.react](https://github.com/zpao/qrcode.react) for generating scannable codes

## Getting started

```bash
cd siang-mvp/siang-mvp/web
npm install
cp .env.local.example .env.local   # fill in your Supabase project's URL + anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Setting up the database

Run the migrations against your Supabase project in order, then seed some sample data:

```bash
cd siang-mvp/siang-mvp/web
npx tsx scripts/run-sql.ts ../supabase/migrations/0001_init.sql
npx tsx scripts/run-sql.ts ../supabase/migrations/0002_artist_self_signup.sql
npx tsx scripts/run-sql.ts ../supabase/migrations/0003_harden_policies.sql
npx tsx scripts/run-sql.ts ../supabase/migrations/0004_storage.sql
npx tsx scripts/run-sql.ts ../supabase/seed.sql
npx tsx scripts/run-sql.ts ../supabase/seed_available.sql
```

`run-sql.ts` connects directly to Postgres using `DATABASE_URL` in `.env.local` — no dashboard copy-paste needed.

## Project structure

```
siang-mvp/siang-mvp/
├── index.html              the original single-file mockup
├── supabase/
│   ├── migrations/         schema, RLS policies, storage bucket
│   ├── seed.sql            the 7 artists in everyone's Pocket by default
│   └── seed_available.sql  3 more artists, discoverable only by scanning
└── web/                    the Next.js app
    ├── scripts/            run-sql.ts, generate-seed.ts
    └── src/
        ├── app/            routes: /, /login, /studio
        ├── components/     CardStack, DetailSheet, ExhibitionSheet,
        │                   Scanner, ShareSheet, Now Playing, Studio…
        └── lib/            Supabase clients, queries, generative art,
                             player state, types
```

## Database schema

- `artists` — profile, card colors, contact info
- `artworks` — one work, with a duration, description, listen count, and a six-digit scan code
- `exhibitions` — a show, with the works hung in it (`exhibition_artworks`)
- `plays` — a listen log backing each work's cached `listen_count`
- Row Level Security throughout: public read, writes restricted to the signed-in artist who owns the row
