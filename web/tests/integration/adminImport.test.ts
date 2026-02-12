import { db } from "@/lib/db";
import { importClinics } from "@/lib/import/importClinics";
import { afterAll, describe, expect, it } from "vitest";

describe("admin clinic import", () => {
  it("upserts a new clinic by slug", async () => {
    const slug = `integration-import-${Date.now()}`;

    await db.clinic.deleteMany({
      where: {
        slug,
      },
    });

    const result = await importClinics({
      dryRun: false,
      rows: [
        {
          name: "Integration Import Clinic",
          slug,
          websiteUrl: "https://integration-import.example",
          whatsapp: "+52-664-000-0000",
        },
      ],
    });

    expect(result.errorCount).toBe(0);
    expect(result.createdCount).toBe(1);
    expect(result.updatedCount).toBe(0);

    const clinic = await db.clinic.findUnique({
      where: {
        slug,
      },
    });

    expect(clinic).not.toBeNull();
    expect(clinic?.name).toBe("Integration Import Clinic");
  });
});

afterAll(async () => {
  await db.$disconnect();
});
