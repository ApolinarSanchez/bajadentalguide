import { db } from "@/lib/db";
import { afterAll, describe, expect, it } from "vitest";

describe("Clinics database seed", () => {
  it("has at least one clinic record", async () => {
    const clinicCount = await db.clinic.count();

    expect(clinicCount).toBeGreaterThan(0);
  });
});

afterAll(async () => {
  await db.$disconnect();
});
