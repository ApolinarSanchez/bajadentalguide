import { expect, test, type Page } from "@playwright/test";

async function submitReviewForClinic(page: Page, clinicIndex: number, text: string) {
  await page.goto("/clinics");

  const clinicRow = page.getByTestId("clinic-item").nth(clinicIndex);
  await clinicRow.getByRole("link").first().click();

  await page.getByRole("combobox", { name: "Rating" }).selectOption("5");
  await page.getByLabel("Review").fill(text);
  await page.getByRole("button", { name: "Submit review" }).click();
}

test("review submit is blocked after rate limit is reached", async ({ page }) => {
  const clinics = page.getByTestId("clinic-item");
  await page.goto("/clinics");
  const clinicCount = await clinics.count();
  expect(clinicCount).toBeGreaterThan(2);

  await submitReviewForClinic(
    page,
    0,
    `Rate limit review first ${Date.now()} with enough details to satisfy minimum length.`,
  );
  await expect(page.getByText("Submitted for moderation")).toBeVisible();

  await submitReviewForClinic(
    page,
    1,
    `Rate limit review second ${Date.now()} with enough details to satisfy minimum length.`,
  );
  await expect(page.getByText("Submitted for moderation")).toBeVisible();

  await submitReviewForClinic(
    page,
    2,
    `Rate limit review third ${Date.now()} with enough details to satisfy minimum length.`,
  );
  await expect(
    page.getByText("Too many review submissions. Please try again later."),
  ).toBeVisible();
});
