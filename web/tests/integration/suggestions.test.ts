import { afterAll, describe, expect, it } from "vitest";
import { ClinicEditSuggestionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import {
  applyClinicEditSuggestion,
  submitClinicEditSuggestion,
} from "@/lib/suggestions/service";

describe("clinic edit suggestions", () => {
  it("stores suggestions as PENDING and applies updates to clinic fields", async () => {
    const suffix = Date.now();
    const clinicSlug = `integration-suggestion-${suffix}`;

    await db.clinic.deleteMany({
      where: {
        slug: clinicSlug,
      },
    });

    const clinic = await db.clinic.create({
      data: {
        name: `Suggestion Clinic ${suffix}`,
        slug: clinicSlug,
        city: "Tijuana",
        state: "BC",
        country: "MX",
        phone: "+52-664-100-0000",
        whatsapp: "+52-664-200-0000",
      },
      select: {
        id: true,
      },
    });

    try {
      const submitResult = await submitClinicEditSuggestion({
        clinicSlug,
        sessionId: `test-suggestion-submit-${suffix}`,
        payload: {
          suggestedPhone: "+52-664-999-9999",
          suggestedWebsiteUrl: "https://integration-suggest.example.com",
          suggestedNote: "Please update contact details.",
          contactEmail: "integration@example.com",
        },
      });

      expect(submitResult.ok).toBe(true);
      if (!submitResult.ok) {
        return;
      }

      const suggestionId = submitResult.data.suggestionId;
      const pendingSuggestion = await db.clinicEditSuggestion.findUnique({
        where: {
          id: suggestionId,
        },
        select: {
          status: true,
          suggestedPhone: true,
          suggestedWebsiteUrl: true,
          clinicId: true,
        },
      });

      expect(pendingSuggestion).not.toBeNull();
      expect(pendingSuggestion?.status).toBe(ClinicEditSuggestionStatus.PENDING);
      expect(pendingSuggestion?.clinicId).toBe(clinic.id);

      const applyResult = await applyClinicEditSuggestion({
        suggestionId,
        adminSessionId: `test-suggestion-admin-${suffix}`,
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
          phone: true,
          whatsapp: true,
          websiteUrl: true,
          yelpUrl: true,
        },
      });

      expect(updatedClinic?.phone).toBe("+52-664-999-9999");
      expect(updatedClinic?.websiteUrl).toBe("https://integration-suggest.example.com");
      expect(updatedClinic?.whatsapp).toBe("+52-664-200-0000");
      expect(updatedClinic?.yelpUrl).toBeNull();

      const appliedSuggestion = await db.clinicEditSuggestion.findUnique({
        where: {
          id: suggestionId,
        },
        select: {
          status: true,
        },
      });

      expect(appliedSuggestion?.status).toBe(ClinicEditSuggestionStatus.APPLIED);
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
