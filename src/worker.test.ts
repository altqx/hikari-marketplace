import { expect, test } from "bun:test";
import worker, { contentType, type Env } from "./worker.ts";

const assets = { fetch: async (r: Request) => new Response(`asset ${new URL(r.url).pathname}`, { status: 200 }) };
const bucket = (files: Record<string, string>) => ({
  get: async (key: string) => (key in files ? { body: new Response(files[key]).body as ReadableStream, httpEtag: '"e"', size: (files[key] as string).length } : null),
});
const get = (path: string, env: Env, method = "GET") => worker.fetch(new Request(`https://x.test${path}`, { method }), env);

test("pages come from the assets", async () => {
  expect(await (await get("/plugins/a.b", { ASSETS: assets, PACKAGES: bucket({}) })).text()).toBe("asset /plugins/a.b");
});

test("published files come from the bucket, sandboxed and cached", async () => {
  const env = { ASSETS: assets, PACKAGES: bucket({ "p/a.b/1.0.0/icon.svg": "<svg/>", "index.json": "{}", "p/a.b/1.0.0.hikariplugin": "zip" }) };
  const icon = await get("/p/a.b/1.0.0/icon.svg", env);
  expect(await icon.text()).toBe("<svg/>");
  expect(icon.headers.get("content-type")).toBe("image/svg+xml");
  expect(icon.headers.get("content-security-policy")).toContain("sandbox");
  expect(icon.headers.get("cache-control")).toContain("immutable");
  expect((await get("/index.json", env)).headers.get("cache-control")).toBe("public, max-age=60");
  expect((await get("/p/a.b/1.0.0.hikariplugin", env)).headers.get("content-disposition")).toBe('attachment; filename="a.b-1.0.0.hikariplugin"');
  expect(await (await get("/p/missing", env)).text()).toBe("asset /p/missing");
  expect((await get("/index.json", env, "POST")).status).toBe(405);
});

test("without a bucket, media still gets the sandbox headers", async () => {
  const res = await get("/p/a.b/1.0.0/icon.svg", { ASSETS: assets });
  expect(await res.text()).toBe("asset /p/a.b/1.0.0/icon.svg");
  expect(res.headers.get("content-security-policy")).toContain("sandbox");
});

test("content types", () => {
  expect(contentType("p/a/1/screenshot-1.JPG")).toBe("image/jpeg");
  expect(contentType("p/a/1/x.bin")).toBe("application/octet-stream");
});
