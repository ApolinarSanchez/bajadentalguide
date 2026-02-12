import { expect, type Page, test } from "@playwright/test";

async function saveFirstClinicFromList(page: Page): Promise<string> {
  await page.goto("/clinics");

  const firstClinic = page.getByTestId("clinic-item").first();
  const clinicName = (await firstClinic
    .locator('a[href^="/clinics/"]')
    .first()
    .innerText())
    .trim();

  await firstClinic.getByRole("button", { name: "Save" }).click();
  await expect(firstClinic.getByRole("button", { name: "Saved" })).toBeVisible();

  return clinicName;
}

test("saving from clinics list adds clinic to shortlist", async ({ page }) => {
  const clinicName = await saveFirstClinicFromList(page);

  await page.goto("/shortlist");
  await expect(page.getByRole("link", { name: clinicName })).toBeVisible();
});

test("saved shortlist entries persist across refresh", async ({ page }) => {
  const clinicName = await saveFirstClinicFromList(page);

  await page.goto("/shortlist");
  await expect(page.getByRole("link", { name: clinicName })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("link", { name: clinicName })).toBeVisible();
});

test("removing a saved clinic clears shortlist", async ({ page }) => {
  const clinicName = await saveFirstClinicFromList(page);

  await page.goto("/shortlist");
  await expect(page.getByRole("link", { name: clinicName })).toBeVisible();

  const shortlistRow = page.locator("li").filter({
    has: page.getByRole("link", { name: clinicName }),
  });

  await shortlistRow.getByRole("button", { name: "Remove" }).click();

  await expect(page.getByText("No saved clinics yet")).toBeVisible();
  await expect(page.getByRole("link", { name: clinicName })).toHaveCount(0);
});
