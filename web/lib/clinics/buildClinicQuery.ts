import type { Prisma } from "@prisma/client";
import type { ClinicFilters } from "@/lib/clinics/parseClinicFilters";

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

export function buildClinicQuery(filters: ClinicFilters): {
  where: Prisma.ClinicWhereInput | undefined;
  orderBy: Prisma.ClinicOrderByWithRelationInput;
} {
  const whereClauses: Prisma.ClinicWhereInput[] = [];

  if (!filters.includeUnverified) {
    whereClauses.push({
      isPublished: true,
    });
  }

  if (filters.q) {
    whereClauses.push({
      name: {
        contains: filters.q,
        mode: "insensitive",
      },
    });
  }

  if (filters.neighborhood) {
    whereClauses.push({
      neighborhood: {
        slug: filters.neighborhood,
      },
    });
  }

  if (filters.procedure) {
    whereClauses.push({
      clinicProcedures: {
        some: {
          procedure: {
            slug: filters.procedure,
          },
        },
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

  return {
    where: whereClauses.length > 0 ? { AND: whereClauses } : undefined,
    orderBy,
  };
}
