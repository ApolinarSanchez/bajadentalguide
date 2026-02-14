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

  const isFeatured = formData.get("isFeatured") === "on";
  const featuredRankRaw = formData.get("featuredRank");
  let featuredRank: number | null = null;

  if (typeof featuredRankRaw === "string" && featuredRankRaw.trim().length > 0) {
    const parsedRank = Number.parseInt(featuredRankRaw.trim(), 10);
    if (Number.isFinite(parsedRank)) {
      featuredRank = parsedRank;
    }
  }

  await db.clinic.update({
    where: {
      id: clinicId,
    },
    data: {
      isFeatured,
      featuredRank: isFeatured ? featuredRank : null,
    },
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
                <td>
                  <form action={updateClinicFeatured} className="row">
                    <input type="hidden" name="clinicId" value={clinic.id} />
                    <label className="checkboxLabel">
                      <input type="checkbox" name="isFeatured" defaultChecked={clinic.isFeatured} />
                      Featured
                    </label>
                    <button type="submit" className="btn btnSecondary btnSm">
                      Save
                    </button>
                  </form>
                </td>
                <td>
                  <form action={updateClinicFeatured} className="row">
                    <input type="hidden" name="clinicId" value={clinic.id} />
                    {clinic.isFeatured ? <input type="hidden" name="isFeatured" value="on" /> : null}
                    <input
                      type="number"
                      name="featuredRank"
                      min={1}
                      step={1}
                      defaultValue={clinic.featuredRank ?? ""}
                      className="inputSm"
                      aria-label={`Featured rank for ${clinic.name}`}
                    />
                    <button type="submit" className="btn btnSecondary btnSm">
                      Save rank
                    </button>
                  </form>
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
