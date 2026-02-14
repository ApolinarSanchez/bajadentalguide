import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const clinics = await db.clinic.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      websiteUrl: true,
      whatsapp: true,
      updatedAt: true,
    },
  });

  return (
    <section className="stack">
      <header className="pageHeader stack">
        <div className="pageTitleRow">
          <h1>Admin Clinics</h1>
        </div>
        <p className="pageSubtitle">
          Manage clinic listings and jump to import, analytics, moderation, and
          session tools.
        </p>
        <nav aria-label="Admin sections" className="row">
          <Link href="/admin/import" className="btn btnPrimary">
            Import clinics CSV
          </Link>
          <Link href="/admin/analytics" className="btn btnSecondary">
            Analytics dashboard
          </Link>
          <Link href="/admin/reviews" className="btn btnGhost">
            Moderate reviews
          </Link>
          <Link href="/admin/sessions" className="btn btnGhost">
            Session email profiles
          </Link>
        </nav>
      </header>
      <div className="tableWrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Website</th>
              <th>WhatsApp</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((clinic) => (
              <tr key={clinic.id}>
                <td>
                  <Link href={`/clinics/${clinic.slug}`}>{clinic.name}</Link>
                </td>
                <td>{clinic.slug}</td>
                <td>
                  {clinic.websiteUrl ? (
                    <a href={clinic.websiteUrl} target="_blank" rel="noreferrer">
                      {clinic.websiteUrl}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{clinic.whatsapp ?? "-"}</td>
                <td>{new Date(clinic.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
