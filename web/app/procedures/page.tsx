import Link from "next/link";
import { listProcedures } from "@/lib/procedures";

export const dynamic = "force-dynamic";

export default async function ProceduresPage() {
  const procedures = await listProcedures();

  return (
    <section className="stack">
      <header className="pageHeader stack">
        <div className="pageTitleRow">
          <h1>Procedures</h1>
        </div>
        <p className="pageSubtitle">
          Explore common dental procedures and the clinics that offer them.
        </p>
      </header>
      {procedures.length === 0 ? (
        <p className="card">No procedures found.</p>
      ) : (
        <ul className="cards">
          {procedures.map((procedure) => (
            <li key={procedure.id} className="card stack">
              <div className="row">
                <Link href={`/procedures/${procedure.slug}`}>{procedure.name}</Link>
                <span className="badge">
                  {procedure._count.clinicProcedures} clinics
                </span>
              </div>
              {procedure.description ? (
                <p className="pageSubtitle">{procedure.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
