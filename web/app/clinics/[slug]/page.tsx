import { SaveClinicButton } from "@/components/SaveClinicButton";
import { ClinicReviewForm } from "@/components/ClinicReviewForm";
import { TrackedOutboundLink } from "@/components/TrackedOutboundLink";
import { Alert } from "@/components/Alert";
import { db } from "@/lib/db";
import { computeAverageRating } from "@/lib/reviews/aggregate";
import { getSessionIdFromCookies } from "@/lib/session";
import { isClinicSaved } from "@/lib/shortlist";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewStatus } from "@prisma/client";

type ClinicProfilePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ClinicProfilePage({
  params,
}: ClinicProfilePageProps) {
  const { slug } = await params;
  const sessionId = getSessionIdFromCookies(await cookies());
  const clinic = await db.clinic.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isPublished: true,
      neighborhood: {
        select: {
          name: true,
          slug: true,
        },
      },
      clinicProcedures: {
        select: {
          procedure: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          procedure: {
            name: "asc",
          },
        },
      },
      city: true,
      state: true,
      country: true,
      addressLine1: true,
      phone: true,
      whatsapp: true,
      websiteUrl: true,
      googleMapsUrl: true,
      yelpUrl: true,
    },
  });

  if (!clinic) {
    notFound();
  }

  const initialSaved = sessionId ? await isClinicSaved(sessionId, clinic.id) : false;
  const publishedReviews = await db.review.findMany({
    where: {
      clinicId: clinic.id,
      status: ReviewStatus.PUBLISHED,
    },
    select: {
      id: true,
      status: true,
      ratingOverall: true,
      procedure: true,
      visitMonth: true,
      visitYear: true,
      headline: true,
      body: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const existingReview = sessionId
    ? await db.review.findFirst({
        where: {
          clinicId: clinic.id,
          sessionId,
        },
        select: {
          status: true,
        },
      })
    : null;

  const aggregate = computeAverageRating(publishedReviews);
  const reviewNotice =
    existingReview?.status === ReviewStatus.PENDING
      ? "Your review is pending."
      : existingReview?.status === ReviewStatus.PUBLISHED
        ? "Thanks for reviewing."
        : existingReview?.status === ReviewStatus.REJECTED
          ? "Your review was not published."
          : null;
  const ratingText =
    aggregate.count === 0
      ? "BDG Rating: No published reviews yet"
      : `BDG Rating: ${aggregate.average} (${aggregate.count} reviews)`;

  return (
    <section className="stack">
      <section className="card stack">
        <div className="pageTitleRow">
          <h1>{clinic.name}</h1>
          <SaveClinicButton
            clinicId={clinic.id}
            initialSaved={initialSaved}
            source="clinic_page"
            className="btn btnPrimary btnSm"
          />
        </div>
        <p className="pageSubtitle">Clinic profile</p>
        <p className="pageSubtitle">Slug: {clinic.slug}</p>
        {!clinic.isPublished ? (
          <Alert variant="info">
            This listing is unverified and may have limited contact details. Please confirm details
            directly with the clinic.
          </Alert>
        ) : null}
      </section>

      <section className="grid2">
        <div className="stack">
          <section className="card stack">
            <h2>Overview</h2>
            <p>
              Location: {clinic.city}, {clinic.state}, {clinic.country}
            </p>
            {clinic.neighborhood ? (
              <p>
                Neighborhood: {clinic.neighborhood.name} (
                <Link href={`/neighborhoods/${clinic.neighborhood.slug}`}>view neighborhood</Link>)
              </p>
            ) : null}
            {clinic.clinicProcedures.length > 0 ? (
              <p>
                Procedures:{" "}
                {clinic.clinicProcedures.map((item, index) => (
                  <span key={item.procedure.id}>
                    <Link href={`/procedures/${item.procedure.slug}`}>{item.procedure.name}</Link>
                    {index < clinic.clinicProcedures.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            ) : null}
            {clinic.addressLine1 ? <p>Address: {clinic.addressLine1}</p> : null}
            {clinic.phone ? <p>Phone: {clinic.phone}</p> : null}
            {clinic.whatsapp ? <p>WhatsApp: {clinic.whatsapp}</p> : null}
          </section>

          {clinic.websiteUrl || clinic.whatsapp || clinic.googleMapsUrl || clinic.yelpUrl ? (
            <section className="card stack">
              <h2>Links</h2>
              <div className="row">
                {clinic.websiteUrl ? (
                  <TrackedOutboundLink
                    href={`/out/${clinic.slug}?dest=website`}
                    className="btn btnSecondary btnSm"
                  >
                    Website
                  </TrackedOutboundLink>
                ) : null}
                {clinic.whatsapp ? (
                  <TrackedOutboundLink
                    href={`/out/${clinic.slug}?dest=whatsapp`}
                    className="btn btnSecondary btnSm"
                  >
                    WhatsApp
                  </TrackedOutboundLink>
                ) : null}
                {clinic.googleMapsUrl ? (
                  <TrackedOutboundLink
                    href={`/out/${clinic.slug}?dest=google`}
                    className="btn btnSecondary btnSm"
                  >
                    Google Listing
                  </TrackedOutboundLink>
                ) : null}
                {clinic.yelpUrl ? (
                  <TrackedOutboundLink
                    href={`/out/${clinic.slug}?dest=yelp`}
                    className="btn btnSecondary btnSm"
                  >
                    Yelp
                  </TrackedOutboundLink>
                ) : null}
              </div>
              <p className="alert">
                External links are provided for convenience. You may be redirected to a third‑party
                website or service.
              </p>
            </section>
          ) : null}
        </div>

        <div className="stack">
          <section className="card stack">
            <h2>BDG rating &amp; reviews</h2>
            <div className="row">
              <p>{ratingText}</p>
              {aggregate.count > 0 ? (
                <span className="badge">
                  {aggregate.average} average from {aggregate.count} reviews
                </span>
              ) : null}
            </div>
            <h3>Published BDG reviews</h3>
            <p>
              Reviews are user‑submitted and moderated. BajaDentalGuide does not provide medical
              advice.
            </p>
            {publishedReviews.length === 0 ? (
              <p>No published reviews yet.</p>
            ) : (
              <ul className="cards">
                {publishedReviews.map((review) => (
                  <li key={review.id} className="card stack">
                    <div className="row">
                      <span className="badge">Rating: {review.ratingOverall}</span>
                      {review.procedure ? <span className="badge">Procedure: {review.procedure}</span> : null}
                      {review.visitMonth ? <span className="badge">Visit month: {review.visitMonth}</span> : null}
                      {review.visitYear ? <span className="badge">Visit year: {review.visitYear}</span> : null}
                    </div>
                    {review.headline ? <p>Headline: {review.headline}</p> : null}
                    <p>{review.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <ClinicReviewForm
            clinicId={clinic.id}
            disabled={Boolean(existingReview)}
            disabledReason={reviewNotice ?? ""}
          />
        </div>
      </section>
    </section>
  );
}
