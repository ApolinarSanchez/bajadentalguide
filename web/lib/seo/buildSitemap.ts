import type { MetadataRoute } from "next";

export const STATIC_SITEMAP_PATHS = [
  "/",
  "/clinics",
  "/procedures",
  "/neighborhoods",
];

export function buildSitemap({
  baseUrl,
  clinicSlugs,
  procedureSlugs,
  neighborhoodSlugs,
}: {
  baseUrl: string;
  clinicSlugs: string[];
  procedureSlugs: string[];
  neighborhoodSlugs: string[];
}): MetadataRoute.Sitemap {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  const dynamicPaths = [
    ...clinicSlugs.map((slug) => `/clinics/${slug}`),
    ...procedureSlugs.map((slug) => `/procedures/${slug}`),
    ...neighborhoodSlugs.map((slug) => `/neighborhoods/${slug}`),
  ];

  const allUrls = [...STATIC_SITEMAP_PATHS, ...dynamicPaths].map(
    (path) => `${normalizedBaseUrl}${path}`,
  );

  return [...new Set(allUrls)].map((url) => ({
    url,
  }));
}
