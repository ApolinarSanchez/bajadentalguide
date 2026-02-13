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
  const rowTestId = await pendingReview.first().getAttribute("data-testid");
  const reviewId = rowTestId?.replace("review-row-", "");
  expect(reviewId).toBeTruthy();

  const approveResponsePromise = page.waitForResponse(
    (response) =>
      Boolean(reviewId) &&
      response.url().includes(`/api/admin/reviews/${reviewId}/approve`) &&
      response.request().method() === "POST",
  );
  await pendingReview.getByRole("button", { name: "Approve" }).click();
  const approveResponse = await approveResponsePromise;
  expect(approveResponse.ok()).toBeTruthy();

  await page.goto(`/clinics/${clinicSlug}`);
  await expect(page.getByText(reviewSnippet)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/BDG Rating:/)).toBeVisible();
  await expect(page.getByText(/\(\d+ reviews\)/)).toBeVisible();
});
