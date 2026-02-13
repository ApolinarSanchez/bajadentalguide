import { describe, expect, it } from "vitest";
import { FOLLOWUP_7D_TEMPLATE, isFollowupDue } from "@/lib/email/followupSchedule";

describe("follow-up schedule", () => {
  const now = new Date("2026-02-13T12:00:00.000Z");
  const eightDaysAgo = new Date(Date.UTC(2026, 1, 5, 12, 0, 0));
  const twoDaysAgo = new Date(Date.UTC(2026, 1, 11, 12, 0, 0));

  it("due when captured 8 days ago", () => {
    const due = isFollowupDue(
      {
        emailOptIn: true,
        unsubscribedAt: null,
        emailCapturedAt: eightDaysAgo,
      },
      now,
      false,
    );

    expect(due).toBe(true);
  });

  it("not due when captured 2 days ago", () => {
    const due = isFollowupDue(
      {
        emailOptIn: true,
        unsubscribedAt: null,
        emailCapturedAt: twoDaysAgo,
      },
      now,
      false,
    );

    expect(due).toBe(false);
  });

  it("not due when unsubscribed", () => {
    const due = isFollowupDue(
      {
        emailOptIn: true,
        unsubscribedAt: new Date("2026-02-10T12:00:00.000Z"),
        emailCapturedAt: eightDaysAgo,
      },
      now,
      false,
    );

    expect(due).toBe(false);
  });

  it(`not due when ${FOLLOWUP_7D_TEMPLATE} already logged`, () => {
    const due = isFollowupDue(
      {
        emailOptIn: true,
        unsubscribedAt: null,
        emailCapturedAt: eightDaysAgo,
      },
      now,
      true,
    );

    expect(due).toBe(false);
  });
});
