import { afterAll, describe, expect, it } from "vitest";
import { ClinicClaimRequestStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { submitClinicClaimRequest } from "@/lib/claims/service";

describe("clinic claim requests", () => {
  it("stores a submitted claim request as PENDING", async () => {
    const suffix = Date.now();
    const clinicSlug = `integration-claim-${suffix}`;

    await db.clinic.deleteMany({
      where: {
        slug: clinicSlug,
      },
    });

    const clinic = await db.clinic.create({
      data: {
        name: `Claim Clinic ${suffix}`,
        slug: clinicSlug,
        city: "Tijuana",
        state: "BC",
        country: "MX",
      },
      select: {
        id: true,
      },
    });

    try {
      const result = await submitClinicClaimRequest({
        clinicSlug,
        sessionId: `integration-claim-session-${suffix}`,
        payload: {
          name: "Integration Owner",
          email: `claim-${suffix}@example.com`,
          role: "Clinic Manager",
          message: "I manage this clinic profile.",
        },
      });

      expect(result.ok).toBe(true);
      if (!result.ok) {
        return;
      }

      const claimRequest = await db.clinicClaimRequest.findUnique({
        where: {
          id: result.data.claimRequestId,
        },
        select: {
          clinicId: true,
          status: true,
          name: true,
          email: true,
        },
      });

      expect(claimRequest).not.toBeNull();
      expect(claimRequest?.clinicId).toBe(clinic.id);
      expect(claimRequest?.status).toBe(ClinicClaimRequestStatus.PENDING);
      expect(claimRequest?.name).toBe("Integration Owner");
      expect(claimRequest?.email).toBe(`claim-${suffix}@example.com`);
    } finally {
      await db.clinicClaimRequest.deleteMany({
        where: {
          clinicId: clinic.id,
        },
      });
      await db.clinic.deleteMany({
        where: {
          id: clinic.id,
        },
      });
    }
  });
});

afterAll(async () => {
  await db.$disconnect();
});
