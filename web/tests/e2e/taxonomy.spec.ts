import { expect, test } from "@playwright/test";

test("procedures pages load and show clinics", async ({ page }) => {
  await page.goto("/procedures");

  await expect(page.getByRole("heading", { name: "Procedures" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Dental Implants" })).toBeVisible();

  await page.getByRole("link", { name: "Dental Implants" }).click();
  await page.waitForURL("**/procedures/dental-implants");

  await expect(page.getByRole("heading", { name: "Dental Implants" })).toBeVisible();
  await expect(page.locator('a[href^="/clinics/"]').first()).toBeVisible();
});

test("neighborhood pages load and show clinics", async ({ page }) => {
  await page.goto("/neighborhoods");

  await expect(page.getByRole("heading", { name: "Neighborhoods" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Zona Río" })).toBeVisible();

  await page.getByRole("link", { name: "Zona Río" }).click();
  await page.waitForURL("**/neighborhoods/zona-rio");

  await expect(page.getByRole("heading", { name: "Zona Río" })).toBeVisible();
  await expect(page.locator('a[href^="/clinics/"]').first()).toBeVisible();
});
