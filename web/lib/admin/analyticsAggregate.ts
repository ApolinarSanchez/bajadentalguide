export type OutboundDest = "website" | "whatsapp" | "google" | "yelp";

export type OutboundDestCounts = Record<OutboundDest, number>;

const VALID_DESTS: OutboundDest[] = ["website", "whatsapp", "google", "yelp"];

export function aggregateOutboundByDest(metadatas: Array<unknown>): OutboundDestCounts {
  const counts: OutboundDestCounts = {
    website: 0,
    whatsapp: 0,
    google: 0,
    yelp: 0,
  };

  for (const metadata of metadatas) {
    if (!metadata || typeof metadata !== "object") {
      continue;
    }

    const dest = (metadata as { dest?: unknown }).dest;
    if (typeof dest !== "string") {
      continue;
    }

    if ((VALID_DESTS as string[]).includes(dest)) {
      counts[dest as OutboundDest] += 1;
    }
  }

  return counts;
}

export function topNByCount<T extends { id: string; count: number }>(
  rows: T[],
  limit: number,
): T[] {
  return [...rows]
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))
    .slice(0, limit);
}
