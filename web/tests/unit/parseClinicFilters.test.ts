import { parseClinicFilters } from "@/lib/clinics/parseClinicFilters";
import { describe, expect, it } from "vitest";

describe("parseClinicFilters", () => {
  it("parses q and trims whitespace", () => {
    const filters = parseClinicFilters(new URLSearchParams({ q: "  Baja Smile  " }));

    expect(filters.q).toBe("Baja Smile");
  });

  it("parses checkbox params", () => {
    const filters = parseClinicFilters(new URLSearchParams({ hasWebsite: "1" }));

    expect(filters.hasWebsite).toBe(true);
    expect(filters.hasWhatsapp).toBe(false);
  });

  it("defaults sort to name_asc when missing or invalid", () => {
    const missingSort = parseClinicFilters(new URLSearchParams());
    const invalidSort = parseClinicFilters(new URLSearchParams({ sort: "random" }));

    expect(missingSort.sort).toBe("name_asc");
    expect(invalidSort.sort).toBe("name_asc");
  });
});
