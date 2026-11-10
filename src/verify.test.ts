import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { readPublicKey, verifyLive, verifySignature } from "./verify.ts";

const fixture = (name: string) => readFileSync(`fixtures/verify/${name}`);
const testKey = readPublicKey(fixture("test.pub").toString());
const index = fixture("index.json");
const signature = fixture("index.json.minisig").toString();

test("the pinned key is the marketplace key", () => {
  expect(readPublicKey(readFileSync("keys/marketplace.pub", "utf8")).id).toBe("EF622DD4D472E463");
});

test("prehashed and legacy signatures verify", () => {
  expect(verifySignature(index, signature, testKey)).toBe("file:index.json serial:4 generated:2026-11-04T02:55:43Z");
  expect(verifySignature(index, fixture("index.json.legacy.minisig").toString(), testKey)).toBe("legacy");
});

test("a changed index, another key or an edited trusted comment is refused", () => {
  const changed = Buffer.from(index);
  changed.writeUInt8(changed.readUInt8(2) ^ 1, 2);
  expect(() => verifySignature(changed, signature, testKey)).toThrow("the signature doesn't match the index");
  expect(() => verifySignature(index, signature, readPublicKey(readFileSync("keys/marketplace.pub", "utf8"))))
    .toThrow(`signed by key ${testKey.id}, not EF622DD4D472E463`);
  expect(() => verifySignature(index, signature.replace("serial:4", "serial:5"), testKey))
    .toThrow("the trusted comment's signature doesn't match");
});

const LIVE_HEADERS = { "content-security-policy": "default-src 'self'; script-src 'self'" };
const site = (files: Record<string, Response>) => async (url: string) =>
  files[new URL(url).pathname]?.clone() ?? new Response("not found", { status: 404 });
const live = (overrides: Record<string, Response> = {}) => site({
  "/index.json": new Response(index, { headers: { "content-type": "application/json" } }),
  "/index.json.minisig": new Response(signature),
  "/": new Response("<!doctype html>", { headers: LIVE_HEADERS }),
  ...overrides,
});
const BASE = "https://marketplace.test";

test("a right live site has no problems", async () => {
  expect(await verifyLive(BASE, testKey, index, live())).toEqual([]);
});

test("the live checks catch each wrong thing", async () => {
  expect(await verifyLive(BASE, testKey, undefined, live({ "/": new Response("", { headers: { ...LIVE_HEADERS, "x-robots-tag": "noindex" } }) })))
    .toEqual(["the home page still sends X-Robots-Tag: noindex"]);
  expect(await verifyLive(BASE, testKey, Buffer.from("{}\n"), live())).toEqual(["index.json isn't the index the site was built from"]);
  expect(await verifyLive(BASE, readPublicKey(readFileSync("keys/marketplace.pub", "utf8")), undefined, live()))
    .toEqual([`index.json: signed by key ${testKey.id}, not EF622DD4D472E463`]);
  expect(await verifyLive(BASE, testKey, undefined, live({ "/index.json.minisig": new Response("gone", { status: 404 }) })))
    .toEqual(["index.json answered 200 and index.json.minisig 404"]);
  expect(await verifyLive(BASE, testKey, undefined, live({ "/": new Response("<!doctype html>") })))
    .toEqual(["the home page has no content security policy"]);
});
