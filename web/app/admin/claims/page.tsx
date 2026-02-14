import { ClinicClaimRequestStatus } from "@prisma/client";
import Link from "next/link";
import { ClaimRequestActions } from "@/components/admin/ClaimRequestActions";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function ClaimValue({
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

export default async function AdminClaimsPage() {
  const pendingClaims = await db.clinicClaimRequest.findMany({
    where: {
      status: ClinicClaimRequestStatus.PENDING,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      message: true,
      createdAt: true,
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
          <h1>Claim requests</h1>
          <Link href="/admin" className="btn btnSecondary btnSm">
            Back to admin
          </Link>
        </div>
        <p className="pageSubtitle">
          Review pending listing ownership requests and mark them as processed.
        </p>
      </header>

      {pendingClaims.length === 0 ? (
        <p className="card">No pending claim requests.</p>
      ) : (
        <ul className="cards">
          {pendingClaims.map((claim) => (
            <li key={claim.id} className="card stack">
              <div className="row">
                <Link href={`/clinics/${claim.clinic.slug}`}>{claim.clinic.name}</Link>
                <span className="badge">{new Date(claim.createdAt).toLocaleString()}</span>
              </div>
              <p>
                <strong>Name:</strong> {claim.name}
              </p>
              <p>
                <strong>Email:</strong> {claim.email}
              </p>
              <ClaimValue label="Role" value={claim.role} />
              <ClaimValue label="Message" value={claim.message} />
              <ClaimRequestActions claimRequestId={claim.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
