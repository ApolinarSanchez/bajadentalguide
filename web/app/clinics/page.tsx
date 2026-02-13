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
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Clinics</h1>
      <form method="get" style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label htmlFor="clinics-search-q">Search clinics</label>
          <input
            id="clinics-search-q"
            name="q"
            type="search"
            defaultValue={filters.q}
            style={{ marginLeft: "0.5rem" }}
          />
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
          <label>
            <input
              type="checkbox"
              name="hasWebsite"
              value="1"
              defaultChecked={filters.hasWebsite}
            />{" "}
            Has website
          </label>
          <label>
            <input
              type="checkbox"
              name="hasWhatsapp"
              value="1"
              defaultChecked={filters.hasWhatsapp}
            />{" "}
            Has WhatsApp
          </label>
          <label>
            <input type="checkbox" name="hasGoogle" value="1" defaultChecked={filters.hasGoogle} />{" "}
            Has Google
          </label>
          <label>
            <input type="checkbox" name="hasYelp" value="1" defaultChecked={filters.hasYelp} /> Has
            Yelp
          </label>
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label htmlFor="clinics-sort">Sort</label>
          <select id="clinics-sort" name="sort" defaultValue={filters.sort} style={{ marginLeft: "0.5rem" }}>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="newest">Newest</option>
          </select>
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label htmlFor="clinics-neighborhood">Neighborhood</label>
          <select
            id="clinics-neighborhood"
            name="neighborhood"
            defaultValue={filters.neighborhood ?? ""}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="">All neighborhoods</option>
            {neighborhoods.map((neighborhood) => (
              <option key={neighborhood.id} value={neighborhood.slug}>
                {neighborhood.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label htmlFor="clinics-procedure">Procedure</label>
          <select
            id="clinics-procedure"
            name="procedure"
            defaultValue={filters.procedure ?? ""}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="">All procedures</option>
            {procedures.map((procedure) => (
              <option key={procedure.id} value={procedure.slug}>
                {procedure.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Apply filters</button>
      </form>
      <p data-testid="results-count">Results: {clinics.length}</p>
      {clinics.length === 0 ? (
        <p>No clinics found. Seed the database to load clinic listings.</p>
      ) : (
        <ul style={{ paddingLeft: 0, listStyle: "none" }}>
          {clinics.map((clinic) => (
            <li
              key={clinic.id}
              data-testid="clinic-item"
              style={{ border: "1px solid #ddd", borderRadius: "0.5rem", padding: "0.75rem", marginBottom: "0.75rem" }}
            >
              <p style={{ marginTop: 0 }}>
                <Link href={`/clinics/${clinic.slug}`}>{clinic.name}</Link>
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <SaveClinicButton
                  clinicId={clinic.id}
                  initialSaved={savedClinicIds.has(clinic.id)}
                  source="clinics_list"
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
