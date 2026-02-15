import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import {
  applyClinicEditSuggestion,
  submitClinicEditSuggestion,
} from "@/lib/suggestions/service";

describe("suggestions auto-publish invariant", () => {
  it("auto-publishes an unpublished clinic when first contact info is added", async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const clinicSlug = `integration-suggestion-autopublish-${suffix}`;

    await db.clinic.deleteMany({
      where: {
        slug: clinicSlug,
      },
    });

    const clinic = await db.clinic.create({
      data: {
        name: `Suggestion Auto Publish ${suffix}`,
        slug: clinicSlug,
        city: "Tijuana",
        state: "BC",
        country: "MX",
        isPublished: false,
        phone: "",
        websiteUrl: "",
        whatsapp: "",
      },
      select: {
        id: true,
      },
    });

    try {
      const submitResult = await submitClinicEditSuggestion({
        clinicSlug,
        sessionId: `test-suggestion-autopublish-submit-${suffix}`,
        payload: {
          suggestedWebsiteUrl: "https://integration-auto-publish.example.com",
          suggestedNote: "Adding first contact channel.",
        },
      });

      expect(submitResult.ok).toBe(true);
      if (!submitResult.ok) {
        return;
      }

      const applyResult = await applyClinicEditSuggestion({
        suggestionId: submitResult.data.suggestionId,
        adminSessionId: `test-suggestion-autopublish-admin-${suffix}`,
      });

      expect(applyResult.ok).toBe(true);
      if (!applyResult.ok) {
        return;
      }

      const updatedClinic = await db.clinic.findUnique({
        where: {
          id: clinic.id,
        },
        select: {
          websiteUrl: true,
          isPublished: true,
        },
      });

      expect(updatedClinic?.websiteUrl).toBe("https://integration-auto-publish.example.com");
      expect(updatedClinic?.isPublished).toBe(true);
    } finally {
      await db.clinicEditSuggestion.deleteMany({
        where: {
          clinicId: clinic.id,
        },
      });
      await db.clinic.deleteMany({
        where: {
          id: clinic.id,
        },
      });
    }
  });
});

afterAll(async () => {
  await db.$disconnect();
});
