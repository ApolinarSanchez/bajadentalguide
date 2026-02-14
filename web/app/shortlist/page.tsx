import { SaveClinicButton } from "@/components/SaveClinicButton";
import { SessionEmailCaptureForm } from "@/components/SessionEmailCaptureForm";
import { TrackedOutboundLink } from "@/components/TrackedOutboundLink";
import { db } from "@/lib/db";
import { getSessionIdFromCookies } from "@/lib/session";
import { listSavedClinics } from "@/lib/shortlist";
import { cookies } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ShortlistPage() {
  const sessionId = getSessionIdFromCookies(await cookies());
  const savedClinics = sessionId ? await listSavedClinics(sessionId) : [];
  const profile = sessionId
    ? await db.sessionProfile.findUnique({
        where: {
          sessionId,
        },
        select: {
          email: true,
          emailOptIn: true,
        },
      })
    : null;

  return (
    <section className="stack">
      <header className="pageHeader stack">
        <div className="pageTitleRow">
          <h1>Shortlist</h1>
        </div>
        <p className="pageSubtitle">
          Keep track of clinics you want to revisit and manage your reminder preferences.
        </p>
      </header>

      <SessionEmailCaptureForm
        currentEmail={profile?.email}
        currentOptIn={Boolean(profile?.emailOptIn)}
      />

      <section className="stack">
        <h2>Saved clinics</h2>
        {savedClinics.length === 0 ? (
          <section className="card stack">
            <p>
              <strong>No saved clinics yet</strong>
            </p>
            <p>Add clinics from the directory to compare your top options in one place.</p>
            <p>
              <Link href="/clinics" className="btn btnPrimary">
                Browse clinics
              </Link>
            </p>
          </section>
        ) : (
          <ul className="cards">
            {savedClinics.map((clinic) => (
              <li key={clinic.id} className="card stack">
                <p className="clinicsCardTitle">
                  <Link href={`/clinics/${clinic.slug}`}>{clinic.name}</Link>
                </p>
                <div className="clinicsActions">
                  <SaveClinicButton
                    clinicId={clinic.id}
                    initialSaved
                    source="clinic_page"
                    showRemoveLabel
                    refreshOnChange
                    className="btn btnDanger btnSm"
                  />
                  {clinic.websiteUrl ? (
                    <TrackedOutboundLink
                      href={`/out/${clinic.slug}?dest=website`}
                      className="btn btnSecondary btnSm"
                    >
                      Website
                    </TrackedOutboundLink>
                  ) : null}
                  {clinic.whatsapp ? (
                    <TrackedOutboundLink
                      href={`/out/${clinic.slug}?dest=whatsapp`}
                      className="btn btnSecondary btnSm"
                    >
                      WhatsApp
                    </TrackedOutboundLink>
                  ) : null}
                  {clinic.googleMapsUrl ? (
                    <TrackedOutboundLink
                      href={`/out/${clinic.slug}?dest=google`}
                      className="btn btnSecondary btnSm"
                    >
                      Google Listing
                    </TrackedOutboundLink>
                  ) : null}
                  {clinic.yelpUrl ? (
                    <TrackedOutboundLink
                      href={`/out/${clinic.slug}?dest=yelp`}
                      className="btn btnSecondary btnSm"
                    >
                      Yelp
                    </TrackedOutboundLink>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
