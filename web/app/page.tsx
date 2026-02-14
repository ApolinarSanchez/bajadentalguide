import Link from "next/link";

export default function Home() {
  return (
    <div className="stack">
      <section className="card stack">
        <header className="pageHeader">
          <div className="pageTitleRow">
            <h1>BajaDentalGuide</h1>
            <span className="badge">Dental directory</span>
          </div>
          <p className="pageSubtitle">
            Discover and compare dental clinics in Tijuana and nearby
            neighborhoods, save your shortlist, and read moderated BDG reviews.
          </p>
        </header>
        <div className="row">
          <Link className="btn btnPrimary" href="/clinics">
            Browse clinics
          </Link>
          <Link className="btn btnSecondary" href="/procedures">
            Browse procedures
          </Link>
          <Link className="btn btnGhost" href="/shortlist">
            View shortlist
          </Link>
        </div>
      </section>

      <section aria-labelledby="home-features-heading" className="stack">
        <h2 id="home-features-heading">How it works</h2>
        <ul className="cards">
          <li className="card stack">
            <h3>Find clinics</h3>
            <p>
              Search clinics by neighborhood and procedure, then compare contact
              options and listing details in one place.
            </p>
          </li>
          <li className="card stack">
            <h3>Save your shortlist</h3>
            <p>
              Keep your top options in a shortlist so you can revisit and decide
              when you are ready.
            </p>
          </li>
          <li className="card stack">
            <h3>Share reviews</h3>
            <p>
              Submit your experience to help other patients. Reviews are
              user-submitted and moderated before publishing.
            </p>
          </li>
        </ul>
      </section>

      <p className="alert">
        Not medical advice. Always confirm details directly with the clinic.
      </p>
    </div>
  );
}
