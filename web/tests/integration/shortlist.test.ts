import { db } from "@/lib/db";
import { toggleSavedClinic } from "@/lib/shortlist";
import { afterAll, describe, expect, it } from "vitest";

describe("session shortlist", () => {
  it("toggles a clinic save state and logs shortlist events", async () => {
    const sessionId = "test-session-123";
    const clinic = await db.clinic.findFirst({
      select: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    expect(clinic).not.toBeNull();
    if (!clinic) {
      return;
    }

    await db.savedClinic.deleteMany({
      where: {
        sessionId,
        clinicId: clinic.id,
      },
    });
    await db.event.deleteMany({
      where: {
        sessionId,
        clinicId: clinic.id,
        eventName: {
          in: ["shortlist_add", "shortlist_remove"],
        },
      },
    });

    const firstToggle = await toggleSavedClinic({
      sessionId,
      clinicId: clinic.id,
      source: "clinics_list",
    });
    expect(firstToggle).toEqual({ saved: true });

    const savedAfterFirstToggle = await db.savedClinic.count({
      where: {
        sessionId,
        clinicId: clinic.id,
      },
    });
    expect(savedAfterFirstToggle).toBe(1);

    const secondToggle = await toggleSavedClinic({
      sessionId,
      clinicId: clinic.id,
      source: "clinics_list",
    });
    expect(secondToggle).toEqual({ saved: false });

    const savedAfterSecondToggle = await db.savedClinic.count({
      where: {
        sessionId,
        clinicId: clinic.id,
      },
    });
    expect(savedAfterSecondToggle).toBe(0);

    const events = await db.event.findMany({
      where: {
        sessionId,
        clinicId: clinic.id,
        eventName: {
          in: ["shortlist_add", "shortlist_remove"],
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        eventName: true,
      },
    });

    expect(events.map((event) => event.eventName)).toEqual([
      "shortlist_add",
      "shortlist_remove",
    ]);
  });
});

afterAll(async () => {
  await db.$disconnect();
});
