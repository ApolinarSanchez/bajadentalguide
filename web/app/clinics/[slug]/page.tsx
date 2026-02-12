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
    </main>
  );
}
