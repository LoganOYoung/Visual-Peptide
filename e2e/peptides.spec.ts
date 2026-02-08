import { test, expect } from "@playwright/test";

test.describe("Peptide Library", () => {
  test("library page lists peptides", async ({ page }) => {
    await page.goto("/peptides");
    await expect(page.getByRole("heading", { name: /library|peptide/i })).toBeVisible();
    await expect(page.getByText(/BPC-157|semaglutide|tirzepatide/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("peptide detail page loads", async ({ page }) => {
    await page.goto("/peptides/bpc-157");
    await expect(page.getByRole("heading", { name: /BPC-157|bpc/i })).toBeVisible();
    await expect(page.getByText(/dose|mcg|recon|frequency/i).first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Compare Peptides", () => {
  test("compare page loads with selectors", async ({ page }) => {
    await page.goto("/peptides/compare");
    await expect(page.getByRole("heading", { name: /compare/i })).toBeVisible();
    await expect(page.getByLabel("Select peptide 1", { exact: false }).or(page.getByRole("combobox").first())).toBeVisible({ timeout: 10000 });
  });

  test("selecting two peptides shows comparison table", async ({ page }) => {
    await page.goto("/peptides/compare");
    const select1 = page.getByLabel("Select peptide 1", { exact: false }).or(page.locator('select').first());
    await select1.selectOption({ value: "bpc-157" });
    const select2 = page.getByLabel("Select peptide 2", { exact: false }).or(page.locator('select').nth(1));
    await select2.selectOption({ value: "tb-500" });
    await expect(page.getByRole("table", { name: "Peptide comparison" })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("BPC-157", { exact: false })).toBeVisible();
    await expect(page.getByText("TB-500", { exact: false })).toBeVisible();
  });
});
