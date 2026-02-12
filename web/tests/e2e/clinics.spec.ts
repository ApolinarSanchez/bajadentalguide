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

test("clinic website link redirects through /out route", async ({ page }) => {
  await page.goto("/clinics/baja-smile-dental-center");

  const outResponsePromise = page.waitForResponse((response) =>
    response.url().includes("/out/baja-smile-dental-center?dest=website"),
  );

  await page.getByRole("link", { name: "Website" }).click();

  const outResponse = await outResponsePromise;
  expect(outResponse.status()).toBe(302);
  expect(outResponse.headers().location).toContain("/__e2e__/target");

  await page.goto("/out/baja-smile-dental-center?dest=website");
  await expect(page.getByRole("heading", { name: "Outbound Target" })).toBeVisible();
});
