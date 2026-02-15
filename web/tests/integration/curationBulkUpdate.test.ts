import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { bulkUpdateClinics } from "@/lib/admin/curationService";

function buildSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function seedClinics(prefix: string) {
  const base = {
    city: "Tijuana",
    state: "BC",
    country: "MX",
  };

  const [clinicA, clinicB, clinicC, clinicD] = await Promise.all([
    db.clinic.create({
      data: {
        ...base,
        name: `Curation A ${prefix}`,
        slug: `curation-a-${prefix}`,
        isPublished: false,
        isFeatured: false,
      },
      select: {
        id: true,
      },
    }),
    db.clinic.create({
      data: {
        ...base,
        name: `Curation B ${prefix}`,
        slug: `curation-b-${prefix}`,
        isPublished: false,
        isFeatured: true,
        featuredRank: 10,
      },
      select: {
        id: true,
      },
    }),
    db.clinic.create({
      data: {
        ...base,
        name: `Curation C ${prefix}`,
        slug: `curation-c-${prefix}`,
        isPublished: true,
        isFeatured: false,
      },
      select: {
        id: true,
      },
    }),
    db.clinic.create({
      data: {
        ...base,
        name: `Curation D ${prefix}`,
        slug: `curation-d-${prefix}`,
        isPublished: true,
        isFeatured: true,
        featuredRank: null,
      },
      select: {
        id: true,
      },
    }),
  ]);

  return {
    clinicA,
    clinicB,
    clinicC,
    clinicD,
  };
}

async function cleanup(prefix: string) {
  await db.clinic.deleteMany({
    where: {
      slug: {
        startsWith: `curation-`,
      },
      name: {
        contains: prefix,
      },
    },
  });
}

describe("bulk curation update integration", () => {
  it("publishes selected clinics", async () => {
    const suffix = buildSuffix();
    const { clinicA, clinicB } = await seedClinics(suffix);

    try {
      await bulkUpdateClinics(db, {
        clinicIds: [clinicA.id, clinicB.id],
        action: "publish",
      });

      const clinics = await db.clinic.findMany({
        where: {
          id: {
            in: [clinicA.id, clinicB.id],
          },
        },
        select: {
          id: true,
          isPublished: true,
          isFeatured: true,
          featuredRank: true,
        },
      });

      const clinicAUpdated = clinics.find((clinic) => clinic.id === clinicA.id);
      const clinicBUpdated = clinics.find((clinic) => clinic.id === clinicB.id);

      expect(clinicAUpdated?.isPublished).toBe(true);
      expect(clinicBUpdated?.isPublished).toBe(true);
      expect(clinicBUpdated?.isFeatured).toBe(true);
      expect(clinicBUpdated?.featuredRank).toBe(10);
    } finally {
      await cleanup(suffix);
    }
  });

  it("unpublishes and clears featured flags", async () => {
    const suffix = buildSuffix();
    const { clinicC } = await seedClinics(suffix);

    try {
      await bulkUpdateClinics(db, {
        clinicIds: [clinicC.id],
        action: "unpublish",
      });

      const clinic = await db.clinic.findUnique({
        where: {
          id: clinicC.id,
        },
        select: {
          isPublished: true,
          isFeatured: true,
          featuredRank: true,
        },
      });

      expect(clinic?.isPublished).toBe(false);
      expect(clinic?.isFeatured).toBe(false);
      expect(clinic?.featuredRank).toBeNull();
    } finally {
      await cleanup(suffix);
    }
  });

  it("features selected clinics without setting rank", async () => {
    const suffix = buildSuffix();
    const { clinicA } = await seedClinics(suffix);

    try {
      await bulkUpdateClinics(db, {
        clinicIds: [clinicA.id],
        action: "feature",
      });

      const clinic = await db.clinic.findUnique({
        where: {
          id: clinicA.id,
        },
        select: {
          isPublished: true,
          isFeatured: true,
          featuredRank: true,
        },
      });

      expect(clinic?.isPublished).toBe(true);
      expect(clinic?.isFeatured).toBe(true);
      expect(clinic?.featuredRank).toBeNull();
    } finally {
      await cleanup(suffix);
    }
  });

  it("unfeatures selected clinics and keeps published state", async () => {
    const suffix = buildSuffix();
    const { clinicB } = await seedClinics(suffix);

    try {
      await bulkUpdateClinics(db, {
        clinicIds: [clinicB.id],
        action: "unfeature",
      });

      const clinic = await db.clinic.findUnique({
        where: {
          id: clinicB.id,
        },
        select: {
          isPublished: true,
          isFeatured: true,
          featuredRank: true,
        },
      });

      expect(clinic?.isPublished).toBe(false);
      expect(clinic?.isFeatured).toBe(false);
      expect(clinic?.featuredRank).toBeNull();
    } finally {
      await cleanup(suffix);
    }
  });

  it("assigns sequential featured ranks in append mode", async () => {
    const suffix = buildSuffix();
    const { clinicA, clinicB, clinicC } = await seedClinics(suffix);

    try {
      await bulkUpdateClinics(db, {
        clinicIds: [clinicA.id, clinicC.id],
        action: "assign_featured_ranks",
        mode: "append",
      });

      const clinics = await db.clinic.findMany({
        where: {
          id: {
            in: [clinicA.id, clinicB.id, clinicC.id],
          },
        },
        select: {
          id: true,
          isPublished: true,
          isFeatured: true,
          featuredRank: true,
        },
      });

      const clinicAUpdated = clinics.find((clinic) => clinic.id === clinicA.id);
      const clinicBUpdated = clinics.find((clinic) => clinic.id === clinicB.id);
      const clinicCUpdated = clinics.find((clinic) => clinic.id === clinicC.id);

      expect(clinicBUpdated?.featuredRank).toBe(10);
      expect(clinicAUpdated?.isPublished).toBe(true);
      expect(clinicAUpdated?.isFeatured).toBe(true);
      expect(clinicAUpdated?.featuredRank).toBe(11);
      expect(clinicCUpdated?.isPublished).toBe(true);
      expect(clinicCUpdated?.isFeatured).toBe(true);
      expect(clinicCUpdated?.featuredRank).toBe(12);
    } finally {
      await cleanup(suffix);
    }
  });
});

afterAll(async () => {
  await db.$disconnect();
});
