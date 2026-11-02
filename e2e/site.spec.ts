import { expect, test } from "@playwright/test";

test.beforeEach(({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  (page as unknown as { errors: string[] }).errors = errors;
});

test.afterEach(({ page }) => {
  expect((page as unknown as { errors: string[] }).errors).toEqual([]);
});

test("home lists new and updated plugins, not revoked ones", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("HikariSub Marketplace");
  await expect(page.getByRole("heading", { name: "New" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recently updated" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Featured" })).toHaveCount(0);
  await expect(page.getByText("Subtitle Sync Cloud")).toHaveCount(0);
  await expect(page.locator(".chip", { hasText: "Quality checks" }).locator(".n")).toHaveText("3");
});

test("search filters as you type and keeps ?q=", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("/");
  await expect(page.locator("#q")).toBeFocused();
  await page.keyboard.type("karaoke");
  await expect(page.locator("#results-head")).toHaveText("2 plugins for “karaoke”");
  await expect(page.locator("#results-grid .card .name")).toHaveText(["Karaoke Flow", "Romaji Splitter"]);
  await expect(page).toHaveURL(/\?q=karaoke$/);
  await expect(page.locator("#browse")).toBeHidden();
  await page.locator("#q").fill("zzz");
  await expect(page.locator("#results-head")).toHaveText("No plugins match “zzz”");
  await page.locator("#q").fill("");
  await expect(page.locator("#browse")).toBeVisible();

  await page.goto("/?q=sync");
  await expect(page.locator("#results-head")).toHaveText("No plugins match “sync”");
  await page.goto("/?q=nanami");
  await expect(page.locator("#results-grid .card")).toHaveCount(2);
});

test("searching from another page lands on home", async ({ page }) => {
  await page.goto("/publish");
  await page.keyboard.press("/");
  await page.keyboard.type("font");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/\?q=font$/);
  await expect(page.locator("#results-grid .card .name")).toHaveText(["Font Doctor"]);
});

test("categories", async ({ page }) => {
  await page.goto("/");
  await page.locator(".chip", { hasText: "Typesetting" }).click();
  await expect(page).toHaveURL("/categories/typesetting");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Typesetting");
  await expect(page.locator(".card .name")).toHaveText(["Sign Tracker", "Perspective Kit"]);
  await expect(page.locator(".chip.on")).toHaveAttribute("aria-current", "page");
  await page.goto("/categories/translation");
  await expect(page.locator(".card")).toHaveCount(1);
  await page.goto("/plugins");
  await expect(page.locator(".card")).toHaveCount(11);
});

test("a plugin page", async ({ page }) => {
  await page.goto("/plugins/nanami.sign-tracker");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Sign Tracker");
  await expect(page.getByRole("link", { name: "Install in HikariSub" })).toHaveAttribute("href", "hikarisub://plugin/install?id=nanami.sign-tracker");
  await expect(page.getByRole("link", { name: "Download .hikariplugin" })).toHaveAttribute("href", "/p/nanami.sign-tracker/0.9.4.hikariplugin");
  await expect(page.locator(".install .note")).toContainText("Needs HikariSub 0.2.0 or later.");
  await expect(page.locator(".desk-perms")).toContainText("Asks you to pick a folder: “Tracking data folder”, and writes there");
  await expect(page.locator(".ver.revoked")).toHaveCount(1);
  await expect(page.locator(".ver.revoked .why")).toHaveText("Revoked: Crashed the plugin helper on variable-frame-rate video.");
  await expect(page.locator(".keyline .mono")).toHaveText(/^[0-9A-F]{16}$/);
  await expect(page.getByRole("link", { name: "Report a problem" }).first()).toHaveAttribute("href", /hikari-plugins\/issues\/new\?title=Report%3A\+nanami\.sign-tracker\+0\.9\.4/);

  // The README is rendered, and its hostile parts are inert.
  const readme = page.locator(".readme");
  await expect(readme.getByRole("heading", { name: "Use it" })).toBeVisible();
  await expect(readme.locator("table")).toBeVisible();
  await expect(readme.locator("script, img, a[href^='javascript:']")).toHaveCount(0);
  await expect(readme).toContainText('<script>alert("readme")</script>');

  // Screenshots: three, with arrows and thumbnails.
  const carousel = page.locator(".carousel");
  await expect(carousel.locator(".frame img:visible")).toHaveCount(1);
  await expect(carousel.locator(".pos")).toHaveText("1 of 3");
  await carousel.getByRole("button", { name: "Next screenshot" }).click();
  await expect(carousel.locator(".pos")).toHaveText("2 of 3");
  await expect(carousel.locator(".cap")).toHaveText("The preset panel next to the video.");
  await carousel.locator(".thumbs a").nth(2).click();
  await expect(carousel.locator(".pos")).toHaveText("3 of 3");
  await carousel.getByRole("button", { name: "Previous screenshot" }).click();
  await expect(carousel.locator(".pos")).toHaveText("2 of 3");
  const shot = await page.request.get("/p/nanami.sign-tracker/0.9.4/screenshot-1.png");
  expect(shot.headers()["content-security-policy"]).toContain("sandbox");
});

test("unrestricted, network and plain plugins", async ({ page }) => {
  await page.goto("/plugins/oyster.perspective-kit");
  await expect(page.locator("h1 .badge")).toHaveText("Unrestricted");
  await expect(page.locator(".desk-perms .perm.danger")).toContainText("Full access to your computer");
  await expect(page.locator(".desk-perms .always")).toHaveCount(0);
  await page.goto("/plugins/lumen.draft-translate");
  await expect(page.locator(".desk-perms")).toContainText("Connects to libretranslate.com");
  await page.goto("/plugins/haru.line-tools");
  await expect(page.locator(".desk-perms")).toContainText("Nothing beyond the basics");
  await expect(page.locator(".carousel")).toHaveCount(0);
});

test("a revoked plugin", async ({ page }) => {
  await page.goto("/plugins/rogue.subtitle-sync");
  await expect(page.locator("h1 .badge")).toHaveText("Revoked");
  await expect(page.locator(".revoked-box")).toContainText("Uploaded subtitle files to a host its manifest doesn’t declare.");
  await expect(page.getByRole("link", { name: "Install in HikariSub" })).toHaveCount(0);
});

test("an author page", async ({ page }) => {
  await page.goto("/plugins/mirai.karaoke-flow");
  await page.getByRole("link", { name: "Mirai Kobayashi" }).click();
  await expect(page).toHaveURL("/authors/mirai");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Mirai Kobayashi");
  await expect(page.getByRole("heading", { name: "2 plugins" })).toBeVisible();
  await expect(page.locator(".ahead .meta")).toContainText("Listing since 28 November 2026");
});

test("publish page and 404", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Publish a plugin" }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Publish a plugin");
  await expect(page.locator(".steps > li")).toHaveCount(5);
  const res = await page.goto("/plugins/nope.nothing");
  expect(res?.status()).toBe(404);
  (page as unknown as { errors: string[] }).errors.length = 0; // the 404 itself
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Not found");
});

test("theme toggle is remembered", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.getByRole("button", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByRole("button", { name: "Dark" })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/publish");
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("security headers", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["content-security-policy"]).toContain("script-src 'self'");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
});
