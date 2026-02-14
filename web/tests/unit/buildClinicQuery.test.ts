import { describe, expect, it } from "vitest";
import { buildClinicQuery } from "@/lib/clinics/buildClinicQuery";
import type { ClinicFilters } from "@/lib/clinics/parseClinicFilters";

function baseFilters(): ClinicFilters {
  return {
    q: "",
    neighborhood: undefined,
    procedure: undefined,
    hasWebsite: false,
    hasWhatsapp: false,
    hasGoogle: false,
    hasYelp: false,
    includeUnverified: false,
    sort: "name_asc",
  };
}

describe("buildClinicQuery", () => {
  it("includes neighborhood slug condition when neighborhood is set", () => {
    const filters = baseFilters();
    filters.neighborhood = "zona-rio";

    const query = buildClinicQuery(filters);

    expect(query.where).toMatchObject({
      AND: [
        {
          isPublished: true,
        },
        {
          neighborhood: {
            slug: "zona-rio",
          },
        },
      ],
    });
  });

  it("includes procedure relation condition when procedure is set", () => {
    const filters = baseFilters();
    filters.procedure = "dental-implants";

    const query = buildClinicQuery(filters);

    expect(query.where).toMatchObject({
      AND: [
        {
          isPublished: true,
        },
        {
          clinicProcedures: {
            some: {
              procedure: {
                slug: "dental-implants",
              },
            },
          },
        },
      ],
    });
  });

  it("skips published filter when includeUnverified is enabled", () => {
    const filters = baseFilters();
    filters.includeUnverified = true;

    const query = buildClinicQuery(filters);

    expect(query.where).toBeUndefined();
  });
});
