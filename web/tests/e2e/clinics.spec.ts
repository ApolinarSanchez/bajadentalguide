import { expect, test } from "@playwright/test";

test("clinics page loads", async ({ page }) => {
  await page.goto("/clinics");

  await expect(page.getByRole("heading", { name: "Clinics" })).toBeVisible();
  await expect(page.getByText("Placeholder list of clinics.")).toBeVisible();
});
