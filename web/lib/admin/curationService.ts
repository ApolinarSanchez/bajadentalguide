import type { Prisma, PrismaClient } from "@prisma/client";

export type CurationBulkAction =
  | "publish"
  | "unpublish"
  | "feature"
  | "unfeature"
  | "assign_featured_ranks";

export type CurationAssignMode = "append" | "start_at";

export type BulkUpdateClinicsInput = {
  clinicIds: string[];
  action: CurationBulkAction;
  mode?: CurationAssignMode;
  startingRank?: number;
};

export type BulkUpdateClinicsResult = {
  updated: number;
  message: string;
};

type CurationTxClient = Pick<Prisma.TransactionClient, "clinic">;

type CurationPrismaClient = Pick<PrismaClient, "$transaction">;

function uniqueClinicIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const deduped: string[] = [];

  ids.forEach((id) => {
    const trimmed = id.trim();
    if (!trimmed || seen.has(trimmed)) {
      return;
    }

    seen.add(trimmed);
    deduped.push(trimmed);
  });

  return deduped;
}

async function assignFeaturedRanks(
  tx: CurationTxClient,
  clinicIds: string[],
  mode: CurationAssignMode,
  startingRank?: number,
) {
  let currentRank: number;

  if (mode === "append") {
    const aggregate = await tx.clinic.aggregate({
      where: {
        isFeatured: true,
        featuredRank: {
          not: null,
        },
      },
      _max: {
        featuredRank: true,
      },
    });

    currentRank = (aggregate._max.featuredRank ?? 0) + 1;
  } else {
    if (
      startingRank === undefined ||
      !Number.isInteger(startingRank) ||
      !Number.isFinite(startingRank) ||
      startingRank < 0
    ) {
      throw new Error("startingRank must be a non-negative integer for start_at mode.");
    }

    currentRank = startingRank;
  }

  let updated = 0;

  for (const clinicId of clinicIds) {
    const result = await tx.clinic.updateMany({
      where: {
        id: clinicId,
      },
      data: {
        isFeatured: true,
        isPublished: true,
        featuredRank: currentRank,
      },
    });

    updated += result.count;
    currentRank += 1;
  }

  return updated;
}

export async function bulkUpdateClinics(
  prisma: CurationPrismaClient,
  input: BulkUpdateClinicsInput,
): Promise<BulkUpdateClinicsResult> {
  const clinicIds = uniqueClinicIds(input.clinicIds);

  if (clinicIds.length === 0) {
    return {
      updated: 0,
      message: "No clinics selected.",
    };
  }

  return prisma.$transaction(async (tx) => {
    if (input.action === "publish") {
      const result = await tx.clinic.updateMany({
        where: {
          id: {
            in: clinicIds,
          },
        },
        data: {
          isPublished: true,
        },
      });

      return {
        updated: result.count,
        message: `Published ${result.count} clinics.`,
      };
    }

    if (input.action === "unpublish") {
      const result = await tx.clinic.updateMany({
        where: {
          id: {
            in: clinicIds,
          },
        },
        data: {
          isPublished: false,
          isFeatured: false,
          featuredRank: null,
        },
      });

      return {
        updated: result.count,
        message: `Unpublished ${result.count} clinics.`,
      };
    }

    if (input.action === "feature") {
      const result = await tx.clinic.updateMany({
        where: {
          id: {
            in: clinicIds,
          },
        },
        data: {
          isPublished: true,
          isFeatured: true,
        },
      });

      return {
        updated: result.count,
        message: `Featured ${result.count} clinics.`,
      };
    }

    if (input.action === "unfeature") {
      const result = await tx.clinic.updateMany({
        where: {
          id: {
            in: clinicIds,
          },
        },
        data: {
          isFeatured: false,
          featuredRank: null,
        },
      });

      return {
        updated: result.count,
        message: `Unfeatured ${result.count} clinics.`,
      };
    }

    const mode = input.mode ?? "append";
    const updated = await assignFeaturedRanks(tx, clinicIds, mode, input.startingRank);

    return {
      updated,
      message: `Assigned featured ranks for ${updated} clinics.`,
    };
  });
}
