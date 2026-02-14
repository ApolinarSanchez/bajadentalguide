import Link from "next/link";
import type { ReactElement } from "react";
import { ReviewModerationActions } from "@/components/admin/ReviewModerationActions";
import { db } from "@/lib/db";
import { ReviewStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

function bodySnippet(body: string) {
  return body.length > 160 ? `${body.slice(0, 160)}...` : body;
}

function ReviewSection({
  heading,
  reviews,
  actions,
}: {
  heading: string;
  reviews: Array<{
    id: string;
    ratingOverall: number;
    procedure: string | null;
    createdAt: Date;
    body: string;
    clinic: {
      name: string;
      slug: string;
    };
  }>;
  actions?: (reviewId: string) => ReactElement | null;
}) {
  return (
    <section className="stack">
      <h2>{heading}</h2>
      {reviews.length === 0 ? (
        <p>No reviews.</p>
      ) : (
        <ul className="cards">
          {reviews.map((review) => (
            <li
              key={review.id}
              data-testid={`review-row-${review.id}`}
              className="card stack"
            >
              <p>
                <Link href={`/clinics/${review.clinic.slug}`}>{review.clinic.name}</Link>
              </p>
              <p>Rating: {review.ratingOverall}</p>
              {review.procedure ? <p>Procedure: {review.procedure}</p> : null}
              <p>Created: {new Date(review.createdAt).toLocaleString()}</p>
              <p>{bodySnippet(review.body)}</p>
              {actions ? <div className="row">{actions(review.id)}</div> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function AdminReviewsPage() {
  const [pendingReviews, publishedReviews, rejectedReviews] = await Promise.all([
    db.review.findMany({
      where: { status: ReviewStatus.PENDING },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ratingOverall: true,
        procedure: true,
        createdAt: true,
        body: true,
        clinic: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
    db.review.findMany({
      where: { status: ReviewStatus.PUBLISHED },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ratingOverall: true,
        procedure: true,
        createdAt: true,
        body: true,
        clinic: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
    db.review.findMany({
      where: { status: ReviewStatus.REJECTED },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ratingOverall: true,
        procedure: true,
        createdAt: true,
        body: true,
        clinic: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
  ]);

  return (
    <section className="stack">
      <header className="pageHeader stack">
        <div className="pageTitleRow">
          <h1>Review moderation</h1>
          <Link href="/admin" className="btn btnSecondary btnSm">
            Back to admin
          </Link>
        </div>
        <p className="pageSubtitle">
          Approve, publish, or reject user-submitted reviews from the moderation queue.
        </p>
      </header>
      <ReviewSection
        heading="Pending reviews"
        reviews={pendingReviews}
        actions={(reviewId) => <ReviewModerationActions reviewId={reviewId} />}
      />
      <ReviewSection
        heading="Published reviews"
        reviews={publishedReviews}
      />
      <ReviewSection
        heading="Rejected reviews"
        reviews={rejectedReviews}
      />
    </section>
  );
}
