import { db } from "@/lib/db";
import { logEvent } from "@/lib/events";

export const shortlistSources = ["clinics_list", "clinic_page"] as const;
export type ShortlistSource = (typeof shortlistSources)[number];

export function isShortlistSource(value: string): value is ShortlistSource {
  return shortlistSources.includes(value as ShortlistSource);
}

export function buildSavedSet(rows: Array<{ clinicId: string }>): Set<string> {
  return new Set(rows.map((row) => row.clinicId));
}

export async function listSavedClinics(sessionId: string) {
  const savedClinics = await db.savedClinic.findMany({
    where: {
      sessionId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      clinic: {
        select: {
          id: true,
          name: true,
          slug: true,
          websiteUrl: true,
          whatsapp: true,
          googleMapsUrl: true,
          yelpUrl: true,
        },
      },
    },
  });

  return savedClinics.map((savedClinic) => savedClinic.clinic);
}

export async function isClinicSaved(sessionId: string, clinicId: string): Promise<boolean> {
  const saved = await db.savedClinic.findUnique({
    where: {
      sessionId_clinicId: {
        sessionId,
        clinicId,
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(saved);
}

export async function toggleSavedClinic({
  sessionId,
  clinicId,
  source,
}: {
  sessionId: string;
  clinicId: string;
  source: ShortlistSource;
}): Promise<{ saved: boolean }> {
  const clinic = await db.clinic.findUnique({
    where: {
      id: clinicId,
    },
    select: {
      id: true,
    },
  });

  if (!clinic) {
    throw new Error("Clinic not found");
  }

  const existing = await db.savedClinic.findUnique({
    where: {
      sessionId_clinicId: {
        sessionId,
        clinicId,
      },
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    await db.savedClinic.delete({
      where: {
        id: existing.id,
      },
    });

    await logEvent({
      sessionId,
      clinicId,
      eventName: "shortlist_remove",
      metadata: {
        source,
      },
    });

    return { saved: false };
  }

  await db.savedClinic.create({
    data: {
      sessionId,
      clinicId,
    },
  });

  await logEvent({
    sessionId,
    clinicId,
    eventName: "shortlist_add",
    metadata: {
      source,
    },
  });

  return { saved: true };
}
