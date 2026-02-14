import { parseClinicFilters } from "@/lib/clinics/parseClinicFilters";
import { describe, expect, it } from "vitest";

describe("parseClinicFilters", () => {
  it("parses q and trims whitespace", () => {
    const filters = parseClinicFilters(new URLSearchParams({ q: "  Baja Smile  " }));

    expect(filters.q).toBe("Baja Smile");
  });

  it("parses checkbox params", () => {
    const filters = parseClinicFilters(
      new URLSearchParams({ hasWebsite: "1", includeUnverified: "1" }),
    );

    expect(filters.hasWebsite).toBe(true);
    expect(filters.hasWhatsapp).toBe(false);
    expect(filters.includeUnverified).toBe(true);
  });

  it("defaults includeUnverified to false", () => {
    const filters = parseClinicFilters(new URLSearchParams());

    expect(filters.includeUnverified).toBe(false);
  });

  it("defaults sort to name_asc when missing or invalid", () => {
    const missingSort = parseClinicFilters(new URLSearchParams());
    const invalidSort = parseClinicFilters(new URLSearchParams({ sort: "random" }));

    expect(missingSort.sort).toBe("name_asc");
    expect(invalidSort.sort).toBe("name_asc");
  });

  it("parses neighborhood slug", () => {
    const filters = parseClinicFilters(new URLSearchParams({ neighborhood: "zona-rio" }));

    expect(filters.neighborhood).toBe("zona-rio");
  });

  it("parses procedure slug", () => {
    const filters = parseClinicFilters(new URLSearchParams({ procedure: "dental-implants" }));

    expect(filters.procedure).toBe("dental-implants");
  });

  it("treats empty neighborhood and procedure values as undefined", () => {
    const filters = parseClinicFilters(
      new URLSearchParams({
        neighborhood: "   ",
        procedure: "",
      }),
    );

    expect(filters.neighborhood).toBeUndefined();
    expect(filters.procedure).toBeUndefined();
  });
});
