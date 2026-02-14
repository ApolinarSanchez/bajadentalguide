import Link from "next/link";
import { notFound } from "next/navigation";
import { getProcedureBySlug, listClinicsForProcedureSlug } from "@/lib/procedures";

type ProcedurePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ProcedurePage({ params }: ProcedurePageProps) {
  const { slug } = await params;
  const procedure = await getProcedureBySlug(slug);

  if (!procedure) {
    notFound();
  }

  const clinics = await listClinicsForProcedureSlug(slug);

  return (
    <section className="stack">
      <header className="pageHeader stack">
        <div className="row">
          <Link className="btn btnGhost btnSm" href="/procedures">
            Procedures
          </Link>
          <span className="badge">{clinics.length} clinics</span>
        </div>
        <h1>{procedure.name}</h1>
        <p className="pageSubtitle">
          {procedure.description ?? "Procedure information coming soon."}
        </p>
      </header>

      <section className="stack">
        <h2>Clinics offering this procedure</h2>
        {clinics.length === 0 ? (
          <p className="card">No clinics listed yet.</p>
        ) : (
          <ul className="cards">
            {clinics.map((clinic) => (
              <li key={clinic.id} className="card row">
                <Link href={`/clinics/${clinic.slug}`}>{clinic.name}</Link>
                <Link className="btn btnSecondary btnSm" href={`/clinics/${clinic.slug}`}>
                  View clinic
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
