import Link from "next/link";
import { listProcedures } from "@/lib/procedures";

export const dynamic = "force-dynamic";

export default async function ProceduresPage() {
  const procedures = await listProcedures();

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Procedures</h1>
      {procedures.length === 0 ? (
        <p>No procedures found.</p>
      ) : (
        <ul>
          {procedures.map((procedure) => (
            <li key={procedure.id}>
              <Link href={`/procedures/${procedure.slug}`}>{procedure.name}</Link>{" "}
              ({procedure._count.clinicProcedures} clinics)
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
