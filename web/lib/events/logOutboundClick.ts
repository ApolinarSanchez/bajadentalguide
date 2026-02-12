import { db } from "@/lib/db";

const outboundDestinations = ["website", "whatsapp", "google", "yelp"] as const;

export type OutboundDestination = (typeof outboundDestinations)[number];

export function isOutboundDestination(value: string): value is OutboundDestination {
  return outboundDestinations.includes(value as OutboundDestination);
}

const destinationFieldByKey: Record<OutboundDestination, "websiteUrl" | "whatsapp" | "googleMapsUrl" | "yelpUrl"> =
  {
    website: "websiteUrl",
    whatsapp: "whatsapp",
    google: "googleMapsUrl",
    yelp: "yelpUrl",
  };

export async function logOutboundClick({
  slug,
  dest,
  sessionId,
}: {
  slug: string;
  dest: OutboundDestination;
  sessionId?: string;
}) {
  const clinic = await db.clinic.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      websiteUrl: true,
      whatsapp: true,
      googleMapsUrl: true,
      yelpUrl: true,
    },
  });

  if (!clinic) {
    return null;
  }

  const field = destinationFieldByKey[dest];
  const destination = clinic[field];
  if (!destination) {
    return null;
  }

  await db.event.create({
    data: {
      sessionId: sessionId ?? null,
      clinicId: clinic.id,
      eventName: "outbound_click",
      metadata: {
        dest,
      },
    },
  });

  return {
    clinicId: clinic.id,
    destination,
  };
}
