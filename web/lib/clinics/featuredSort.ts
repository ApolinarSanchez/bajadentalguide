export type FeaturedSortable = {
  featuredRank: number | null;
  name: string;
};

export function sortFeaturedClinics<T extends FeaturedSortable>(clinics: T[]): T[] {
  return [...clinics].sort((a, b) => {
    const rankA = a.featuredRank ?? Number.MAX_SAFE_INTEGER;
    const rankB = b.featuredRank ?? Number.MAX_SAFE_INTEGER;

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    return a.name.localeCompare(b.name);
  });
}
