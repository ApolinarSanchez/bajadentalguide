import { expect, test } from "@playwright/test";

test("shortlist email capture appears in admin sessions", async ({ page }) => {
  const email = `followup-e2e-${Date.now()}@example.com`;

  await page.goto("/shortlist");

  await page.getByLabel(/^Email$/).fill(email);
  const checkbox = page.getByRole("checkbox", { name: "Email me reminders" });
  if (!(await checkbox.isChecked())) {
    await checkbox.check();
  }
  await page.getByRole("button", { name: "Save reminders" }).click();
  await expect(page.getByText("Email preferences saved.")).toBeVisible();

  await page.goto("/admin/sessions");
  const sessionRow = page.getByRole("row", { name: new RegExp(email) });
  await expect(sessionRow).toBeVisible();
  await expect(sessionRow.getByRole("cell", { name: "true" })).toBeVisible();
});
