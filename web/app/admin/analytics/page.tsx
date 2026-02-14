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
    <section className="stack">
      <header className="pageHeader stack">
        <div className="pageTitleRow">
          <h1>Analytics</h1>
          <Link href="/admin" className="btn btnSecondary btnSm">
            Back to admin
          </Link>
        </div>
        <p className="pageSubtitle">
          Last 7-day and 30-day activity snapshots across outbound clicks, shortlist adds, and
          review activity.
        </p>
      </header>

      <div className="grid">
        <section className="card stack">
          <h2>Summary</h2>
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Last 7 days</th>
                  <th>Last 30 days</th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>{row.sevenDayValue}</td>
                    <td>{row.thirtyDayValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card stack">
          <h2>Outbound by destination</h2>
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>Last 7 days</th>
                  <th>Last 30 days</th>
                </tr>
              </thead>
              <tbody>
                {outboundRows.map((dest) => (
                  <tr key={dest}>
                    <td>{dest}</td>
                    <td>{outboundByDest7[dest]}</td>
                    <td>{outboundByDest30[dest]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="grid2">
        <section className="card stack">
          <h2>Top clinics by outbound clicks</h2>
          {topOutbound7.length === 0 ? (
            <p>No outbound click data in the last 7 days.</p>
          ) : (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Clinic</th>
                    <th>Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {topOutbound7.map((clinic) => (
                    <tr key={clinic.clinicId}>
                      <td>
                        <Link href={`/clinics/${clinic.clinicSlug}`}>{clinic.clinicName}</Link>
                      </td>
                      <td>{clinic.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card stack">
          <h2>Top clinics by shortlist adds</h2>
          {topShortlist7.length === 0 ? (
            <p>No shortlist add data in the last 7 days.</p>
          ) : (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Clinic</th>
                    <th>Adds</th>
                  </tr>
                </thead>
                <tbody>
                  {topShortlist7.map((clinic) => (
                    <tr key={clinic.clinicId}>
                      <td>
                        <Link href={`/clinics/${clinic.clinicSlug}`}>{clinic.clinicName}</Link>
                      </td>
                      <td>{clinic.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="card stack">
        <h2>Pending reviews</h2>
        <p>Pending reviews: {reviewCounts30.pendingOverall}</p>
        <p>
          <Link href="/admin/reviews">Go to moderation queue</Link>
        </p>
      </section>
    </section>
  );
}
