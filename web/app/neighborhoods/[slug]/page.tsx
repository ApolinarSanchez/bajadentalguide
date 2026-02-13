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
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>{neighborhood.name}</h1>
      <p>{neighborhood.description ?? "Neighborhood information coming soon."}</p>
      <h2>Clinics in this neighborhood</h2>
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
