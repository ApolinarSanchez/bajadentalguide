import { describe, expect, it } from "vitest";
import { sortFeaturedClinics } from "@/lib/clinics/featuredSort";

describe("sortFeaturedClinics", () => {
  it("sorts by featuredRank ascending then name ascending", () => {
    const clinics = [
      { name: "Zeta Dental", featuredRank: 2 },
      { name: "Alpha Dental", featuredRank: 2 },
      { name: "Bravo Dental", featuredRank: 1 },
      { name: "No Rank Dental", featuredRank: null },
    ];

    const sorted = sortFeaturedClinics(clinics);

    expect(sorted.map((clinic) => clinic.name)).toEqual([
      "Bravo Dental",
      "Alpha Dental",
      "Zeta Dental",
      "No Rank Dental",
    ]);
  });
});
