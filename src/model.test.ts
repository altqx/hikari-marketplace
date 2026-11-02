import { expect, test } from "bun:test";
import { keyId, latest, local, longDate, type Plugin, permLines, size, slug, type Version } from "./model.ts";

const version = (v: Partial<Version>): Version => ({
  version: "1.0.0", api: 1, tier: "restricted", name: "X", summary: "", license: "MIT", authors: [], permissions: {},
  url: "", sha256: "", size: 1, published: "2027-01-02T00:00:00Z", readme: "", ...v,
});

test("the latest version skips revoked ones", () => {
  const p = { versions: [version({ version: "2.0.0", revoked: { reason: "bad" } }), version({ version: "1.0.0" })] } as Plugin;
  expect(latest(p)?.version).toBe("1.0.0");
  expect(latest({ versions: [version({ revoked: { reason: "bad" } })] } as Plugin)).toBeUndefined();
});

test("the production key's id matches minisign's", () => {
  expect(keyId("RWSZidnvIHp8qW7ynpUV8iDc/FH3riGpLuA+tz6zSeqwE3Q9Y+jmY5TH")).toBe("A97C7A20EFD98999");
});

test("helpers", () => {
  expect(local("https://marketplace.hikarisub.org/p/a.b/1.0.0/icon.svg")).toBe("/p/a.b/1.0.0/icon.svg");
  expect(local("https://example.com/x")).toBe("https://example.com/x");
  expect(longDate("2027-01-09T09:00:00Z")).toBe("9 January 2027");
  expect(slug("Styles and fonts")).toBe("styles-and-fonts");
  expect(size(40960)).toBe("40 KB");
  expect(size(3 * 1024 * 1024)).toBe("3.0 MB");
});

test("permission lines", () => {
  expect(permLines(version({ tier: "unrestricted" }))[0]?.sev).toBe("danger");
  const lines = permLines(version({ permissions: {
    network: { hosts: ["a.example", "b.example"], reason: "r1" },
    files: [{ id: "f", title: "Fonts", reason: "r2" }, { id: "g", title: "Out", reason: "r3", writable: true }],
    "documents.all": "r4",
  } }));
  expect(lines.map((l) => l.head)).toEqual([
    "Connects to a.example, b.example", "Asks you to pick a folder: “Fonts”, read only",
    "Asks you to pick a folder: “Out”, and writes there", "Reads and edits every open document",
  ]);
  expect(permLines(version({}))).toEqual([]);
});
