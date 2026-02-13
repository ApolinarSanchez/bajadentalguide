import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { listClinicsForNeighborhoodSlug } from "@/lib/neighborhoods";
import { listClinicsForProcedureSlug } from "@/lib/procedures";

describe("taxonomy data", () => {
  it("seed creates fixed procedure and neighborhood slugs", async () => {
    const procedureSlugs = [
      "dental-implants",
      "all-on-4",
      "crowns",
      "veneers",
      "root-canal",
    ];
    const neighborhoodSlugs = ["zona-rio", "centro", "otay", "playas-de-tijuana"];

    const [procedures, neighborhoods] = await Promise.all([
      db.procedure.findMany({
        where: {
          slug: {
            in: procedureSlugs,
          },
        },
        select: {
          slug: true,
        },
      }),
      db.neighborhood.findMany({
        where: {
          slug: {
            in: neighborhoodSlugs,
          },
        },
        select: {
          slug: true,
        },
      }),
    ]);

    expect(procedures.map((procedure) => procedure.slug).sort()).toEqual(
      [...procedureSlugs].sort(),
    );
    expect(neighborhoods.map((neighborhood) => neighborhood.slug).sort()).toEqual(
      [...neighborhoodSlugs].sort(),
    );
  });

  it("returns clinics for seeded procedure and neighborhood slugs", async () => {
    const [implantClinics, zonaRioClinics] = await Promise.all([
      listClinicsForProcedureSlug("dental-implants"),
      listClinicsForNeighborhoodSlug("zona-rio"),
    ]);

    expect(implantClinics.length).toBeGreaterThanOrEqual(1);
    expect(zonaRioClinics.length).toBeGreaterThanOrEqual(1);
  });
});

afterAll(async () => {
  await db.$disconnect();
});
