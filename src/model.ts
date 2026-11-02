// The registry's index.json (hikari-plugins/schemas/index.schema.json), and what the pages derive from it.
export const BASE_URL = "https://marketplace.hikarisub.org";
export const LISTINGS_REPO = "https://github.com/altqx/hikari-plugins";

export interface Revocation {
  reason: string;
  date?: string;
}

export interface Permissions {
  "documents.all"?: string;
  network?: { hosts: string[]; reason: string };
  files?: { id: string; title: string; reason: string; writable?: boolean }[];
}

export interface Version {
  version: string;
  api: number;
  tier: "restricted" | "unrestricted";
  name: string;
  summary: string;
  description?: string;
  license: string;
  homepage?: string;
  authors: string[];
  permissions: Permissions;
  url: string;
  sha256: string;
  size: number;
  published: string;
  changelog?: string;
  icon?: string;
  screenshots?: { url: string; caption: string; width: number; height: number }[];
  readme: string;
  revoked?: Revocation;
}

export interface Plugin {
  id: string;
  author: string;
  authorName: string;
  repo: string;
  publicKey: string;
  categories: string[];
  revoked?: Revocation;
  versions: Version[];
}

export interface Index {
  format: 1;
  serial: number;
  generated: string;
  apiVersions: Record<string, string>;
  featured: string[];
  plugins: Plugin[];
}

export const CATEGORIES = [
  "Timing", "Typesetting", "Karaoke", "Translation", "Styles and fonts", "Video and audio", "Import and export",
  "Quality checks", "Utilities",
];

export const slug = (category: string) => category.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export function parseIndex(text: string): Index {
  const index = JSON.parse(text) as Index;
  if (index.format !== 1 || !Array.isArray(index.plugins)) throw new Error("not a format 1 marketplace index");
  return index;
}

/** The newest version that isn't revoked; undefined when every version is. */
export const latest = (p: Plugin) => p.versions.find((v) => !v.revoked);

/** Plugins people can install: not revoked, with a good version. */
export const listed = (index: Index) => index.plugins.filter((p) => !p.revoked && latest(p));

export const firstPublished = (p: Plugin) => p.versions.at(-1)?.published ?? "";

/** Media URLs in the index point at the production host; the site serves them from its own /p/. */
export const local = (url: string) => (url.startsWith(`${BASE_URL}/`) ? url.slice(BASE_URL.length) : url);

/** minisign shows a key id as the 8 bytes after "Ed", reversed, in hex. */
export function keyId(publicKey: string) {
  const bytes = Buffer.from(publicKey, "base64").subarray(2, 10);
  return [...bytes].reverse().map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export const appVersion = (index: Index, api: number) => index.apiVersions[String(api)];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
  "November", "December"];

export function longDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS[(m ?? 1) - 1]} ${y}`;
}

export function size(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export interface PermLine {
  sev: "warn" | "danger";
  kind: "full" | "network" | "folder" | "documents";
  head: string;
  text: string;
}

export function permLines(v: Version): PermLine[] {
  if (v.tier === "unrestricted") {
    return [{ sev: "danger", kind: "full", head: "Full access to your computer",
      text: "Runs native code with your user account’s rights. HikariSub can’t limit what it reads, writes or sends." }];
  }
  const p = v.permissions;
  const out: PermLine[] = [];
  if (p.network) out.push({ sev: "warn", kind: "network", head: `Connects to ${p.network.hosts.join(", ")}`, text: p.network.reason });
  for (const f of p.files ?? []) {
    out.push({ sev: "warn", kind: "folder", head: `Asks you to pick a folder: “${f.title}”${f.writable ? ", and writes there" : ", read only"}`,
      text: f.reason });
  }
  if (p["documents.all"]) out.push({ sev: "warn", kind: "documents", head: "Reads and edits every open document", text: p["documents.all"] });
  return out;
}

export function reportUrl(p: Plugin, v: Version | undefined) {
  const q = new URLSearchParams({
    title: `Report: ${p.id}${v ? ` ${v.version}` : ""}`,
    body: `Plugin: ${p.id}\nVersion: ${v?.version ?? "any"}\n\nWhat's wrong:\n`,
  });
  return `${LISTINGS_REPO}/issues/new?${q}`;
}

export const installUrl = (p: Plugin) => `hikarisub://plugin/install?id=${encodeURIComponent(p.id)}`;
