import { test, expect } from "@playwright/test";

test.describe("3D Structure page", () => {
  test("page loads and shows viewer or load controls", async ({ page }) => {
    await page.goto("/structure");
    await expect(page.getByRole("heading", { name: /3D|structure/i })).toBeVisible();
    await expect(
      page.getByText(/PDB|structure|viewer|load|semaglutide|GLP/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("has way to load or select a structure", async ({ page }) => {
    await page.goto("/structure");
    await expect(
      page.getByRole("button", { name: /load|open|select/i }).or(
        page.getByRole("link", { name: /6XBM|semaglutide|PDB/i })
      ).or(page.locator('select, [role="combobox"]'))
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe("3D Reaction demo", () => {
  test("demo page loads without crashing", async ({ page }) => {
    const res = await page.goto("/structure/demo");
    expect(res?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
    await expect(
      page.getByText(/demo|reaction|trajectory|binding/i).first()
    ).toBeVisible({ timeout: 15000 });
  });
});
