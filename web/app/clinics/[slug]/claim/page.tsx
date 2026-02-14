import Link from "next/link";
import { notFound } from "next/navigation";
import { ClinicClaimForm } from "@/components/ClinicClaimForm";
import { db } from "@/lib/db";

type ClinicClaimPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ClinicClaimPage({ params }: ClinicClaimPageProps) {
  const { slug } = await params;
  const clinic = await db.clinic.findUnique({
    where: {
      slug,
    },
    select: {
      name: true,
      slug: true,
    },
  });

  if (!clinic) {
    notFound();
  }

  return (
    <section className="stack">
      <header className="pageHeader stack">
        <div className="pageTitleRow">
          <h1>Claim this listing</h1>
          <Link href={`/clinics/${clinic.slug}`} className="btn btnSecondary btnSm">
            Back to clinic
          </Link>
        </div>
        <p className="pageSubtitle">Clinic: {clinic.name}</p>
      </header>
      <ClinicClaimForm clinicSlug={clinic.slug} />
    </section>
  );
}
