import { expect, test } from "@playwright/test";

test("shortlist email capture appears in admin sessions", async ({ page }) => {
  const email = `followup-e2e-${Date.now()}@example.com`;

  await page.goto("/shortlist");

  await page.getByLabel("Email").fill(email);
  const checkbox = page.getByRole("checkbox", { name: "Email me reminders" });
  await expect(checkbox).toBeChecked();
  await page.getByRole("button", { name: "Save reminders" }).click();
  await expect(page.getByText("Email preferences saved.")).toBeVisible();

  await page.goto("/admin/sessions");
  await expect(page.getByRole("cell", { name: email })).toBeVisible();
  await expect(page.getByText("true")).toBeVisible();
});
