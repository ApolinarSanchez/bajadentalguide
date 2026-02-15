import { describe, expect, it } from "vitest";
import { clinicMetadataRobots } from "@/lib/clinics/metadata";

describe("clinicMetadataRobots", () => {
  it("returns index=true for published clinics", () => {
    const robots = clinicMetadataRobots({ isPublished: true });

    expect(robots.index).toBe(true);
    expect(robots.follow).toBe(true);
  });

  it("returns index=false for unpublished clinics", () => {
    const robots = clinicMetadataRobots({ isPublished: false });

    expect(robots.index).toBe(false);
    expect(robots.follow).toBe(true);
  });

  it("returns index=false when clinic is missing", () => {
    const robots = clinicMetadataRobots(null);

    expect(robots.index).toBe(false);
    expect(robots.follow).toBe(true);
  });
});
