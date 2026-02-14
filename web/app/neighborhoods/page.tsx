import Link from "next/link";
import { listNeighborhoods } from "@/lib/neighborhoods";

export const dynamic = "force-dynamic";

export default async function NeighborhoodsPage() {
  const neighborhoods = await listNeighborhoods();

  return (
    <section className="stack">
      <header className="pageHeader stack">
        <div className="pageTitleRow">
          <h1>Neighborhoods</h1>
        </div>
        <p className="pageSubtitle">
          Browse neighborhoods to find nearby dental clinics in Baja California.
        </p>
      </header>
      {neighborhoods.length === 0 ? (
        <p className="card">No neighborhoods found.</p>
      ) : (
        <ul className="cards">
          {neighborhoods.map((neighborhood) => (
            <li key={neighborhood.id} className="card stack">
              <div className="row">
                <Link href={`/neighborhoods/${neighborhood.slug}`}>{neighborhood.name}</Link>
                <span className="badge">{neighborhood._count.clinics} clinics</span>
              </div>
              {neighborhood.description ? (
                <p className="pageSubtitle">{neighborhood.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
