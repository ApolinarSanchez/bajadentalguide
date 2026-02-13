import { afterAll, describe, expect, it } from "vitest";
import { buildClinicQuery } from "@/lib/clinics/buildClinicQuery";
import { parseClinicFilters } from "@/lib/clinics/parseClinicFilters";
import { db } from "@/lib/db";

async function listFilteredClinics(search: Record<string, string>) {
  const filters = parseClinicFilters(new URLSearchParams(search));
  const query = buildClinicQuery(filters);

  return db.clinic.findMany({
    where: query.where,
    orderBy: query.orderBy,
    select: {
      slug: true,
      neighborhood: {
        select: {
          slug: true,
        },
      },
      clinicProcedures: {
        select: {
          procedure: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  });
}

describe("clinic query filters", () => {
  it("filters by neighborhood slug", async () => {
    const clinics = await listFilteredClinics({ neighborhood: "zona-rio" });

    expect(clinics.length).toBeGreaterThanOrEqual(1);
    clinics.forEach((clinic) => {
      expect(clinic.neighborhood?.slug).toBe("zona-rio");
    });
  });

  it("filters by procedure slug", async () => {
    const clinics = await listFilteredClinics({ procedure: "dental-implants" });

    expect(clinics.length).toBeGreaterThanOrEqual(1);
    expect(clinics.map((clinic) => clinic.slug)).toContain("bdg-e2e-implants-clinic");
  });

  it("filters by neighborhood and procedure together", async () => {
    const clinics = await listFilteredClinics({
      neighborhood: "zona-rio",
      procedure: "dental-implants",
    });

    expect(clinics.map((clinic) => clinic.slug)).toContain("bdg-e2e-implants-clinic");
  });
});

afterAll(async () => {
  await db.$disconnect();
});
