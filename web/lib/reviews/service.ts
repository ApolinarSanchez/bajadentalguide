import { Prisma, ReviewStatus } from "@prisma/client";
import { logEvent } from "@/lib/events";
import { db } from "@/lib/db";
import { validateReview } from "@/lib/reviews/validateReview";

type BaseServiceResult<T = void> =
  | {
      ok: true;
      status: number;
      data: T;
    }
  | {
      ok: false;
      status: number;
      errors: string[];
    };

export async function submitReview(args: {
  sessionId: string;
  payload: unknown;
}): Promise<BaseServiceResult<{ reviewId: string }>> {
  const validated = validateReview(args.payload);
  if (!validated.ok) {
    return {
      ok: false,
      status: 400,
      errors: validated.errors,
    };
  }

  const { value } = validated;
  const { clinicId, ratingOverall, procedure, visitMonth, visitYear, headline, body } = value;

  const existingReview = await db.review.findUnique({
    where: {
      clinicId_sessionId: {
        clinicId,
        sessionId: args.sessionId,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingReview) {
    return {
      ok: false,
      status: 409,
      errors: ["You already submitted a review for this clinic."],
    };
  }

  try {
    const review = await db.review.create({
      data: {
        clinicId,
        sessionId: args.sessionId,
        status: ReviewStatus.PENDING,
        ratingOverall,
        procedure,
        visitMonth,
        visitYear,
        headline,
        body,
      },
      select: {
        id: true,
      },
    });

    await logEvent({
      sessionId: args.sessionId,
      clinicId,
      eventName: "review_submit",
      metadata: {
        ratingOverall,
      },
    });

    return {
      ok: true,
      status: 201,
      data: {
        reviewId: review.id,
      },
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        status: 409,
        errors: ["You already submitted a review for this clinic."],
      };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return {
        ok: false,
        status: 404,
        errors: ["Clinic not found."],
      };
    }

    throw error;
  }
}

export async function approveReview(args: {
  reviewId: string;
  adminSessionId?: string | null;
}): Promise<BaseServiceResult<{ reviewId: string }>> {
  if (!args.reviewId) {
    return {
      ok: false,
      status: 400,
      errors: ["Missing review id."],
    };
  }

  const review = await db.review.findUnique({
    where: {
      id: args.reviewId,
    },
    select: {
      id: true,
      clinicId: true,
      status: true,
    },
  });

  if (!review) {
    return {
      ok: false,
      status: 404,
      errors: ["Review not found."],
    };
  }

  if (review.status === ReviewStatus.PUBLISHED) {
    return {
      ok: true,
      status: 200,
      data: {
        reviewId: review.id,
      },
    };
  }

  await db.review.update({
    where: {
      id: args.reviewId,
    },
    data: {
      status: ReviewStatus.PUBLISHED,
      publishedAt: new Date(),
      rejectionReason: null,
    },
  });

  await logEvent({
    sessionId: args.adminSessionId,
    clinicId: review.clinicId,
    eventName: "review_publish",
    metadata: {
      reviewId: review.id,
    },
  });

  return {
    ok: true,
    status: 200,
    data: {
      reviewId: review.id,
    },
  };
}

export async function rejectReview(args: {
  reviewId: string;
  reason?: string;
  adminSessionId?: string | null;
}): Promise<BaseServiceResult<{ reviewId: string }>> {
  if (!args.reviewId) {
    return {
      ok: false,
      status: 400,
      errors: ["Missing review id."],
    };
  }

  const review = await db.review.findUnique({
    where: {
      id: args.reviewId,
    },
    select: {
      id: true,
      clinicId: true,
      status: true,
    },
  });

  if (!review) {
    return {
      ok: false,
      status: 404,
      errors: ["Review not found."],
    };
  }

  if (review.status === ReviewStatus.REJECTED) {
    return {
      ok: true,
      status: 200,
      data: {
        reviewId: review.id,
      },
    };
  }

  await db.review.update({
    where: {
      id: args.reviewId,
    },
    data: {
      status: ReviewStatus.REJECTED,
      rejectionReason: args.reason ? args.reason.trim() : null,
    },
  });

  await logEvent({
    sessionId: args.adminSessionId,
    clinicId: review.clinicId,
    eventName: "review_reject",
    metadata: {
      reason: args.reason ?? null,
      reviewId: review.id,
    },
  });

  return {
    ok: true,
    status: 200,
    data: {
      reviewId: review.id,
    },
  };
}
