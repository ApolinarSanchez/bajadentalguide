import Link from "next/link";

export function Header() {
  return (
    <header style={{ borderBottom: "1px solid #ddd", padding: "1rem 2rem", fontFamily: "sans-serif" }}>
      <nav style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link href="/clinics">Clinics</Link>
        <Link href="/procedures">Procedures</Link>
        <Link href="/neighborhoods">Neighborhoods</Link>
        <Link href="/shortlist">Shortlist</Link>
      </nav>
    </header>
  );
}
