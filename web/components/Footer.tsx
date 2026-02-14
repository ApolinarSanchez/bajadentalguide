import Link from "next/link";

export function Footer() {
  return (
    <footer className="siteFooter">
      <div className="container siteFooterInner">
        <nav aria-label="Footer" className="siteFooterNav">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/review-policy">Review Policy</Link>
          <Link href="/methodology">Methodology</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        <p className="siteDisclaimer">
          BajaDentalGuide provides information and user reviews. Not medical advice.
        </p>
        <p className="siteAttribution">
          Fuente: INEGI, Directorio Estadístico Nacional de Unidades Económicas (DENUE). BDG
          transforms this source data for directory use, and INEGI does not endorse
          BajaDentalGuide.
        </p>
      </div>
    </footer>
  );
}
