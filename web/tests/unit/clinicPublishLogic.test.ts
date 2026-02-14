import { describe, expect, it } from "vitest";
import { computeIsPublished } from "@/lib/clinics/publishLogic";

describe("computeIsPublished", () => {
  it("returns true when direct contact details exist", () => {
    expect(
      computeIsPublished({
        phone: "+52-664-111-1111",
        websiteUrl: "",
        whatsapp: "",
      }),
    ).toBe(true);
  });

  it("returns false when all direct contact details are missing", () => {
    expect(
      computeIsPublished({
        phone: "",
        websiteUrl: "",
        whatsapp: "",
      }),
    ).toBe(false);
  });
});
