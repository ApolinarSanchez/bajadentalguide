import { ReviewStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { aggregateOutboundByDest, topNByCount } from "@/lib/admin/analyticsAggregate";

export async function getEventCounts({ since }: { since: Date }) {
  const grouped = await db.event.groupBy({
    by: ["eventName"],
    where: {
      createdAt: {
        gte: since,
      },
    },
    _count: {
      _all: true,
    },
  });

  const counts: Record<string, number> = {};
  for (const row of grouped) {
    counts[row.eventName] = row._count._all;
  }

  return counts;
}

export async function getOutboundClicksByDest({ since }: { since: Date }) {
  const events = await db.event.findMany({
    where: {
      eventName: "outbound_click",
      createdAt: {
        gte: since,
      },
    },
    select: {
      metadata: true,
    },
  });

  return aggregateOutboundByDest(events.map((event) => event.metadata));
}

type TopClinicRow = {
  clinicId: string;
  clinicName: string;
  clinicSlug: string;
  count: number;
};

async function getTopClinicsByEventName({
  since,
  limit,
  eventName,
}: {
  since: Date;
  limit: number;
  eventName: string;
}): Promise<TopClinicRow[]> {
  const events = await db.event.findMany({
    where: {
      eventName,
      createdAt: {
        gte: since,
      },
      clinicId: {
        not: null,
      },
    },
    select: {
      clinicId: true,
    },
  });

  const countsMap = new Map<string, number>();
  for (const event of events) {
    if (!event.clinicId) {
      continue;
    }
    countsMap.set(event.clinicId, (countsMap.get(event.clinicId) ?? 0) + 1);
  }

  const top = topNByCount(
    Array.from(countsMap.entries()).map(([id, count]) => ({ id, count })),
    limit,
  );
  if (top.length === 0) {
    return [];
  }

  const clinics = await db.clinic.findMany({
    where: {
      id: {
        in: top.map((row) => row.id),
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  const clinicsById = new Map(clinics.map((clinic) => [clinic.id, clinic]));

  return top
    .map((row) => {
      const clinic = clinicsById.get(row.id);
      if (!clinic) {
        return null;
      }
      return {
        clinicId: clinic.id,
        clinicName: clinic.name,
        clinicSlug: clinic.slug,
        count: row.count,
      };
    })
    .filter((row): row is TopClinicRow => row !== null);
}

export function getTopClinicsByOutboundClicks({
  since,
  limit,
}: {
  since: Date;
  limit: number;
}) {
  return getTopClinicsByEventName({
    since,
    limit,
    eventName: "outbound_click",
  });
}

export function getTopClinicsByShortlistAdds({
  since,
  limit,
}: {
  since: Date;
  limit: number;
}) {
  return getTopClinicsByEventName({
    since,
    limit,
    eventName: "shortlist_add",
  });
}

export async function getReviewCounts({ since }: { since: Date }) {
  const [createdSince, publishedSince, pendingOverall] = await Promise.all([
    db.review.count({
      where: {
        createdAt: {
          gte: since,
        },
      },
    }),
    db.review.count({
      where: {
        status: ReviewStatus.PUBLISHED,
        publishedAt: {
          gte: since,
        },
      },
    }),
    db.review.count({
      where: {
        status: ReviewStatus.PENDING,
      },
    }),
  ]);

  return {
    createdSince,
    publishedSince,
    pendingOverall,
  };
}
