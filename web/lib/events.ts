import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function logEvent({
  sessionId,
  clinicId,
  eventName,
  metadata,
}: {
  sessionId?: string | null;
  clinicId?: string | null;
  eventName: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await db.event.create({
    data: {
      sessionId: sessionId ?? null,
      clinicId: clinicId ?? null,
      eventName,
      metadata,
    },
  });
}
