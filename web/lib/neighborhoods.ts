import { db } from "@/lib/db";

export async function listNeighborhoods() {
  return db.neighborhood.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: {
        select: {
          clinics: true,
        },
      },
    },
  });
}

export async function getNeighborhoodBySlug(slug: string) {
  return db.neighborhood.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  });
}

export async function listClinicsForNeighborhoodSlug(slug: string) {
  return db.clinic.findMany({
    where: {
      neighborhood: {
        slug,
      },
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}
