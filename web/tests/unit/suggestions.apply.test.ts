import { describe, expect, it } from "vitest";
import {
  applySuggestionToClinic,
  buildClinicContactUpdatesFromSuggestion,
} from "@/lib/suggestions/applySuggestionToClinic";

describe("applySuggestionToClinic", () => {
  it("merges only provided fields", () => {
    const clinic = {
      name: "Test Clinic",
      phone: "+52-111-111-1111",
      whatsapp: "+52-222-222-2222",
      websiteUrl: "https://old.example.com",
      yelpUrl: "https://old-yelp.example.com",
    };

    const updated = applySuggestionToClinic(clinic, {
      suggestedWebsiteUrl: "https://new.example.com",
      suggestedYelpUrl: "https://new-yelp.example.com",
    });

    expect(updated.websiteUrl).toBe("https://new.example.com");
    expect(updated.yelpUrl).toBe("https://new-yelp.example.com");
    expect(updated.phone).toBe("+52-111-111-1111");
    expect(updated.whatsapp).toBe("+52-222-222-2222");
  });

  it("ignores empty string suggestions", () => {
    const updates = buildClinicContactUpdatesFromSuggestion({
      suggestedPhone: " ",
      suggestedWhatsapp: "",
      suggestedWebsiteUrl: "\t",
      suggestedYelpUrl: "\n",
    });

    expect(updates).toEqual({});
  });
});
