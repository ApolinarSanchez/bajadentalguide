import { db } from "@/lib/db";
import { runFollowupJobs } from "@/lib/email/followupRunner";
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";

type FakeProviderMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

describe("followup job", () => {
  it("sends only once per session and logs email sent", async () => {
    const sessionId = `test-session-followup-${Date.now()}`;
    const email = "followup@example.com";
    const sentMessages: FakeProviderMessage[] = [];

    await db.sessionProfile.upsert({
      where: {
        sessionId,
      },
      create: {
        sessionId,
        email,
        emailOptIn: true,
        emailCapturedAt: new Date("2026-01-30T00:00:00.000Z"),
        unsubscribedAt: null,
        unsubscribeToken: randomUUID(),
      },
      update: {
        emailOptIn: true,
        emailCapturedAt: new Date("2026-01-30T00:00:00.000Z"),
        unsubscribedAt: null,
        email: email,
        unsubscribeToken: randomUUID(),
      },
    });

    await db.emailLog.deleteMany({
      where: {
        sessionId,
      },
    });

    const fakeProvider = {
      async sendEmail(message: FakeProviderMessage) {
        sentMessages.push(message);
      },
    };

    const first = await runFollowupJobs({
      now: new Date("2026-02-08T00:00:00.000Z"),
      provider: fakeProvider,
    });
    expect(first.sent).toBe(1);
    expect(sentMessages).toHaveLength(1);

    const log = await db.emailLog.findFirst({
      where: {
        sessionId,
        template: "followup_7d",
      },
      select: {
        status: true,
      },
    });
    expect(log?.status).toBe("sent");

    const second = await runFollowupJobs({
      now: new Date("2026-02-08T00:00:00.000Z"),
      provider: fakeProvider,
    });

    expect(second.sent).toBe(0);
    expect(sentMessages).toHaveLength(1);
  });

  it("does not schedule followups when unsubscribed", async () => {
    const sessionId = `test-session-followup-unsub-${Date.now()}`;
    const email = "followup-unsub@example.com";

    await db.sessionProfile.upsert({
      where: {
        sessionId,
      },
      create: {
        sessionId,
        email,
        emailOptIn: true,
        emailCapturedAt: new Date("2026-01-30T00:00:00.000Z"),
        unsubscribedAt: new Date("2026-01-31T00:00:00.000Z"),
        unsubscribeToken: randomUUID(),
      },
      update: {
        emailOptIn: true,
        emailCapturedAt: new Date("2026-01-30T00:00:00.000Z"),
        unsubscribedAt: new Date("2026-01-31T00:00:00.000Z"),
        email,
        unsubscribeToken: randomUUID(),
      },
    });

    await db.emailLog.deleteMany({
      where: {
        sessionId,
      },
    });

    const sentMessages: FakeProviderMessage[] = [];
    const fakeProvider = {
      async sendEmail(message: FakeProviderMessage) {
        sentMessages.push(message);
      },
    };

    const result = await runFollowupJobs({
      now: new Date("2026-02-08T00:00:00.000Z"),
      provider: fakeProvider,
    });

    expect(result.sent).toBe(0);
    expect(sentMessages).toHaveLength(0);
  });
});

afterAll(async () => {
  await db.$disconnect();
});
