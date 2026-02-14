import Link from "next/link";
import { notFound } from "next/navigation";
import { getNeighborhoodBySlug, listClinicsForNeighborhoodSlug } from "@/lib/neighborhoods";

type NeighborhoodPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function NeighborhoodPage({ params }: NeighborhoodPageProps) {
  const { slug } = await params;
  const neighborhood = await getNeighborhoodBySlug(slug);

  if (!neighborhood) {
    notFound();
  }

  const clinics = await listClinicsForNeighborhoodSlug(slug);

  return (
    <section className="stack">
      <header className="pageHeader stack">
        <div className="row">
          <Link className="btn btnGhost btnSm" href="/neighborhoods">
            Neighborhoods
          </Link>
          <span className="badge">{clinics.length} clinics</span>
        </div>
        <h1>{neighborhood.name}</h1>
        <p className="pageSubtitle">
          {neighborhood.description ?? "Neighborhood information coming soon."}
        </p>
      </header>

      <section className="stack">
        <h2>Clinics in this neighborhood</h2>
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
