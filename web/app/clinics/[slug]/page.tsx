import { TrackedOutboundLink } from "@/components/TrackedOutboundLink";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

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
  const clinic = await db.clinic.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
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

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>{clinic.name}</h1>
      <p>Clinic profile</p>
      <p>Slug: {clinic.slug}</p>
      <p>
        Location: {clinic.city}, {clinic.state}, {clinic.country}
      </p>
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
    </main>
  );
}
