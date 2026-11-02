import { expect, test } from "@playwright/test";

const noSideScroll = async (page: import("@playwright/test").Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

test("phone layouts fit the screen", async ({ page }) => {
  for (const path of ["/", "/plugins/nanami.sign-tracker", "/plugins/oyster.perspective-kit", "/authors/nanami", "/publish", "/categories/karaoke"]) {
    await page.goto(path);
    await noSideScroll(page);
  }
});

test("on a phone, permissions come before the screenshots", async ({ page }) => {
  await page.goto("/plugins/nanami.sign-tracker");
  await expect(page.locator(".phone-perms")).toBeVisible();
  await expect(page.locator(".desk-perms")).toBeHidden();
  const perms = await page.locator(".phone-perms").boundingBox();
  const shots = await page.locator(".carousel").boundingBox();
  expect(perms && shots && perms.y < shots.y).toBe(true);
});

test("the phone search button opens search", async ({ page }) => {
  await page.goto("/publish");
  await page.getByRole("link", { name: "Search plugins" }).click();
  await expect(page.locator("#q")).toBeFocused();
});
