import { expect, test } from "@playwright/test";

test("footer privacy link opens Privacy Policy page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Privacy" }).click();
  await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
});

test("footer terms link opens Terms of Use page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Terms" }).click();
  await expect(page.getByRole("heading", { name: "Terms of Use" })).toBeVisible();
});

test("review policy and methodology pages have required headings", async ({ page }) => {
  await page.goto("/review-policy");
  await expect(page.getByRole("heading", { name: "Review Policy" })).toBeVisible();

  await page.goto("/methodology");
  await expect(page.getByRole("heading", { name: "Rating Methodology" })).toBeVisible();
});

test("about and contact pages have required headings", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: "About BajaDentalGuide" })).toBeVisible();

  await page.goto("/contact");
  await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();
});
