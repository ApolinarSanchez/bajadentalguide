import Link from "next/link";
import {
  getEventCounts,
  getOutboundClicksByDest,
  getReviewCounts,
  getTopClinicsByOutboundClicks,
  getTopClinicsByShortlistAdds,
} from "@/lib/admin/analytics";

export const dynamic = "force-dynamic";

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function countForEvent(counts: Record<string, number>, eventName: string) {
  return counts[eventName] ?? 0;
}

export default async function AdminAnalyticsPage() {
  const since7 = daysAgo(7);
  const since30 = daysAgo(30);

  const [
    eventCounts7,
    eventCounts30,
    outboundByDest7,
    outboundByDest30,
    topOutbound7,
    topShortlist7,
    reviewCounts7,
    reviewCounts30,
  ] = await Promise.all([
    getEventCounts({ since: since7 }),
    getEventCounts({ since: since30 }),
    getOutboundClicksByDest({ since: since7 }),
    getOutboundClicksByDest({ since: since30 }),
    getTopClinicsByOutboundClicks({ since: since7, limit: 10 }),
    getTopClinicsByShortlistAdds({ since: since7, limit: 10 }),
    getReviewCounts({ since: since7 }),
    getReviewCounts({ since: since30 }),
  ]);

  const summaryRows = [
    {
      label: "outbound clicks",
      sevenDayValue: countForEvent(eventCounts7, "outbound_click"),
      thirtyDayValue: countForEvent(eventCounts30, "outbound_click"),
    },
    {
      label: "shortlist adds",
      sevenDayValue: countForEvent(eventCounts7, "shortlist_add"),
      thirtyDayValue: countForEvent(eventCounts30, "shortlist_add"),
    },
    {
      label: "reviews submitted",
      sevenDayValue: reviewCounts7.createdSince,
      thirtyDayValue: reviewCounts30.createdSince,
    },
    {
      label: "reviews published",
      sevenDayValue: reviewCounts7.publishedSince,
      thirtyDayValue: reviewCounts30.publishedSince,
    },
    {
      label: "email captures",
      sevenDayValue: countForEvent(eventCounts7, "email_capture"),
      thirtyDayValue: countForEvent(eventCounts30, "email_capture"),
    },
  ];

  const outboundRows = ["website", "whatsapp", "google", "yelp"] as const;

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Analytics</h1>
      <p>
        <Link href="/admin">Back to admin</Link>
      </p>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Summary</h2>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "0.5rem" }}>
                Metric
              </th>
              <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "0.5rem" }}>
                Last 7 days
              </th>
              <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "0.5rem" }}>
                Last 30 days
              </th>
            </tr>
          </thead>
          <tbody>
            {summaryRows.map((row) => (
              <tr key={row.label}>
                <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{row.label}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{row.sevenDayValue}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{row.thirtyDayValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Outbound by destination</h2>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "0.5rem" }}>
                Destination
              </th>
              <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "0.5rem" }}>
                Last 7 days
              </th>
              <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "0.5rem" }}>
                Last 30 days
              </th>
            </tr>
          </thead>
          <tbody>
            {outboundRows.map((dest) => (
              <tr key={dest}>
                <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{dest}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{outboundByDest7[dest]}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{outboundByDest30[dest]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Top clinics by outbound clicks</h2>
        {topOutbound7.length === 0 ? (
          <p>No outbound click data in the last 7 days.</p>
        ) : (
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "0.5rem" }}>
                  Clinic
                </th>
                <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "0.5rem" }}>
                  Clicks
                </th>
              </tr>
            </thead>
            <tbody>
              {topOutbound7.map((clinic) => (
                <tr key={clinic.clinicId}>
                  <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                    <Link href={`/clinics/${clinic.clinicSlug}`}>{clinic.clinicName}</Link>
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{clinic.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Top clinics by shortlist adds</h2>
        {topShortlist7.length === 0 ? (
          <p>No shortlist add data in the last 7 days.</p>
        ) : (
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "0.5rem" }}>
                  Clinic
                </th>
                <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "0.5rem" }}>
                  Adds
                </th>
              </tr>
            </thead>
            <tbody>
              {topShortlist7.map((clinic) => (
                <tr key={clinic.clinicId}>
                  <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                    <Link href={`/clinics/${clinic.clinicSlug}`}>{clinic.clinicName}</Link>
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{clinic.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Pending reviews</h2>
        <p>Pending reviews: {reviewCounts30.pendingOverall}</p>
        <p>
          <Link href="/admin/reviews">Go to moderation queue</Link>
        </p>
      </section>
    </main>
  );
}
