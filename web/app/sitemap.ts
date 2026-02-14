import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { buildSitemap } from "@/lib/seo/buildSitemap";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.BASE_URL ??
    "http://localhost:3000";

  const [clinics, procedures, neighborhoods] = await Promise.all([
    db.clinic.findMany({
      where: {
        isPublished: true,
      },
      select: {
        slug: true,
      },
    }),
    db.procedure.findMany({
      select: {
        slug: true,
      },
    }),
    db.neighborhood.findMany({
      select: {
        slug: true,
      },
    }),
  ]);

  return buildSitemap({
    baseUrl,
    clinicSlugs: clinics.map((clinic) => clinic.slug),
    procedureSlugs: procedures.map((procedure) => procedure.slug),
    neighborhoodSlugs: neighborhoods.map((neighborhood) => neighborhood.slug),
  });
}
