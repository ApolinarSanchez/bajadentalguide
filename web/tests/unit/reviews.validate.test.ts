import { describe, expect, it } from "vitest";
import { validateReview } from "@/lib/reviews/validateReview";

describe("validateReview", () => {
  const validBody = "A".repeat(60);

  it("rejects rating 0 and 6", () => {
    const invalidLow = validateReview({
      clinicId: "clinic-1",
      ratingOverall: 0,
      body: validBody,
    });
    const invalidHigh = validateReview({
      clinicId: "clinic-1",
      ratingOverall: 6,
      body: validBody,
    });

    expect(invalidLow.ok).toBe(false);
    expect(invalidHigh.ok).toBe(false);
  });

  it("rejects too short body", () => {
    const result = validateReview({
      clinicId: "clinic-1",
      ratingOverall: 5,
      body: "too short",
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("body must be at least 40 characters.");
  });

  it("accepts valid payload", () => {
    const result = validateReview({
      clinicId: "clinic-1",
      ratingOverall: 5,
      body: validBody,
      procedure: "implants",
      visitMonth: 12,
      visitYear: 2026,
      headline: "Great visit",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.clinicId).toBe("clinic-1");
      expect(result.value.ratingOverall).toBe(5);
      expect(result.value.procedure).toBe("implants");
    }
  });
});
