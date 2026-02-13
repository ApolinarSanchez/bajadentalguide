import { expect, test } from "@playwright/test";

test("admin analytics page renders key sections", async ({ page }) => {
  await page.goto("/admin/analytics");

  await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Top clinics by outbound clicks" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pending reviews" })).toBeVisible();
});
