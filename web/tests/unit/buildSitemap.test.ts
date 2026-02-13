import { describe, expect, it } from "vitest";
import { STATIC_SITEMAP_PATHS, buildSitemap } from "@/lib/seo/buildSitemap";

describe("buildSitemap", () => {
  it("includes static routes", () => {
    const entries = buildSitemap({
      baseUrl: "http://localhost:3000",
      clinicSlugs: [],
      procedureSlugs: [],
      neighborhoodSlugs: [],
    });

    const urls = entries.map((entry) => entry.url);
    const expectedStaticUrls = STATIC_SITEMAP_PATHS.map(
      (path) => `http://localhost:3000${path}`,
    );

    expectedStaticUrls.forEach((url) => {
      expect(urls).toContain(url);
    });
  });

  it("includes clinic, procedure, and neighborhood urls", () => {
    const entries = buildSitemap({
      baseUrl: "http://localhost:3000/",
      clinicSlugs: ["baja-smile-dental-center"],
      procedureSlugs: ["dental-implants"],
      neighborhoodSlugs: ["zona-rio"],
    });

    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("http://localhost:3000/clinics/baja-smile-dental-center");
    expect(urls).toContain("http://localhost:3000/procedures/dental-implants");
    expect(urls).toContain("http://localhost:3000/neighborhoods/zona-rio");
  });
});
