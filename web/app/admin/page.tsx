import { AdminClinicFeaturedForm } from "@/components/admin/AdminClinicFeaturedForm";
import { buildFeaturedUpdateData } from "@/lib/clinics/featuredUpdate";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function updateClinicFeatured(formData: FormData) {
  "use server";

  const clinicId = formData.get("clinicId");
  if (typeof clinicId !== "string" || clinicId.trim().length === 0) {
    return;
  }

  const featuredRankRaw = formData.get("featuredRank");
  let data: ReturnType<typeof buildFeaturedUpdateData>;
  try {
    data = buildFeaturedUpdateData({
      isFeatured: formData.get("isFeatured") === "1",
      featuredRankRaw,
    });
  } catch {
    return;
  }

  await db.clinic.update({
    where: {
      id: clinicId,
    },
    data,
  });

  revalidatePath("/admin");
  revalidatePath("/clinics");
}

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
      isFeatured: true,
      featuredRank: true,
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
          <Link href="/admin/curation" className="btn btnSecondary">
            Curation tools
          </Link>
          <Link href="/admin/analytics" className="btn btnSecondary">
            Analytics dashboard
          </Link>
          <Link href="/admin/reviews" className="btn btnGhost">
            Moderate reviews
          </Link>
          <Link href="/admin/claims" className="btn btnGhost">
            Claim requests
          </Link>
          <Link href="/admin/suggestions" className="btn btnGhost">
            Edit suggestions
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
              <th>Featured</th>
              <th>Featured rank</th>
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
                <td colSpan={2}>
                  <AdminClinicFeaturedForm clinic={clinic} action={updateClinicFeatured} />
                </td>
                <td>{new Date(clinic.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
