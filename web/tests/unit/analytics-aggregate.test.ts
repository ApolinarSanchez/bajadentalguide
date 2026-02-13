import { describe, expect, it } from "vitest";
import { aggregateOutboundByDest, topNByCount } from "@/lib/admin/analyticsAggregate";

describe("admin analytics aggregation helpers", () => {
  it("aggregates outbound metadata into destination buckets", () => {
    const counts = aggregateOutboundByDest([
      { dest: "website" },
      { dest: "website" },
      { dest: "whatsapp" },
      { dest: "google" },
      { dest: "invalid" },
      null,
      {},
    ]);

    expect(counts).toEqual({
      website: 2,
      whatsapp: 1,
      google: 1,
      yelp: 0,
    });
  });

  it("returns top N rows ordered by count descending", () => {
    const topRows = topNByCount(
      [
        { id: "c-1", count: 2 },
        { id: "c-2", count: 10 },
        { id: "c-3", count: 7 },
      ],
      2,
    );

    expect(topRows).toEqual([
      { id: "c-2", count: 10 },
      { id: "c-3", count: 7 },
    ]);
  });
});
