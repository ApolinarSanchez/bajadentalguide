import Link from "next/link";
import { SaveClinicButton } from "@/components/SaveClinicButton";
import { TrackedOutboundLink } from "@/components/TrackedOutboundLink";
import { db } from "@/lib/db";
import { buildClinicQuery } from "@/lib/clinics/buildClinicQuery";
import { parseClinicFilters } from "@/lib/clinics/parseClinicFilters";
import { getSessionIdFromCookies } from "@/lib/session";
import { buildSavedSet } from "@/lib/shortlist";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

type ClinicsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClinicsPage({ searchParams }: ClinicsPageProps) {
  const filters = parseClinicFilters(await searchParams);
  const sessionId = getSessionIdFromCookies(await cookies());
  const [neighborhoods, procedures] = await Promise.all([
    db.neighborhood.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
    db.procedure.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);
  const query = buildClinicQuery(filters);

  const clinics = await db.clinic.findMany({
    where: query.where,
    orderBy: query.orderBy,
    select: {
      id: true,
      name: true,
      slug: true,
      websiteUrl: true,
      whatsapp: true,
      googleMapsUrl: true,
      yelpUrl: true,
    },
  });

  const savedRows = sessionId
    ? await db.savedClinic.findMany({
        where: {
          sessionId,
        },
        select: {
          clinicId: true,
        },
      })
    : [];
  const savedClinicIds = buildSavedSet(savedRows);

  return (
    <section className="stack">
      <header className="pageHeader stack">
        <div className="pageTitleRow">
          <h1>Clinics</h1>
        </div>
        <p className="pageSubtitle">
          Browse Baja clinic profiles and filter by services and listing availability.
        </p>
      </header>

      <div className="directoryLayout">
        <aside className="directorySidebar">
          <form method="get" className="card stack">
            <div className="field">
              <label htmlFor="clinics-search-q">Search clinics</label>
              <input id="clinics-search-q" name="q" type="search" defaultValue={filters.q} />
            </div>

            <div className="field">
              <span>Listing options</span>
              <div className="checkboxGroup">
                <label className="checkboxLabel">
                  <input
                    type="checkbox"
                    name="hasWebsite"
                    value="1"
                    defaultChecked={filters.hasWebsite}
                  />
                  Has website
                </label>
                <label className="checkboxLabel">
                  <input
                    type="checkbox"
                    name="hasWhatsapp"
                    value="1"
                    defaultChecked={filters.hasWhatsapp}
                  />
                  Has WhatsApp
                </label>
                <label className="checkboxLabel">
                  <input
                    type="checkbox"
                    name="hasGoogle"
                    value="1"
                    defaultChecked={filters.hasGoogle}
                  />
                  Has Google
                </label>
                <label className="checkboxLabel">
                  <input type="checkbox" name="hasYelp" value="1" defaultChecked={filters.hasYelp} />
                  Has Yelp
                </label>
                <label className="checkboxLabel">
                  <input
                    type="checkbox"
                    name="includeUnverified"
                    value="1"
                    defaultChecked={filters.includeUnverified}
                  />
                  Include unverified listings
                </label>
              </div>
            </div>

            <div className="field">
              <label htmlFor="clinics-sort">Sort</label>
              <select id="clinics-sort" name="sort" defaultValue={filters.sort}>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="clinics-neighborhood">Neighborhood</label>
              <select
                id="clinics-neighborhood"
                name="neighborhood"
                defaultValue={filters.neighborhood ?? ""}
              >
                <option value="">All neighborhoods</option>
                {neighborhoods.map((neighborhood) => (
                  <option key={neighborhood.id} value={neighborhood.slug}>
                    {neighborhood.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="clinics-procedure">Procedure</label>
              <select id="clinics-procedure" name="procedure" defaultValue={filters.procedure ?? ""}>
                <option value="">All procedures</option>
                {procedures.map((procedure) => (
                  <option key={procedure.id} value={procedure.slug}>
                    {procedure.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btnPrimary clinicsApplyButton">
              Apply filters
            </button>
          </form>

          <p className="alert">
            Note: External links (clinic websites, WhatsApp, and third‑party listings) are provided
            for convenience. BajaDentalGuide does not import third‑party review content into BDG
            ratings. This site does not provide medical advice.
          </p>
        </aside>

        <section className="stack">
          <div className="row">
            <span data-testid="results-count" className="badge">
              Results: {clinics.length}
            </span>
          </div>

          {clinics.length === 0 ? (
            <p className="card">No clinics found. Seed the database to load clinic listings.</p>
          ) : (
            <ul className="cards">
              {clinics.map((clinic) => (
                <li key={clinic.id} data-testid="clinic-item" className="card stack">
                  <p className="clinicsCardTitle">
                    <Link href={`/clinics/${clinic.slug}`}>{clinic.name}</Link>
                  </p>
                  <div className="clinicsActions">
                    <SaveClinicButton
                      clinicId={clinic.id}
                      initialSaved={savedClinicIds.has(clinic.id)}
                      source="clinics_list"
                      className="btn btnSecondary btnSm"
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
      </div>
    </section>
  );
}
