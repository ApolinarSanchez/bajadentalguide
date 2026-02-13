import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { consumeRateLimit, getWindowStart } from "@/lib/rateLimit";

describe("DB rate limiting", () => {
  it("limits review_submit action within the same window", async () => {
    const now = new Date("2026-02-13T10:05:30.000Z");
    const key = `test-session-rate-${randomUUID()}`;
    const action = "review_submit";
    const windowSec = 60;
    const limit = 2;
    const windowStart = getWindowStart(now, windowSec);

    const first = await consumeRateLimit({ key, action, windowSec, limit, now });
    const second = await consumeRateLimit({ key, action, windowSec, limit, now });
    const third = await consumeRateLimit({ key, action, windowSec, limit, now });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);

    const counter = await db.rateLimitCounter.findUnique({
      where: {
        key_action_windowStart: {
          key,
          action,
          windowStart,
        },
      },
      select: {
        count: true,
      },
    });

    expect(counter?.count).toBe(2);
  });

  it("limits email_capture action within the same window", async () => {
    const now = new Date("2026-02-13T11:12:15.000Z");
    const key = `test-session-email-rate-${randomUUID()}`;
    const action = "email_capture";
    const windowSec = 60;
    const limit = 2;

    const first = await consumeRateLimit({ key, action, windowSec, limit, now });
    const second = await consumeRateLimit({ key, action, windowSec, limit, now });
    const third = await consumeRateLimit({ key, action, windowSec, limit, now });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
  });
});

afterAll(async () => {
  await db.$disconnect();
});
