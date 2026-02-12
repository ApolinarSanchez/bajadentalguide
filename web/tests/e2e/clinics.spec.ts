import { expect, test } from "@playwright/test";

test("clinics page loads", async ({ page }) => {
  await page.goto("/clinics");

  await expect(page.getByRole("heading", { name: "Clinics" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Baja Smile Dental Center" })).toBeVisible();
});

test("clinic details page loads after clicking a clinic", async ({ page }) => {
  await page.goto("/clinics");

  await page.getByRole("link", { name: "Baja Smile Dental Center" }).click();
  await page.waitForURL("**/clinics/baja-smile-dental-center");

  await expect(
    page.getByRole("heading", { name: "Baja Smile Dental Center" }),
  ).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("Slug: baja-smile-dental-center")).toBeVisible();
});
