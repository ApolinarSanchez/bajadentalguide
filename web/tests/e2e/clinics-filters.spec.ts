import { expect, test } from "@playwright/test";

test("clinics search filters down to one matching clinic", async ({ page }) => {
  await page.goto("/clinics");

  const firstClinicName = (await page.locator('[data-testid="clinic-item"] a[href^="/clinics/"]').first().innerText()).trim();

  await page.getByLabel("Search clinics").fill(firstClinicName);
  await page.getByRole("button", { name: "Apply filters" }).click();

  await expect(page.getByTestId("results-count")).toContainText("Results: 1");
  await expect(page.getByRole("link", { name: firstClinicName })).toBeVisible();
});

test("hasWebsite filter only shows clinics with Website links", async ({ page }) => {
  await page.goto("/clinics");

  await page.getByLabel("Has website").check();
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page.getByTestId("results-count")).toContainText(/Results: [1-9]\d*/);

  const clinicRows = page.getByTestId("clinic-item");
  const rowCount = await clinicRows.count();
  expect(rowCount).toBeGreaterThan(0);

  for (let index = 0; index < rowCount; index += 1) {
    await expect(clinicRows.nth(index).getByRole("link", { name: "Website" })).toBeVisible();
  }
});

test("procedure and neighborhood filters find known e2e clinic", async ({ page }) => {
  await page.goto("/clinics");

  await page.getByLabel("Procedure").selectOption("dental-implants");
  await page.getByLabel("Neighborhood").selectOption("zona-rio");
  await page.getByRole("button", { name: "Apply filters" }).click();

  await expect(page.getByRole("link", { name: "BDG E2E Implants Clinic" })).toBeVisible();
  await expect(page).toHaveURL(/procedure=dental-implants/);
  await expect(page).toHaveURL(/neighborhood=zona-rio/);
});
