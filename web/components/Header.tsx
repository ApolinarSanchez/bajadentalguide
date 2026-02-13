import Link from "next/link";

export function Header() {
  return (
    <header className="siteHeader">
      <div className="container siteHeaderInner">
        <Link href="/" className="siteBrand">
          BajaDentalGuide
        </Link>
        <nav aria-label="Main" className="siteNav">
          <Link href="/clinics" className="siteNavLink">
            Clinics
          </Link>
          <Link href="/procedures" className="siteNavLink">
            Procedures
          </Link>
          <Link href="/neighborhoods" className="siteNavLink">
            Neighborhoods
          </Link>
          <Link href="/shortlist" className="siteNavLink">
            Shortlist
          </Link>
        </nav>
      </div>
    </header>
  );
}
