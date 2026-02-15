import type { Prisma } from "@prisma/client";

export function buildFeaturedUpdateData(args: {
  isFeatured: boolean;
  featuredRankRaw: FormDataEntryValue | null;
}): Prisma.ClinicUpdateInput {
  if (!args.isFeatured) {
    return {
      isFeatured: false,
      featuredRank: null,
    };
  }

  if (args.featuredRankRaw === null) {
    return {
      isFeatured: true,
    };
  }

  const normalizedRank = String(args.featuredRankRaw).trim();
  if (normalizedRank.length === 0) {
    return {
      isFeatured: true,
      featuredRank: null,
    };
  }

  const parsedRank = Number.parseInt(normalizedRank, 10);
  const isNonNegativeInteger = Number.isFinite(parsedRank) && parsedRank >= 0 && /^\d+$/.test(normalizedRank);

  if (!isNonNegativeInteger) {
    throw new Error("featuredRank must be a non-negative integer");
  }

  return {
    isFeatured: true,
    featuredRank: parsedRank,
  };
}
