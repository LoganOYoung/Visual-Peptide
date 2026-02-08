import { test, expect } from "@playwright/test";

const INTERNAL_PATHS = [
  "/",
  "/tools",
  "/tools/calculator",
  "/tools/syringe-planner",
  "/tools/unit-converter",
  "/tools/cost",
  "/tools/vial-cycle",
  "/peptides",
  "/peptides/compare",
  "/peptides/bpc-157",
  "/structure",
  "/structure/demo",
  "/verify",
  "/suppliers",
  "/guide",
  "/faq",
  "/about",
];

test.describe("Internal links: key routes return 200", () => {
  for (const path of INTERNAL_PATHS) {
    test(`${path} is reachable`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
    });
  }
});

test.describe("Footer and nav links", () => {
  test("homepage footer links are valid (same-origin)", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    const links = footer.getByRole("link").filter({ hasNot: page.locator('[href^="http"]') });
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute("href");
      if (href && href.startsWith("/")) {
        const res = await page.goto(href);
        expect(res?.status()).toBe(200);
      }
    }
  });
});
