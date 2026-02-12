import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { TrackedOutboundLink } from "@/components/TrackedOutboundLink";
import { db } from "@/lib/db";
import { parseClinicFilters } from "@/lib/clinics/parseClinicFilters";

export const dynamic = "force-dynamic";

type ClinicsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function addPresenceFilters(
  whereClauses: Prisma.ClinicWhereInput[],
  field: "websiteUrl" | "whatsapp" | "googleMapsUrl" | "yelpUrl",
) {
  whereClauses.push({
    [field]: { not: null },
  });
  whereClauses.push({
    NOT: {
      [field]: "",
    },
  });
}

export default async function ClinicsPage({ searchParams }: ClinicsPageProps) {
  const filters = parseClinicFilters(await searchParams);
  const whereClauses: Prisma.ClinicWhereInput[] = [];

  if (filters.q) {
    whereClauses.push({
      name: {
        contains: filters.q,
        mode: "insensitive",
      },
    });
  }

  if (filters.hasWebsite) {
    addPresenceFilters(whereClauses, "websiteUrl");
  }
  if (filters.hasWhatsapp) {
    addPresenceFilters(whereClauses, "whatsapp");
  }
  if (filters.hasGoogle) {
    addPresenceFilters(whereClauses, "googleMapsUrl");
  }
  if (filters.hasYelp) {
    addPresenceFilters(whereClauses, "yelpUrl");
  }

  const orderBy =
    filters.sort === "newest"
      ? { createdAt: "desc" as const }
      : { name: filters.sort === "name_desc" ? ("desc" as const) : ("asc" as const) };

  const clinics = await db.clinic.findMany({
    where: whereClauses.length > 0 ? { AND: whereClauses } : undefined,
    orderBy,
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
