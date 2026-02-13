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
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>{procedure.name}</h1>
      <p>{procedure.description ?? "Procedure information coming soon."}</p>
      <h2>Clinics offering this procedure</h2>
      {clinics.length === 0 ? (
        <p>No clinics listed yet.</p>
      ) : (
        <ul>
          {clinics.map((clinic) => (
            <li key={clinic.id}>
              <Link href={`/clinics/${clinic.slug}`}>{clinic.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
