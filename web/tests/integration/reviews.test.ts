import { db } from "@/lib/db";
import { approveReview, submitReview } from "@/lib/reviews/service";
import { afterAll, describe, expect, it } from "vitest";

describe("review flow", () => {
  it("supports submit, dedupe, and moderation publish with event logging", async () => {
    const clinic = await db.clinic.findFirst({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
      },
    });

    expect(clinic).not.toBeNull();
    if (!clinic) {
      return;
    }

    const sessionId = `test-session-review-1`;
    const adminSessionId = `test-session-admin-review-1`;
    const body = `Integration test review body ${Date.now()} with enough length to pass validation.`;

    await db.review.deleteMany({
      where: {
        clinicId: clinic.id,
        sessionId,
      },
    });

    await db.event.deleteMany({
      where: {
        clinicId: clinic.id,
        sessionId: { in: [sessionId, adminSessionId] },
        eventName: {
          in: ["review_submit", "review_publish"],
        },
      },
    });

    const pending = await submitReview({
      sessionId,
      payload: {
        clinicId: clinic.id,
        ratingOverall: 5,
        body,
      },
    });
    expect(pending.ok).toBe(true);

    if (!pending.ok) {
      return;
    }

    const reviewId = pending.data.reviewId;
    const duplicate = await submitReview({
      sessionId,
      payload: {
        clinicId: clinic.id,
        ratingOverall: 4,
        body,
      },
    });
    expect(duplicate.ok).toBe(false);
    expect(duplicate.status).toBe(409);

    const approved = await approveReview({
      reviewId,
      adminSessionId,
    });
    expect(approved.ok).toBe(true);

    const publishedReview = await db.review.findUnique({
      where: {
        id: reviewId,
      },
      select: {
        status: true,
        publishedAt: true,
      },
    });

    expect(publishedReview?.status).toBe("PUBLISHED");
    expect(publishedReview?.publishedAt).not.toBeNull();

    const events = await db.event.findMany({
      where: {
        clinicId: clinic.id,
        eventName: {
          in: ["review_submit", "review_publish"],
        },
      },
      select: {
        eventName: true,
      },
    });

    const eventNames = events.map((event) => event.eventName);
    expect(eventNames).toContain("review_submit");
    expect(eventNames).toContain("review_publish");
  });
});

afterAll(async () => {
  await db.$disconnect();
});
