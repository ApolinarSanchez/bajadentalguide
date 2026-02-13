import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { ReviewStatus } from "@prisma/client";
import {
  getEventCounts,
  getOutboundClicksByDest,
  getReviewCounts,
  getTopClinicsByOutboundClicks,
  getTopClinicsByShortlistAdds,
} from "@/lib/admin/analytics";
import { db } from "@/lib/db";

describe("admin analytics queries", () => {
  it("returns expected counts and top clinics for fixed timestamps", async () => {
    const baseNow = new Date("2100-01-31T12:00:00.000Z");
    const since7 = new Date(baseNow.getTime() - 7 * 24 * 60 * 60 * 1000);
    const since30 = new Date(baseNow.getTime() - 30 * 24 * 60 * 60 * 1000);

    const clinicSlug = `analytics-clinic-${randomUUID()}`;
    const clinic = await db.clinic.create({
      data: {
        name: "Analytics Clinic A",
        slug: clinicSlug,
        city: "Tijuana",
        state: "BC",
        country: "MX",
      },
      select: {
        id: true,
        slug: true,
      },
    });

    const in7 = new Date("2100-01-28T10:00:00.000Z");
    const in30Only = new Date("2100-01-12T10:00:00.000Z");
    const reviewSessionId = `analytics-review-${randomUUID()}`;

    const [
      baseEventCounts7,
      baseEventCounts30,
      baseOutboundByDest7,
      baseOutboundByDest30,
      baseReviewCounts7,
      baseReviewCounts30,
    ] = await Promise.all([
      getEventCounts({ since: since7 }),
      getEventCounts({ since: since30 }),
      getOutboundClicksByDest({ since: since7 }),
      getOutboundClicksByDest({ since: since30 }),
      getReviewCounts({ since: since7 }),
      getReviewCounts({ since: since30 }),
    ]);

    await Promise.all([
      ...Array.from({ length: 3 }, () =>
        db.event.create({
          data: {
            clinicId: clinic.id,
            eventName: "outbound_click",
            metadata: {
              dest: "website",
            },
            createdAt: in7,
          },
        }),
      ),
      ...Array.from({ length: 2 }, () =>
        db.event.create({
          data: {
            clinicId: clinic.id,
            eventName: "outbound_click",
            metadata: {
              dest: "whatsapp",
            },
            createdAt: in30Only,
          },
        }),
      ),
      ...Array.from({ length: 5 }, () =>
        db.event.create({
          data: {
            clinicId: clinic.id,
            eventName: "shortlist_add",
            createdAt: in7,
          },
        }),
      ),
      db.review.create({
        data: {
          clinicId: clinic.id,
          sessionId: reviewSessionId,
          status: ReviewStatus.PUBLISHED,
          ratingOverall: 5,
          body: "Published analytics review content that is comfortably above minimum length.",
          createdAt: in7,
          publishedAt: in7,
        },
      }),
    ]);

    const [
      eventCounts7,
      eventCounts30,
      outboundByDest7,
      outboundByDest30,
      topOutbound7,
      topShortlist7,
      reviewCounts7,
      reviewCounts30,
    ] = await Promise.all([
      getEventCounts({ since: since7 }),
      getEventCounts({ since: since30 }),
      getOutboundClicksByDest({ since: since7 }),
      getOutboundClicksByDest({ since: since30 }),
      getTopClinicsByOutboundClicks({ since: since7, limit: 10 }),
      getTopClinicsByShortlistAdds({ since: since7, limit: 10 }),
      getReviewCounts({ since: since7 }),
      getReviewCounts({ since: since30 }),
    ]);

    expect((eventCounts7.outbound_click ?? 0) - (baseEventCounts7.outbound_click ?? 0)).toBe(3);
    expect((eventCounts30.outbound_click ?? 0) - (baseEventCounts30.outbound_click ?? 0)).toBe(5);
    expect((eventCounts7.shortlist_add ?? 0) - (baseEventCounts7.shortlist_add ?? 0)).toBe(5);
    expect((eventCounts30.shortlist_add ?? 0) - (baseEventCounts30.shortlist_add ?? 0)).toBe(5);

    expect((outboundByDest7.website ?? 0) - (baseOutboundByDest7.website ?? 0)).toBe(3);
    expect((outboundByDest7.whatsapp ?? 0) - (baseOutboundByDest7.whatsapp ?? 0)).toBe(0);
    expect((outboundByDest30.website ?? 0) - (baseOutboundByDest30.website ?? 0)).toBe(3);
    expect((outboundByDest30.whatsapp ?? 0) - (baseOutboundByDest30.whatsapp ?? 0)).toBe(2);

    expect(topOutbound7[0]).toMatchObject({
      clinicSlug,
      count: 3,
    });
    expect(topShortlist7[0]).toMatchObject({
      clinicSlug,
      count: 5,
    });

    expect(reviewCounts7.createdSince - baseReviewCounts7.createdSince).toBe(1);
    expect(reviewCounts7.publishedSince - baseReviewCounts7.publishedSince).toBe(1);
    expect(reviewCounts30.createdSince - baseReviewCounts30.createdSince).toBe(1);
    expect(reviewCounts30.publishedSince - baseReviewCounts30.publishedSince).toBe(1);
  });
});

afterAll(async () => {
  await db.$disconnect();
});
