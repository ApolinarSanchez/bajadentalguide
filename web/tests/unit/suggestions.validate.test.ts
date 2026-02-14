import { describe, expect, it } from "vitest";
import { validateClinicEditSuggestion } from "@/lib/suggestions/validateSuggestion";

describe("validateClinicEditSuggestion", () => {
  it("rejects invalid payload types", () => {
    const result = validateClinicEditSuggestion(null);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain("Request body must be an object.");
    }
  });

  it("rejects payloads without any suggested edits", () => {
    const result = validateClinicEditSuggestion({
      suggestedPhone: " ",
      suggestedWebsiteUrl: "",
      suggestedNote: " ",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain("Provide at least one suggested field or note.");
    }
  });

  it("rejects invalid URLs and email", () => {
    const result = validateClinicEditSuggestion({
      suggestedWebsiteUrl: "notaurl",
      contactEmail: "invalid-email",
      suggestedNote: "please update",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain("suggestedWebsiteUrl must be a valid URL.");
      expect(result.errors).toContain("contactEmail is invalid.");
    }
  });

  it("accepts valid payload", () => {
    const result = validateClinicEditSuggestion({
      suggestedPhone: " +52 664 000 0000 ",
      suggestedWebsiteUrl: "https://example.com",
      suggestedNote: "Please update website and phone.",
      contactEmail: "editor@example.com",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.suggestedPhone).toBe("+52 664 000 0000");
      expect(result.value.suggestedWebsiteUrl).toBe("https://example.com");
      expect(result.value.contactEmail).toBe("editor@example.com");
    }
  });
});
