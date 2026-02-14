import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

const db = new PrismaClient();

test.afterAll(async () => {
  await db.$disconnect();
});

test("unverified clinics are hidden by default and visible with filter toggle", async ({ page }) => {
  const suffix = Date.now();
  const clinicName = `E2E Unverified Clinic ${suffix}`;
  const clinicSlug = `e2e-unverified-clinic-${suffix}`;

  await db.clinic.deleteMany({
    where: {
      slug: clinicSlug,
    },
  });

  await db.clinic.create({
    data: {
      name: clinicName,
      slug: clinicSlug,
      city: "Tijuana",
      state: "BC",
      country: "MX",
      isPublished: false,
    },
  });

  try {
    await page.goto("/clinics");

    await expect(page.getByRole("link", { name: clinicName })).toHaveCount(0);

    await page.getByLabel("Include unverified listings").check();
    await page.getByRole("button", { name: "Apply filters" }).click();

    await expect(page.getByRole("link", { name: clinicName })).toBeVisible();
  } finally {
    await db.clinic.deleteMany({
      where: {
        slug: clinicSlug,
      },
    });
  }
});
