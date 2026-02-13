import { ReviewStatus } from "@prisma/client";
import type { ReviewForAggregate } from "./validateReview";

export function computeAverageRating(reviews: ReviewForAggregate[]) {
  const published = reviews.filter((review) => review.status === ReviewStatus.PUBLISHED);

  if (published.length === 0) {
    return {
      average: 0,
      count: 0,
    };
  }

  const total = published.reduce((sum, review) => sum + review.ratingOverall, 0);

  return {
    average: Number((total / published.length).toFixed(1)),
    count: published.length,
  };
}
