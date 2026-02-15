import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { buildFeaturedUpdateData } from "@/lib/clinics/featuredUpdate";

describe("featured implies published invariant", () => {
  it("sets isPublished=true when a clinic is featured", async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const slug = `featured-implies-published-${suffix}`;

    await db.clinic.deleteMany({
      where: {
        slug,
      },
    });

    const clinic = await db.clinic.create({
      data: {
        name: `Featured Implies Published ${suffix}`,
        slug,
        city: "Tijuana",
        state: "BC",
        country: "MX",
        isPublished: false,
        isFeatured: false,
      },
      select: {
        id: true,
      },
    });

    try {
      const data = buildFeaturedUpdateData({
        isFeatured: true,
        featuredRankRaw: null,
      });

      await db.clinic.update({
        where: {
          id: clinic.id,
        },
        data,
      });

      const updatedClinic = await db.clinic.findUnique({
        where: {
          id: clinic.id,
        },
        select: {
          isFeatured: true,
          isPublished: true,
        },
      });

      expect(updatedClinic?.isFeatured).toBe(true);
      expect(updatedClinic?.isPublished).toBe(true);
    } finally {
      await db.clinic.deleteMany({
        where: {
          id: clinic.id,
        },
      });
    }
  });
});

afterAll(async () => {
  await db.$disconnect();
});
