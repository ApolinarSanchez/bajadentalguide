import type { MetadataRoute } from "next";

const DISALLOWED_PATHS = ["/admin/", "/api/", "/__e2e__/", "/out/"];

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.BASE_URL ??
    "http://localhost:3000";
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOWED_PATHS,
    },
    sitemap: `${normalizedBaseUrl}/sitemap.xml`,
  };
}
