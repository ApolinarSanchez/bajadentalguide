import { describe, expect, it } from "vitest";
import { computeAverageRating } from "@/lib/reviews/aggregate";
import { ReviewStatus } from "@prisma/client";

describe("computeAverageRating", () => {
  it("uses published reviews only", () => {
    const average = computeAverageRating([
      { status: ReviewStatus.PUBLISHED, ratingOverall: 5 },
      { status: ReviewStatus.REJECTED, ratingOverall: 1 },
      { status: ReviewStatus.PUBLISHED, ratingOverall: 3 },
    ]);

    expect(average).toEqual({
      average: 4.0,
      count: 2,
    });
  });
});
