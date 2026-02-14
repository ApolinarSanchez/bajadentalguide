import { expect, test } from "@playwright/test";

test("featured clinics section renders curated clinics", async ({ page }) => {
  await page.goto("/clinics");

  await expect(page.getByText("Featured clinics")).toBeVisible();
  await expect(page.getByRole("link", { name: "BDG E2E Implants Clinic" })).toBeVisible();
});
