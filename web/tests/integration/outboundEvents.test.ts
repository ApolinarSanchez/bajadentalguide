import { db } from "@/lib/db";
import { logOutboundClick } from "@/lib/events/logOutboundClick";
import { afterAll, describe, expect, it } from "vitest";

describe("outbound click events", () => {
  it("creates an outbound_click event for a website destination", async () => {
    const clinic = await db.clinic.findFirst({
      where: {
        websiteUrl: {
          not: null,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    expect(clinic).not.toBeNull();
    if (!clinic) {
      return;
    }

    const sessionId = `integration-outbound-${Date.now()}`;

    const result = await logOutboundClick({
      slug: clinic.slug,
      dest: "website",
      sessionId,
    });

    expect(result).not.toBeNull();

    const event = await db.event.findFirst({
      where: {
        sessionId,
        clinicId: clinic.id,
        eventName: "outbound_click",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    expect(event).not.toBeNull();
    expect(event?.metadata).toEqual({ dest: "website" });
  });
});

afterAll(async () => {
  await db.$disconnect();
});
