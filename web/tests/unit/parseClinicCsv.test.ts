import { parseClinicCsv } from "@/lib/import/parseClinicCsv";
import { describe, expect, it } from "vitest";

describe("parseClinicCsv", () => {
  it("parses a valid CSV with headers into rows", () => {
    const csv = [
      "name,slug,websiteUrl,whatsapp",
      "Baja Smile Dental,baja-smile-dental,https://example.com,+526645551111",
    ].join("\n");

    const result = parseClinicCsv(csv);

    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      name: "Baja Smile Dental",
      slug: "baja-smile-dental",
      websiteUrl: "https://example.com",
      whatsapp: "+526645551111",
    });
  });

  it("flags missing name rows", () => {
    const csv = ["name,slug,websiteUrl", ",missing-name,https://example.com"].join("\n");

    const result = parseClinicCsv(csv);

    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatchObject({
      rowIndex: 1,
      message: "Name is required.",
    });
  });

  it("generates slug from name when slug is missing", () => {
    const csv = ["name,slug", "Clinica Dental R\u00edo,"].join("\n");

    const result = parseClinicCsv(csv);

    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].slug).toBe("clinica-dental-rio");
  });
});
