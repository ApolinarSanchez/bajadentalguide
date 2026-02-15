import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

const db = new PrismaClient();

test.afterAll(async () => {
  await db.$disconnect();
});

test("admin curation can publish a selected unverified clinic", async ({ page }) => {
  const suffix = Date.now();
  const searchKey = String(suffix);

  const unpublishedClinic = {
    name: `E2E Curation Unpublished ${suffix}`,
    slug: `e2e-curation-unpublished-${suffix}`,
  };
  const publishedClinic = {
    name: `E2E Curation Published ${suffix}`,
    slug: `e2e-curation-published-${suffix}`,
  };

  await db.clinic.deleteMany({
    where: {
      slug: {
        in: [unpublishedClinic.slug, publishedClinic.slug],
      },
    },
  });

  await db.clinic.create({
    data: {
      name: unpublishedClinic.name,
      slug: unpublishedClinic.slug,
      city: "Tijuana",
      state: "BC",
      country: "MX",
      isPublished: false,
      isFeatured: false,
    },
  });

  await db.clinic.create({
    data: {
      name: publishedClinic.name,
      slug: publishedClinic.slug,
      city: "Tijuana",
      state: "BC",
      country: "MX",
      isPublished: true,
      isFeatured: false,
      phone: "+52-664-000-0000",
    },
  });

  try {
    await page.goto(`/admin/curation?q=${encodeURIComponent(searchKey)}`);

    const unpublishedRow = page.locator("tr", {
      has: page.getByRole("link", { name: unpublishedClinic.name }),
    });

    await expect(unpublishedRow.getByText("Unverified")).toBeVisible();
    await unpublishedRow.getByRole("checkbox", { name: `Select ${unpublishedClinic.name}` }).check();

    await page.getByRole("button", { name: "Publish selected", exact: true }).click();

    await expect(
      page.locator("tr", {
        has: page.getByRole("link", { name: unpublishedClinic.name }),
      }).getByText(/^Published$/),
    ).toBeVisible();
  } finally {
    await db.clinic.deleteMany({
      where: {
        slug: {
          in: [unpublishedClinic.slug, publishedClinic.slug],
        },
      },
    });
  }
});
