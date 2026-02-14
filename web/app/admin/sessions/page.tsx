import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminSessionsPage() {
  const sessions = await db.sessionProfile.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      sessionId: true,
      email: true,
      emailOptIn: true,
      emailCapturedAt: true,
      unsubscribedAt: true,
      _count: {
        select: {
          emailLogs: true,
        },
      },
    },
  });

  return (
    <section className="stack">
      <header className="pageHeader stack">
        <div className="pageTitleRow">
          <h1>Session email profiles</h1>
          <Link href="/admin" className="btn btnSecondary btnSm">
            Back to admin
          </Link>
        </div>
        <p className="pageSubtitle">
          Review saved session emails, opt-in status, and delivery log counts.
        </p>
      </header>

      {sessions.length === 0 ? (
        <p className="card">No session profiles yet.</p>
      ) : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Email</th>
                <th>Opt in</th>
                <th>Captured at</th>
                <th>Unsubscribed at</th>
                <th>Email logs</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.sessionId}>
                  <td>{session.sessionId}</td>
                  <td>{session.email ?? "-"}</td>
                  <td>
                    <span className="badge">
                      {session.emailOptIn ? "true" : "false"}
                    </span>
                  </td>
                  <td>
                    {session.emailCapturedAt
                      ? new Date(session.emailCapturedAt).toISOString()
                      : "-"}
                  </td>
                  <td>
                    {session.unsubscribedAt
                      ? new Date(session.unsubscribedAt).toISOString()
                      : "-"}
                  </td>
                  <td>{session._count.emailLogs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
