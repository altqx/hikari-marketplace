// Builds dist/ from an index directory: index.json, an optional downloads.json, and its p/ media.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { renderMarkdown } from "./markdown.ts";
import { BASE_URL, CATEGORIES, type Index, latest, listed, local, parseIndex, slug } from "./model.ts";
import * as pages from "./pages.ts";

const SOURCE = process.env.INDEX_DIR ?? "fixtures/test-index";
const NOINDEX = process.env.NOINDEX === "1";
const OUT = "dist";

async function text(url: string) {
  const path = join(SOURCE, local(url));
  if (url.startsWith(`${BASE_URL}/`) && existsSync(path)) return readFileSync(path, "utf8");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.text();
}

export async function load(source: string): Promise<pages.Site> {
  const index: Index = parseIndex(readFileSync(join(source, "index.json"), "utf8"));
  const dl = join(source, "downloads.json");
  const downloads = existsSync(dl) ? (JSON.parse(readFileSync(dl, "utf8")) as Record<string, number>) : {};
  const readmes = new Map<string, string>();
  const changelogs = new Map<string, string>();
  for (const p of index.plugins) {
    const v = latest(p);
    if (v && !p.revoked) readmes.set(p.id, renderMarkdown(await text(v.readme)));
    for (const ver of p.versions) changelogs.set(`${p.id}@${ver.version}`, renderMarkdown(ver.changelog ?? ""));
  }
  return { index, downloads, readmes, changelogs };
}

/** The workers.dev preview stays out of search engines; marketplace.hikarisub.org doesn't. */
export const withNoindex = (headers: string) => headers.replace(/^\/\*\n/m, "/*\n  X-Robots-Tag: noindex\n");

function write(path: string, body: string) {
  const file = join(OUT, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, body);
}

if (import.meta.main) {
  const site = await load(SOURCE);
  rmSync(OUT, { recursive: true, force: true });
  cpSync("public", OUT, { recursive: true });
  if (NOINDEX) writeFileSync(join(OUT, "_headers"), withNoindex(readFileSync(join(OUT, "_headers"), "utf8")));
  if (existsSync(join(SOURCE, "p"))) {
    cpSync(join(SOURCE, "p"), join(OUT, "p"), { recursive: true, filter: (src) => !src.endsWith(".hikariplugin") });
  }
  write("index.html", pages.home(site));
  write("plugins/index.html", pages.all(site));
  write("publish/index.html", pages.publish());
  write("404.html", pages.notFound());
  for (const c of CATEGORIES) write(`categories/${slug(c)}/index.html`, pages.category(site, c));
  for (const p of site.index.plugins) write(`plugins/${p.id}/index.html`, pages.plugin(site, p));
  for (const handle of new Set(site.index.plugins.map((p) => p.author))) {
    write(`authors/${handle}/index.html`, pages.author(site, handle));
  }
  write("search.json", JSON.stringify(pages.searchEntries(site)));
  console.log(`Built ${listed(site.index).length} listed of ${site.index.plugins.length} plugins (serial ${site.index.serial}) into ${OUT}/`);
}
