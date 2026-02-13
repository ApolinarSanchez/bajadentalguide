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
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Session email profiles</h1>
      {sessions.length === 0 ? (
        <p>No session profiles yet.</p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd", padding: "0.5rem", textAlign: "left" }}>
                Session
              </th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "0.5rem", textAlign: "left" }}>Email</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "0.5rem", textAlign: "left" }}>
                Opt in
              </th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "0.5rem", textAlign: "left" }}>
                Captured at
              </th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "0.5rem", textAlign: "left" }}>
                Unsubscribed at
              </th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "0.5rem", textAlign: "left" }}>
                Email logs
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.sessionId}>
                <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{session.sessionId}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                  {session.email ?? "-"}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                  {session.emailOptIn ? "true" : "false"}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                  {session.emailCapturedAt ? new Date(session.emailCapturedAt).toISOString() : "-"}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                  {session.unsubscribedAt ? new Date(session.unsubscribedAt).toISOString() : "-"}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                  {session._count.emailLogs}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
