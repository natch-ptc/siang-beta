import Link from "next/link";
import Logo from "@/components/Logo";
import app from "@/components/app.module.css";

// Shown for an address nobody has: an unknown artist, work or exhibition.
export default function NotFound() {
  return (
    <main className={`${app.app} ${app.appBare}`}>
      <header className={app.top}>
        <Link href="/" className={app.logoLink}>
          <Logo height={30} />
        </Link>
      </header>
      <div className={app.empty}>
        <h2>Nothing at this address</h2>
        <p>Check the link, or type the six-digit code printed on the label.</p>
        <div className={app.emptyActs}>
          <Link href="/" className={app.btn}>
            Explore art
          </Link>
          <Link href="/w" className={app.btnGhost}>
            Type a code
          </Link>
        </div>
      </div>
    </main>
  );
}
