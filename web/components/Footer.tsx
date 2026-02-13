import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #ddd",
        padding: "1rem 2rem 2rem",
        fontFamily: "sans-serif",
        marginTop: "2rem",
      }}
    >
      <nav style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/review-policy">Review Policy</Link>
        <Link href="/methodology">Methodology</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>
      <p style={{ margin: 0 }}>
        BajaDentalGuide provides information and user reviews. Not medical advice.
      </p>
    </footer>
  );
}
