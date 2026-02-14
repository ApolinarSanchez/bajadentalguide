import { afterAll, describe, expect, it } from "vitest";
import { buildClinicQuery } from "@/lib/clinics/buildClinicQuery";
import { parseClinicFilters } from "@/lib/clinics/parseClinicFilters";
import { db } from "@/lib/db";

async function listVisibleClinicSlugs(search: Record<string, string>) {
  const filters = parseClinicFilters(new URLSearchParams(search));
  const query = buildClinicQuery(filters);

  const clinics = await db.clinic.findMany({
    where: query.where,
    orderBy: query.orderBy,
    select: {
      slug: true,
    },
  });

  return clinics.map((clinic) => clinic.slug);
}

describe("clinic visibility filtering", () => {
  it("returns only published clinics by default and both when includeUnverified=1", async () => {
    const suffix = Date.now();
    const publishedSlug = `visibility-published-${suffix}`;
    const unpublishedSlug = `visibility-unpublished-${suffix}`;
    const namePrefix = `Visibility Check ${suffix}`;

    await db.clinic.deleteMany({
      where: {
        slug: {
          in: [publishedSlug, unpublishedSlug],
        },
      },
    });

    try {
      await db.clinic.createMany({
        data: [
          {
            name: `${namePrefix} Published`,
            slug: publishedSlug,
            city: "Tijuana",
            state: "BC",
            country: "MX",
            isPublished: true,
          },
          {
            name: `${namePrefix} Unpublished`,
            slug: unpublishedSlug,
            city: "Tijuana",
            state: "BC",
            country: "MX",
            isPublished: false,
          },
        ],
        skipDuplicates: true,
      });

      const defaultSlugs = await listVisibleClinicSlugs({ q: namePrefix });
      expect(defaultSlugs).toContain(publishedSlug);
      expect(defaultSlugs).not.toContain(unpublishedSlug);

      const withUnverifiedSlugs = await listVisibleClinicSlugs({
        q: namePrefix,
        includeUnverified: "1",
      });
      expect(withUnverifiedSlugs).toContain(publishedSlug);
      expect(withUnverifiedSlugs).toContain(unpublishedSlug);
    } finally {
      await db.clinic.deleteMany({
        where: {
          slug: {
            in: [publishedSlug, unpublishedSlug],
          },
        },
      });
    }
  });
});

afterAll(async () => {
  await db.$disconnect();
});
