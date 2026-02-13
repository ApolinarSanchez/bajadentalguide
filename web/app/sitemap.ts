import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { buildSitemap } from "@/lib/seo/buildSitemap";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [clinics, procedures, neighborhoods] = await Promise.all([
    db.clinic.findMany({
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
    baseUrl: process.env.BASE_URL ?? "http://localhost:3000",
    clinicSlugs: clinics.map((clinic) => clinic.slug),
    procedureSlugs: procedures.map((procedure) => procedure.slug),
    neighborhoodSlugs: neighborhoods.map((neighborhood) => neighborhood.slug),
  });
}
