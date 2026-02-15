import { describe, expect, it } from "vitest";
import { applySuggestionToClinic } from "@/lib/suggestions/applySuggestionToClinic";

describe("applySuggestionToClinic auto-publish", () => {
  it("includes isPublished=true when suggestion adds first contact info", () => {
    const updates = applySuggestionToClinic(
      {
        phone: "",
        websiteUrl: "",
        whatsapp: "",
        isPublished: false,
      },
      {
        suggestedWebsiteUrl: "https://x.com",
      },
    );

    expect(updates).toEqual({
      websiteUrl: "https://x.com",
      isPublished: true,
    });
  });

  it("does not include isPublished when clinic already had contact", () => {
    const updates = applySuggestionToClinic(
      {
        phone: "+52-664-000-0000",
        websiteUrl: "",
        whatsapp: "",
        isPublished: false,
      },
      {
        // Represents a note-only suggestion for contact fields.
      },
    );

    expect("isPublished" in updates).toBe(false);
    expect(updates).toEqual({});
  });
});
