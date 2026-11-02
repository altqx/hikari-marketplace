import { expect, test } from "bun:test";
import { load } from "./build.ts";
import * as pages from "./pages.ts";

const site = await load("fixtures/test-index");
const byId = (id: string) => site.index.plugins.find((p) => p.id === id) ?? (() => { throw new Error(id); })();

test("a hostile README is inert on the plugin page", () => {
  const out = pages.plugin(site, byId("nanami.sign-tracker"));
  expect(out).not.toContain("<script>alert");
  expect(out).not.toMatch(/<img[^>]*onerror/);
  expect(out).not.toContain('href="javascript:');
  expect(out).toContain("Revoked: Crashed the plugin helper");
  expect(out).toContain('href="hikarisub://plugin/install?id=nanami.sign-tracker"');
  expect(out).toContain('href="/p/nanami.sign-tracker/0.9.4.hikariplugin"');
});

test("a revoked plugin has no install button and stays out of listings", () => {
  const out = pages.plugin(site, byId("rogue.subtitle-sync"));
  expect(out).toContain("Removed from the marketplace");
  expect(out).not.toContain("hikarisub://plugin/install");
  expect(pages.home(site)).not.toContain("rogue.subtitle-sync");
  expect(pages.searchEntries(site).map((e) => e.id)).not.toContain("rogue.subtitle-sync");
});

test("index strings are escaped", () => {
  const p = structuredClone(byId("haru.line-tools"));
  (p.versions[0] as { name: string }).name = '<img src=x onerror=alert(1)>';
  p.authorName = '"><script>alert(1)</script>';
  const out = pages.plugin(site, p);
  expect(out).not.toContain("<img src=x");
  expect(out).not.toContain("<script>alert");
});
