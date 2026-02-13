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
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Shortlist</h1>
      <SessionEmailCaptureForm
        currentEmail={profile?.email}
        currentOptIn={Boolean(profile?.emailOptIn)}
      />
      {savedClinics.length === 0 ? (
        <>
          <p>No saved clinics yet</p>
          <p>
            <Link href="/clinics">Browse clinics</Link>
          </p>
        </>
      ) : (
        <ul style={{ paddingLeft: 0, listStyle: "none" }}>
          {savedClinics.map((clinic) => (
            <li
              key={clinic.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "0.5rem",
                padding: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <p style={{ marginTop: 0 }}>
                <Link href={`/clinics/${clinic.slug}`}>{clinic.name}</Link>
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <SaveClinicButton
                  clinicId={clinic.id}
                  initialSaved
                  source="clinic_page"
                  showRemoveLabel
                  refreshOnChange
                />
                {clinic.websiteUrl ? (
                  <TrackedOutboundLink href={`/out/${clinic.slug}?dest=website`}>
                    Website
                  </TrackedOutboundLink>
                ) : null}
                {clinic.whatsapp ? (
                  <TrackedOutboundLink href={`/out/${clinic.slug}?dest=whatsapp`}>
                    WhatsApp
                  </TrackedOutboundLink>
                ) : null}
                {clinic.googleMapsUrl ? (
                  <TrackedOutboundLink href={`/out/${clinic.slug}?dest=google`}>
                    Google Listing
                  </TrackedOutboundLink>
                ) : null}
                {clinic.yelpUrl ? (
                  <TrackedOutboundLink href={`/out/${clinic.slug}?dest=yelp`}>Yelp</TrackedOutboundLink>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
