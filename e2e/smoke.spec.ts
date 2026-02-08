import { test, expect } from "@playwright/test";

const KEY_PAGES = [
  { path: "/", name: "Home" },
  { path: "/tools", name: "Tools" },
  { path: "/peptides", name: "Peptides" },
  { path: "/structure", name: "3D Structure" },
  { path: "/verify", name: "Purity & Verify" },
  { path: "/suppliers", name: "Suppliers" },
  { path: "/guide", name: "Guide" },
  { path: "/faq", name: "FAQ" },
  { path: "/about", name: "About" },
];

test.describe("Smoke: key pages load", () => {
  for (const { path, name } of KEY_PAGES) {
    test(`${name} (${path}) returns 200 and has main content`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("body")).toBeVisible();
      await expect(page.getByRole("main").or(page.locator("main")).or(page.locator('[class*="max-w"]').first())).toBeVisible({ timeout: 5000 });
    });
  }
});

test.describe("Homepage content", () => {
  test("shows platform title and core CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Precision without the math", { exact: false })).toBeVisible();
    await expect(page.getByRole("link", { name: /calculator|recon|dosing/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /peptide|library/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /verify|purity/i })).toBeVisible();
  });
});
