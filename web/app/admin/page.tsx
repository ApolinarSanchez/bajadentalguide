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
    },
  });

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Admin Clinics</h1>
      <p>
        <Link href="/admin/import">Import clinics CSV</Link>
      </p>
      <p>
        <Link href="/admin/reviews">Moderate reviews</Link>
      </p>
      <p>
        <Link href="/admin/analytics">Analytics dashboard</Link>
      </p>
      <p>
        <Link href="/admin/sessions">Session email profiles</Link>
      </p>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>
              Name
            </th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>
              Slug
            </th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>
              Website
            </th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>
              WhatsApp
            </th>
          </tr>
        </thead>
        <tbody>
          {clinics.map((clinic) => (
            <tr key={clinic.id}>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{clinic.name}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{clinic.slug}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                {clinic.websiteUrl ? (
                  <a href={clinic.websiteUrl} target="_blank" rel="noreferrer">
                    {clinic.websiteUrl}
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                {clinic.whatsapp ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
