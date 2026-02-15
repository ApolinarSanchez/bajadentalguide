import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { db } from "@/lib/db";
import { AdminClinicCurationTable } from "@/components/admin/AdminClinicCurationTable";

export const dynamic = "force-dynamic";

type CurationSearchParams = Record<string, string | string[] | undefined>;

type PublishedFilter = "all" | "published" | "unverified";
type FeaturedFilter = "all" | "featured" | "not_featured";
type HasContactFilter = "all" | "yes" | "no";

const PAGE_SIZE = 200;

function getFirstParam(searchParams: CurationSearchParams, key: string): string | undefined {
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseEnum<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  if (!value) {
    return fallback;
  }

  return allowed.includes(value as T) ? (value as T) : fallback;
}

function parsePage(value: string | undefined) {
  if (!value) {
    return 1;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function buildNonEmptyFieldFilter(
  field: "phone" | "websiteUrl" | "whatsapp",
): Prisma.ClinicWhereInput {
  return {
    AND: [
      {
        [field]: {
          not: null,
        },
      },
      {
        NOT: {
          [field]: "",
        },
      },
    ],
  };
}

function buildEmptyOrNullFieldFilter(
  field: "phone" | "websiteUrl" | "whatsapp",
): Prisma.ClinicWhereInput {
  return {
    OR: [
      {
        [field]: null,
      },
      {
        [field]: "",
      },
    ],
  };
}

function buildQueryString({
  q,
  published,
  featured,
  hasContact,
  neighborhood,
  procedure,
  page,
}: {
  q: string;
  published: PublishedFilter;
  featured: FeaturedFilter;
  hasContact: HasContactFilter;
  neighborhood: string;
  procedure: string;
  page: number;
}) {
  const params = new URLSearchParams();

  if (q) {
    params.set("q", q);
  }
  if (published !== "all") {
    params.set("published", published);
  }
  if (featured !== "all") {
    params.set("featured", featured);
  }
  if (hasContact !== "all") {
    params.set("hasContact", hasContact);
  }
  if (neighborhood) {
    params.set("neighborhood", neighborhood);
  }
  if (procedure) {
    params.set("procedure", procedure);
  }
  if (page > 1) {
    params.set("page", String(page));
  }

  return params.toString();
}

export default async function AdminCurationPage({
  searchParams,
}: {
  searchParams: Promise<CurationSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = (getFirstParam(resolvedSearchParams, "q") ?? "").trim();
  const published = parseEnum(getFirstParam(resolvedSearchParams, "published"), [
    "all",
    "published",
    "unverified",
  ] as const, "all");
  const featured = parseEnum(getFirstParam(resolvedSearchParams, "featured"), [
    "all",
    "featured",
    "not_featured",
  ] as const, "all");
  const hasContact = parseEnum(getFirstParam(resolvedSearchParams, "hasContact"), [
    "all",
    "yes",
    "no",
  ] as const, "all");
  const neighborhood = (getFirstParam(resolvedSearchParams, "neighborhood") ?? "").trim();
  const procedure = (getFirstParam(resolvedSearchParams, "procedure") ?? "").trim();
  const page = parsePage(getFirstParam(resolvedSearchParams, "page"));

  const whereClauses: Prisma.ClinicWhereInput[] = [];

  if (q) {
    whereClauses.push({
      OR: [
        {
          name: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: q,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (published === "published") {
    whereClauses.push({
      isPublished: true,
    });
  } else if (published === "unverified") {
    whereClauses.push({
      isPublished: false,
    });
  }

  if (featured === "featured") {
    whereClauses.push({
      isFeatured: true,
    });
  } else if (featured === "not_featured") {
    whereClauses.push({
      isFeatured: false,
    });
  }

  if (hasContact === "yes") {
    whereClauses.push({
      OR: [
        buildNonEmptyFieldFilter("phone"),
        buildNonEmptyFieldFilter("websiteUrl"),
        buildNonEmptyFieldFilter("whatsapp"),
      ],
    });
  } else if (hasContact === "no") {
    whereClauses.push({
      AND: [
        buildEmptyOrNullFieldFilter("phone"),
        buildEmptyOrNullFieldFilter("websiteUrl"),
        buildEmptyOrNullFieldFilter("whatsapp"),
      ],
    });
  }

  if (neighborhood) {
    whereClauses.push({
      OR: [
        {
          neighborhoodId: neighborhood,
        },
        {
          neighborhood: {
            slug: neighborhood,
          },
        },
      ],
    });
  }

  if (procedure) {
    whereClauses.push({
      clinicProcedures: {
        some: {
          OR: [
            {
              procedureId: procedure,
            },
            {
              procedure: {
                slug: procedure,
              },
            },
          ],
        },
      },
    });
  }

  const where = whereClauses.length > 0 ? ({ AND: whereClauses } as Prisma.ClinicWhereInput) : undefined;
  const skip = (page - 1) * PAGE_SIZE;

  const [totalCount, clinics, neighborhoods, procedures] = await Promise.all([
    db.clinic.count({ where }),
    db.clinic.findMany({
      where,
      orderBy: [{ isPublished: "desc" }, { isFeatured: "desc" }, { name: "asc" }, { slug: "asc" }],
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        whatsapp: true,
        websiteUrl: true,
        isPublished: true,
        isFeatured: true,
        featuredRank: true,
      },
    }),
    db.neighborhood.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    }),
    db.procedure.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    }),
  ]);

  const showingFrom = totalCount === 0 ? 0 : skip + 1;
  const showingTo = totalCount === 0 ? 0 : skip + clinics.length;

  const baseQueryString = buildQueryString({
    q,
    published,
    featured,
    hasContact,
    neighborhood,
    procedure,
    page,
  });

  const previousPage = page - 1;
  const nextPage = page + 1;
  const hasPreviousPage = page > 1;
  const hasNextPage = showingTo < totalCount;

  const previousHref = `/admin/curation${
    hasPreviousPage
      ? `?${buildQueryString({
          q,
          published,
          featured,
          hasContact,
          neighborhood,
          procedure,
          page: previousPage,
        })}`
      : ""
  }`;

  const nextHref = `/admin/curation${
    hasNextPage
      ? `?${buildQueryString({
          q,
          published,
          featured,
          hasContact,
          neighborhood,
          procedure,
          page: nextPage,
        })}`
      : ""
  }`;

  return (
    <section className="stack">
      <header className="pageHeader stack">
        <div className="pageTitleRow">
          <h1>Curation</h1>
          <Link href="/admin" className="btn btnSecondary btnSm">
            Back to admin
          </Link>
        </div>
        <p className="pageSubtitle">
          Bulk publish, feature, and rank clinics so verified listings appear first.
        </p>
      </header>

      <section className="card stack" aria-label="Curation filters">
        <form method="get" className="stack">
          <div className="fieldRow">
            <div className="field">
              <label htmlFor="curation-q">Search</label>
              <input id="curation-q" name="q" type="search" defaultValue={q} />
            </div>
            <div className="field">
              <label htmlFor="curation-published">Published</label>
              <select id="curation-published" name="published" defaultValue={published}>
                <option value="all">all</option>
                <option value="published">published</option>
                <option value="unverified">unverified</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="curation-featured">Featured</label>
              <select id="curation-featured" name="featured" defaultValue={featured}>
                <option value="all">all</option>
                <option value="featured">featured</option>
                <option value="not_featured">not_featured</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="curation-has-contact">Has contact</label>
              <select id="curation-has-contact" name="hasContact" defaultValue={hasContact}>
                <option value="all">all</option>
                <option value="yes">yes</option>
                <option value="no">no</option>
              </select>
            </div>
          </div>

          <div className="fieldRow">
            <div className="field">
              <label htmlFor="curation-neighborhood">Neighborhood</label>
              <select id="curation-neighborhood" name="neighborhood" defaultValue={neighborhood}>
                <option value="">all</option>
                {neighborhoods.map((option) => (
                  <option key={option.id} value={option.slug}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="curation-procedure">Procedure</label>
              <select id="curation-procedure" name="procedure" defaultValue={procedure}>
                <option value="">all</option>
                {procedures.map((option) => (
                  <option key={option.id} value={option.slug}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <button type="submit" className="btn btnPrimary">
              Apply filters
            </button>
            <Link href="/admin/curation" className="btn btnGhost">
              Reset
            </Link>
            <span className="badge">
              Showing {showingFrom}-{showingTo} of {totalCount}
            </span>
          </div>
        </form>
      </section>

      <AdminClinicCurationTable
        clinics={clinics}
        totalCount={totalCount}
        showingFrom={showingFrom}
        showingTo={showingTo}
        currentQuery={baseQueryString}
      />

      {(hasPreviousPage || hasNextPage) && (
        <nav className="row" aria-label="Curation pagination">
          {hasPreviousPage ? (
            <Link href={previousHref} className="btn btnSecondary btnSm">
              Previous
            </Link>
          ) : null}
          {hasNextPage ? (
            <Link href={nextHref} className="btn btnSecondary btnSm">
              Next
            </Link>
          ) : null}
        </nav>
      )}
    </section>
  );
}
