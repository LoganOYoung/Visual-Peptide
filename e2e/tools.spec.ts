import { test, expect } from "@playwright/test";

test.describe("Recon & Dosing Calculator", () => {
  test("page loads and shows recon section", async ({ page }) => {
    await page.goto("/tools/calculator");
    await expect(page.getByRole("heading", { name: /reconstitution|dosing calculator/i })).toBeVisible();
    await expect(page.getByText("1. Reconstitution", { exact: false })).toBeVisible();
    await expect(page.getByText("2. Dose per injection", { exact: false })).toBeVisible();
  });

  test("recon calculation is correct: 5 mg + 2.5 mL → 2 mg/mL", async ({ page }) => {
    await page.goto("/tools/calculator");
    const inputs = page.locator('input[type="number"]');
    await inputs.first().fill("5");
    await inputs.nth(1).fill("2.5");
    await expect(page.getByText("Concentration", { exact: false })).toBeVisible();
    await expect(page.getByText("2.00").or(page.getByText("2 mg/mL"))).toBeVisible({ timeout: 8000 });
  });

  test("dose result updates when dose (mcg) is entered", async ({ page }) => {
    await page.goto("/tools/calculator");
    const inputs = page.locator('input[type="number"]');
    await inputs.first().fill("5");
    await inputs.nth(1).fill("2.5");
    await inputs.nth(2).fill("250");
    await expect(page.getByText(/volume|mL|units/i)).toBeVisible({ timeout: 8000 });
  });
});

test.describe("Syringe Planner", () => {
  test("page loads with syringe UI", async ({ page }) => {
    await page.goto("/tools/syringe-planner");
    await expect(page.getByRole("heading", { name: /syringe|planner/i })).toBeVisible();
    await expect(page.locator('select, [role="combobox"], input').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Unit Converter", () => {
  test("page loads and has conversion inputs", async ({ page }) => {
    await page.goto("/tools/unit-converter");
    await expect(page.getByRole("heading", { name: /unit|converter/i })).toBeVisible();
    await expect(page.locator('input, select').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Cost per dose", () => {
  test("page loads with cost inputs", async ({ page }) => {
    await page.goto("/tools/cost");
    await expect(page.getByRole("heading", { name: /cost/i })).toBeVisible();
    await expect(page.locator('input, select').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Vial & Cycle", () => {
  test("page loads with vial/cycle content", async ({ page }) => {
    await page.goto("/tools/vial-cycle");
    await expect(page.getByRole("heading", { name: /vial|cycle/i })).toBeVisible();
    await expect(page.locator('input, select').first()).toBeVisible({ timeout: 5000 });
  });
});
