import { describe, expect, it } from "vitest";
import { buildAddressLine1, buildGoogleMapsUrl, normalizeWebsiteUrl } from "@/lib/denue/normalize";

describe("denue normalize helpers", () => {
  it("normalizes website urls", () => {
    expect(normalizeWebsiteUrl("example.com")).toBe("https://example.com");
    expect(normalizeWebsiteUrl("www.example.com")).toBe("https://www.example.com");
    expect(normalizeWebsiteUrl("http://example.com")).toBe("http://example.com");
    expect(normalizeWebsiteUrl(" ")).toBeUndefined();
    expect(normalizeWebsiteUrl("N/A")).toBeUndefined();
    expect(normalizeWebsiteUrl("notaurl")).toBeUndefined();
  });

  it("builds addressLine1 without undefined artifacts", () => {
    const address = buildAddressLine1({
      Tipo_vialidad: "Av.",
      Calle: "Revolución",
      Num_Exterior: "123",
      Colonia: "Centro",
      CP: "22000",
    });

    expect(address).toBe("Av. Revolución 123, Col. Centro, CP 22000");
    expect(address).not.toContain("undefined");
    expect(address).not.toContain(", ,");
    expect(address).not.toMatch(/\s{2,}/);

    const minimal = buildAddressLine1({
      Colonia: "Otay",
    });
    expect(minimal).toBe("Col. Otay");
  });

  it("builds google maps urls from coordinates when available", () => {
    const url = buildGoogleMapsUrl({
      lat: 32.5,
      lng: -117,
      name: "Ignored if coords exist",
    });

    expect(url.startsWith("https://www.google.com/maps/search/?api=1&query=")).toBe(true);
    expect(new URL(url).searchParams.get("query")).toBe("32.5,-117");
  });

  it("builds google maps urls from name and address when coords are missing", () => {
    const url = buildGoogleMapsUrl({
      name: "Baja Smile",
      addressLine1: "Av. Revolución 123",
      city: "Tijuana",
      state: "BC",
    });

    expect(url.startsWith("https://www.google.com/maps/search/?api=1&query=")).toBe(true);
    const query = new URL(url).searchParams.get("query") ?? "";
    expect(query).toContain("Baja Smile");
    expect(query).toContain("Av. Revolución 123");
    expect(query).toContain("Tijuana");
    expect(query).toContain("BC");
  });
});
