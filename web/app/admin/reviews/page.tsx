import Link from "next/link";
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
  actions?: (reviewId: string) => JSX.Element | null;
}) {
  return (
    <section style={{ marginBottom: "1.5rem" }}>
      <h2>{heading}</h2>
      {reviews.length === 0 ? (
        <p>No reviews.</p>
      ) : (
        <ul style={{ paddingLeft: 0, listStyle: "none" }}>
          {reviews.map((review) => (
            <li
              key={review.id}
              data-testid={`review-row-${review.id}`}
              style={{ border: "1px solid #ddd", borderRadius: "0.5rem", padding: "0.75rem", marginBottom: "0.75rem" }}
            >
              <p style={{ margin: "0 0 0.25rem" }}>
                <Link href={`/clinics/${review.clinic.slug}`}>{review.clinic.name}</Link>
              </p>
              <p style={{ margin: "0 0 0.25rem" }}>Rating: {review.ratingOverall}</p>
              {review.procedure ? <p style={{ margin: "0 0 0.25rem" }}>Procedure: {review.procedure}</p> : null}
              <p style={{ margin: "0 0 0.25rem" }}>Created: {new Date(review.createdAt).toLocaleString()}</p>
              <p style={{ margin: "0 0 0.5rem" }}>{bodySnippet(review.body)}</p>
              {actions ? actions(review.id) : null}
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
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Review moderation</h1>
      <p>
        <Link href="/admin">Back to admin</Link>
      </p>
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
    </main>
  );
}
