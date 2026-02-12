import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>BajaDentalGuide</h1>
      <p>Placeholder home page for the BajaDentalGuide app.</p>
      <ul>
        <li>
          <Link href="/clinics">Clinics</Link>
        </li>
        <li>
          <Link href="/shortlist">Shortlist</Link>
        </li>
        <li>
          <Link href="/review-policy">Review Policy</Link>
        </li>
      </ul>
    </main>
  );
}
