import { expect, test } from "@playwright/test";

test("review submit and moderation flow", async ({ page }) => {
  const reviewSnippet = `Playwright BDG review ${Date.now()}`;
  await page.goto("/clinics");

  const firstClinic = page.getByTestId("clinic-item").first();
  const clinicLink = firstClinic.getByRole("link").first();
  const href = (await clinicLink.getAttribute("href")) ?? "";
  const clinicSlug = href.startsWith("/clinics/") ? href.slice("/clinics/".length) : href;

  await clinicLink.click();

  await page.getByRole("combobox", { name: "Rating" }).selectOption("5");
  await page.getByLabel("Procedure (optional)").fill("implants");
  await page.getByLabel("Visit month (optional)").selectOption("6");
  await page.getByLabel("Visit year (optional)").selectOption("2026");
  await page.getByLabel("Headline (optional)").fill("Great care");
  await page
    .getByLabel("Review")
    .fill(`${reviewSnippet} with plenty of useful details to satisfy minimum length rules.`);

  await page.getByRole("button", { name: "Submit review" }).click();
  await expect(page.getByText("Submitted for moderation")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Your review is pending.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit review" })).toBeDisabled();

  await page.goto("/admin/reviews");
  const pendingReview = page.locator("li").filter({ hasText: reviewSnippet });
  await expect(pendingReview).toBeVisible();
  await pendingReview.getByRole("button", { name: "Approve" }).click();

  await page.goto(`/clinics/${clinicSlug}`);
  await expect(page.getByText(reviewSnippet)).toBeVisible();
  await expect(page.getByText(/BDG Rating: 5.0/)).toBeVisible();
  await expect(page.getByText("(1 reviews)")).toBeVisible();
});
