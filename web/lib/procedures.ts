import { db } from "@/lib/db";

export async function listProcedures() {
  return db.procedure.findMany({
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
          clinicProcedures: true,
        },
      },
    },
  });
}

export async function getProcedureBySlug(slug: string) {
  return db.procedure.findUnique({
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

export async function listClinicsForProcedureSlug(slug: string) {
  return db.clinic.findMany({
    where: {
      clinicProcedures: {
        some: {
          procedure: {
            slug,
          },
        },
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
