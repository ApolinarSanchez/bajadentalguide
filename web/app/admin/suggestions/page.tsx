import { ClinicEditSuggestionStatus } from "@prisma/client";
import Link from "next/link";
import { SuggestionModerationActions } from "@/components/admin/SuggestionModerationActions";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function SuggestionValue({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <p>
      <strong>{label}:</strong> {value}
    </p>
  );
}

export default async function AdminSuggestionsPage() {
  const pendingSuggestions = await db.clinicEditSuggestion.findMany({
    where: {
      status: ClinicEditSuggestionStatus.PENDING,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      createdAt: true,
      suggestedPhone: true,
      suggestedWhatsapp: true,
      suggestedWebsiteUrl: true,
      suggestedYelpUrl: true,
      suggestedNote: true,
      contactEmail: true,
      clinic: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  return (
    <section className="stack">
      <header className="pageHeader stack">
        <div className="pageTitleRow">
          <h1>Edit suggestions</h1>
          <Link href="/admin" className="btn btnSecondary btnSm">
            Back to admin
          </Link>
        </div>
        <p className="pageSubtitle">
          Review pending clinic edit suggestions and apply valid updates.
        </p>
      </header>

      {pendingSuggestions.length === 0 ? (
        <p className="card">No pending suggestions.</p>
      ) : (
        <ul className="cards">
          {pendingSuggestions.map((suggestion) => (
            <li key={suggestion.id} className="card stack">
              <div className="row">
                <Link href={`/clinics/${suggestion.clinic.slug}`}>{suggestion.clinic.name}</Link>
                <span className="badge">
                  {new Date(suggestion.createdAt).toLocaleString()}
                </span>
              </div>
              <SuggestionValue label="Phone" value={suggestion.suggestedPhone} />
              <SuggestionValue label="WhatsApp" value={suggestion.suggestedWhatsapp} />
              <SuggestionValue label="Website URL" value={suggestion.suggestedWebsiteUrl} />
              <SuggestionValue label="Yelp URL" value={suggestion.suggestedYelpUrl} />
              <SuggestionValue label="Note" value={suggestion.suggestedNote} />
              <SuggestionValue label="Contact email" value={suggestion.contactEmail} />
              <SuggestionModerationActions suggestionId={suggestion.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
