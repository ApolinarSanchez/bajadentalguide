import { describe, expect, it } from "vitest";
import { getWindowStart, rateLimitResponse } from "@/lib/rateLimit";

describe("rate limit helpers", () => {
  it("getWindowStart floors to start of the window", () => {
    const now = new Date("2026-02-13T12:34:56.789Z");
    const windowStart = getWindowStart(now, 3600);

    expect(windowStart.toISOString()).toBe("2026-02-13T12:00:00.000Z");
  });

  it("rateLimitResponse returns 429 payload", async () => {
    const resetAt = new Date(Date.now() + 45_000);
    const response = rateLimitResponse(resetAt);
    const payload = (await response.json()) as {
      ok: boolean;
      error: string;
      message: string;
    };

    expect(response.status).toBe(429);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("rate_limited");
    expect(payload.message).toBe("Too many requests. Please try again later.");
  });
});
