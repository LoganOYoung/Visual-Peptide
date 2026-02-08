import { test, expect } from "@playwright/test";

test.describe("Purity & Verify page", () => {
  test("page loads with Janoshik and verification content", async ({ page }) => {
    await page.goto("/verify");
    await expect(page.getByRole("heading", { name: /purity|verification/i })).toBeVisible();
    await expect(page.getByText(/Janoshik|task ID|verify/i).first()).toBeVisible();
  });

  test("Report Verifier: entering task ID shows verification link", async ({ page }) => {
    await page.goto("/verify");
    const input = page.getByLabel("Janoshik task ID", { exact: false }).or(page.getByPlaceholder("Task ID"));
    await input.fill("12345");
    await expect(page.getByRole("link", { name: /open verification|verification page/i })).toBeVisible();
    const href = await page.getByRole("link", { name: /open verification|verification page/i }).getAttribute("href");
    expect(href).toContain("janoshik.com");
    expect(href).toContain("12345");
  });

  test("Example verified batches (PurityPulse) is visible", async ({ page }) => {
    await page.goto("/verify");
    await expect(page.getByText("Example verified batches", { exact: false })).toBeVisible();
    await expect(page.getByText("public.janoshik.com", { exact: false })).toBeVisible();
  });
});
