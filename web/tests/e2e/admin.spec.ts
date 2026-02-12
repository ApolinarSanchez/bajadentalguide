import path from "node:path";
import { expect, test } from "@playwright/test";

test("/admin without credentials is unauthorized", async ({ playwright }) => {
  const requestContext = await playwright.request.newContext({
    baseURL: "http://127.0.0.1:3000",
    httpCredentials: {
      username: "invalid-user",
      password: "invalid-pass",
    },
  });

  const response = await requestContext.get("/admin");

  expect(response.status()).not.toBe(200);

  await requestContext.dispose();
});

test("/admin with credentials shows clinic table", async ({ page }) => {
  await page.goto("/admin");

  await expect(page.getByRole("heading", { name: "Admin Clinics" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Import clinics CSV" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Name" })).toBeVisible();
});

test("admin import uploads CSV and clinic appears on /clinics", async ({ page }) => {
  const fixturePath = path.join(process.cwd(), "tests/fixtures/clinics-import.csv");

  await page.goto("/admin/import");

  await page.setInputFiles('input[name="clinic-csv-input"]', fixturePath);
  await expect(page.getByText("Preview (1 rows)")).toBeVisible();
  await expect(page.getByText("Admin Import Demo Clinic")).toBeVisible();

  const importResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/admin/import-clinics") &&
      response.request().method() === "POST",
  );

  await page.getByRole("button", { name: "Import clinics" }).click();
  const importResponse = await importResponsePromise;
  expect(importResponse.status()).toBe(200);
  await expect(page.getByText("Import complete.")).toBeVisible({ timeout: 15000 });

  await page.goto("/clinics");
  await expect(page.getByRole("link", { name: "Admin Import Demo Clinic" })).toBeVisible();
});
