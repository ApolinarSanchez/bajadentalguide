import { SaveClinicButton } from "@/components/SaveClinicButton";
import { ClinicReviewForm } from "@/components/ClinicReviewForm";
import { TrackedOutboundLink } from "@/components/TrackedOutboundLink";
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
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>{clinic.name}</h1>
      <SaveClinicButton clinicId={clinic.id} initialSaved={initialSaved} source="clinic_page" />
      <p>Clinic profile</p>
      <p>Slug: {clinic.slug}</p>
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
      {clinic.websiteUrl || clinic.whatsapp || clinic.googleMapsUrl || clinic.yelpUrl ? (
        <section>
          <h2>Links</h2>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {clinic.websiteUrl ? (
              <TrackedOutboundLink href={`/out/${clinic.slug}?dest=website`}>
                Website
              </TrackedOutboundLink>
            ) : null}
            {clinic.whatsapp ? (
              <TrackedOutboundLink href={`/out/${clinic.slug}?dest=whatsapp`}>
                WhatsApp
              </TrackedOutboundLink>
            ) : null}
            {clinic.googleMapsUrl ? (
              <TrackedOutboundLink href={`/out/${clinic.slug}?dest=google`}>
                Google Listing
              </TrackedOutboundLink>
            ) : null}
            {clinic.yelpUrl ? (
              <TrackedOutboundLink href={`/out/${clinic.slug}?dest=yelp`}>Yelp</TrackedOutboundLink>
            ) : null}
          </div>
        </section>
      ) : null}
      <p>{ratingText}</p>
      <section>
        <h2>Published BDG reviews</h2>
        {publishedReviews.length === 0 ? (
          <p>No published reviews yet.</p>
        ) : (
          <ul style={{ paddingLeft: 0, listStyle: "none" }}>
            {publishedReviews.map((review) => (
              <li
                key={review.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "0.5rem",
                  padding: "0.75rem",
                  marginBottom: "0.75rem",
                }}
              >
                <p>Rating: {review.ratingOverall}</p>
                {review.headline ? <p>Headline: {review.headline}</p> : null}
                {review.procedure || review.visitMonth || review.visitYear ? (
                  <p>
                    {review.procedure ? `Procedure: ${review.procedure}` : null}
                    {review.visitMonth ? `, Visit month: ${review.visitMonth}` : null}
                    {review.visitYear ? `, Visit year: ${review.visitYear}` : null}
                  </p>
                ) : null}
                <p>{review.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <ClinicReviewForm clinicId={clinic.id} disabled={Boolean(existingReview)} disabledReason={reviewNotice ?? ""} />
    </main>
  );
}
