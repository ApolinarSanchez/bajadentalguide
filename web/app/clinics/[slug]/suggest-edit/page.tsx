import Link from "next/link";
import { notFound } from "next/navigation";
import { ClinicEditSuggestionForm } from "@/components/ClinicEditSuggestionForm";
import { db } from "@/lib/db";

type SuggestEditPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function SuggestEditPage({ params }: SuggestEditPageProps) {
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
          <h1>Suggest an edit</h1>
          <Link href={`/clinics/${clinic.slug}`} className="btn btnSecondary btnSm">
            Back to clinic
          </Link>
        </div>
        <p className="pageSubtitle">Clinic: {clinic.name}</p>
      </header>
      <ClinicEditSuggestionForm clinicSlug={clinic.slug} />
    </section>
  );
}
