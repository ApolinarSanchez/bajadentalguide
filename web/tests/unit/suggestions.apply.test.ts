import { describe, expect, it } from "vitest";
import {
  applySuggestionToClinic,
  buildClinicContactUpdatesFromSuggestion,
} from "@/lib/suggestions/applySuggestionToClinic";

describe("applySuggestionToClinic", () => {
  it("returns updates for only provided fields", () => {
    const clinic = {
      name: "Test Clinic",
      phone: "+52-111-111-1111",
      whatsapp: "+52-222-222-2222",
      websiteUrl: "https://old.example.com",
      yelpUrl: "https://old-yelp.example.com",
      isPublished: true,
    };

    const updates = applySuggestionToClinic(clinic, {
      suggestedWebsiteUrl: "https://new.example.com",
      suggestedYelpUrl: "https://new-yelp.example.com",
    });

    expect(updates).toEqual({
      websiteUrl: "https://new.example.com",
      yelpUrl: "https://new-yelp.example.com",
    });
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
