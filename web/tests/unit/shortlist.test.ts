import { buildSavedSet } from "@/lib/shortlist";
import { describe, expect, it } from "vitest";

describe("buildSavedSet", () => {
  it("returns a Set of clinic IDs from saved rows", () => {
    const savedSet = buildSavedSet([
      { clinicId: "clinic-a" },
      { clinicId: "clinic-b" },
      { clinicId: "clinic-a" },
    ]);

    expect(savedSet.has("clinic-a")).toBe(true);
    expect(savedSet.has("clinic-b")).toBe(true);
    expect(savedSet.size).toBe(2);
  });
});
