import { afterAll, describe, expect, it } from "vitest";
import { buildFeaturedUpdateData } from "@/lib/clinics/featuredUpdate";
import { db } from "@/lib/db";

describe("featured rank update behavior", () => {
  it("preserves existing featuredRank when rank field is missing", async () => {
    const suffix = Date.now();
    const slug = `featured-rank-preserve-${suffix}`;

    await db.clinic.deleteMany({
      where: {
        slug,
      },
    });

    const clinic = await db.clinic.create({
      data: {
        name: `Featured Rank Preserve ${suffix}`,
        slug,
        city: "Tijuana",
        state: "BC",
        country: "MX",
        isFeatured: true,
        featuredRank: 7,
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
          featuredRank: true,
        },
      });

      expect(updatedClinic?.isFeatured).toBe(true);
      expect(updatedClinic?.featuredRank).toBe(7);
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
