import Link from "next/link";

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-black">
          <span aria-hidden className="text-xl leading-none">▶◀▶</span>
          Siang
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-black/70 md:flex">
          <a href="#home" className="text-black">Home</a>
          <a href="#artist-hub" className="hover:text-black">Artist Hub</a>
          <a href="#piece-page" className="hover:text-black">Piece Page</a>
          <a href="#pricing" className="hover:text-black">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/mvp" className="hidden text-sm text-black/70 hover:text-black sm:inline">
            Log in
          </Link>
          <Link
            href="/claim-your-link"
            className="rounded-full bg-[#c2397c] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
