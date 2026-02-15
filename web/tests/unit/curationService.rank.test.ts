import { describe, expect, it, vi } from "vitest";
import { bulkUpdateClinics } from "@/lib/admin/curationService";

function createPrismaMock() {
  const aggregate = vi.fn();
  const updateMany = vi.fn();
  const tx = {
    clinic: {
      aggregate,
      updateMany,
    },
  };

  const prisma = {
    $transaction: vi.fn(async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx)),
  };

  return {
    prisma,
    aggregate,
    updateMany,
  };
}

describe("bulkUpdateClinics rank assignment", () => {
  it("assigns append mode ranks using max + 1 in request order", async () => {
    const { prisma, aggregate, updateMany } = createPrismaMock();

    aggregate.mockResolvedValue({
      _max: {
        featuredRank: 10,
      },
    });
    updateMany.mockResolvedValue({ count: 1 });

    const result = await bulkUpdateClinics(prisma as never, {
      clinicIds: ["clinic-b", "clinic-a"],
      action: "assign_featured_ranks",
      mode: "append",
    });

    expect(result.updated).toBe(2);
    expect(aggregate).toHaveBeenCalledTimes(1);
    expect(updateMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: "clinic-b" },
        data: expect.objectContaining({ featuredRank: 11 }),
      }),
    );
    expect(updateMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: "clinic-a" },
        data: expect.objectContaining({ featuredRank: 12 }),
      }),
    );
  });

  it("assigns start_at mode ranks from the provided starting rank", async () => {
    const { prisma, aggregate, updateMany } = createPrismaMock();

    updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    const result = await bulkUpdateClinics(prisma as never, {
      clinicIds: ["clinic-1", "clinic-2", "clinic-3"],
      action: "assign_featured_ranks",
      mode: "start_at",
      startingRank: 3,
    });

    expect(result.updated).toBe(2);
    expect(aggregate).not.toHaveBeenCalled();
    expect(updateMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({ featuredRank: 3 }),
      }),
    );
    expect(updateMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({ featuredRank: 4 }),
      }),
    );
    expect(updateMany).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        data: expect.objectContaining({ featuredRank: 5 }),
      }),
    );
  });

  it("throws when start_at mode is missing a valid starting rank", async () => {
    const { prisma } = createPrismaMock();

    await expect(
      bulkUpdateClinics(prisma as never, {
        clinicIds: ["clinic-1"],
        action: "assign_featured_ranks",
        mode: "start_at",
      }),
    ).rejects.toThrow("startingRank must be a non-negative integer for start_at mode.");
  });
});
