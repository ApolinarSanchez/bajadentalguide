import { slugify } from "@/lib/slugify";
import { describe, expect, it } from "vitest";

describe("slugify", () => {
  it("normalizes accented words into URL-safe output", () => {
    expect(slugify("Clinica Dental Río")).toBe("clinica-dental-rio");
  });
});
