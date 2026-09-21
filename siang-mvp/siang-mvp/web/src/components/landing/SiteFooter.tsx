import Image from "next/image";
import Link from "next/link";
import styles from "./SiteFooter.module.css";
import { BETA_PATH } from "@/lib/beta";

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Artist Hub", href: "/#artist-hub" },
      { label: "Piece Page", href: "/#piece-page" },
      { label: "Pricing", href: "/#pricing" },
      { label: "The app", href: BETA_PATH },
    ],
  },
  {
    heading: "For",
    links: [
      { label: "Artists", href: "/#artist-hub" },
      { label: "Galleries and festivals", href: "/#pricing" },
      { label: "Visitors", href: "/#piece-page" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "mailto:siangplatform@gmail.com" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy and PDPA", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Report a page", href: "#" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <Link href="/" className={styles.footerLogo}>
          <Image src="/siang-logo.png" alt="Siang" width={1899} height={429} className={styles.footerLogoImg} />
        </Link>

        <div className={styles.footerColumns}>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className={styles.footerColHeading}>{col.heading}</p>
              <ul className={styles.footerColLinks}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.footerStores}>
          <span className={styles.footerStorePill}>Download on the App Store</span>
          <span className={styles.footerStorePill}>Get it on Google Play</span>
        </div>

        <div className={styles.footerLegal}>
          <p>ONEPUT TECHNOLOGY COMPANY LIMITED</p>
          <p>Registration 0105568157196</p>
          <p>1071/113 Bang Khun Thian to Chai Thale Road, Tha Kham, Bang Khun Thian, Bangkok 10150</p>
          <p>
            <a href="mailto:siangplatform@gmail.com">siangplatform@gmail.com</a>
          </p>
          <p>
            <a href="tel:0909868694">090 986 8694</a>
          </p>
        </div>
        <p className={styles.footerCopyright}>© {new Date().getFullYear()} ONEPUT TECHNOLOGY COMPANY LIMITED</p>
      </div>
    </footer>
  );
}
