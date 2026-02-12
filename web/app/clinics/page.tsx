import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ClinicsPage() {
  const clinics = await db.clinic.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Clinics</h1>
      {clinics.length === 0 ? (
        <p>No clinics found. Seed the database to load clinic listings.</p>
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
