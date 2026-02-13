import Link from "next/link";
import { listNeighborhoods } from "@/lib/neighborhoods";

export const dynamic = "force-dynamic";

export default async function NeighborhoodsPage() {
  const neighborhoods = await listNeighborhoods();

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Neighborhoods</h1>
      {neighborhoods.length === 0 ? (
        <p>No neighborhoods found.</p>
      ) : (
        <ul>
          {neighborhoods.map((neighborhood) => (
            <li key={neighborhood.id}>
              <Link href={`/neighborhoods/${neighborhood.slug}`}>{neighborhood.name}</Link>{" "}
              ({neighborhood._count.clinics} clinics)
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
