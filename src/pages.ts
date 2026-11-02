import { html, type Raw, raw } from "./html.ts";
import {
  appVersion, CATEGORIES, firstPublished, type Index, installUrl, keyId, latest, LISTINGS_REPO, listed, local, longDate,
  type Plugin, permLines, reportUrl, size, slug, type Version,
} from "./model.ts";

export interface Site {
  index: Index;
  downloads: Record<string, number>;
  readmes: Map<string, string>; // rendered README per plugin id, from its latest good version
  changelogs: Map<string, string>; // rendered changelog per "id@version"
}

const SITE_SOURCE = "https://github.com/altqx/hikari-marketplace";
const HIKARISUB = "https://hikarisub.org";

// Lucide shapes, as hikari-site uses.
const SHAPES = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2m-7.07-14.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  files: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  shieldX: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m14.5 9.5-5 5m0-5 5 5"/>',
  shieldOk: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
  key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4M21 2l-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
  plug: '<path d="M12 22v-5M9 8V2m6 6V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
};
const ic = (n: keyof typeof SHAPES, cls = "i") => raw(`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${SHAPES[n]}</svg>`);
const GITHUB = raw('<svg class="gh-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.6.2 2.9.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1 .9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3"/></svg>');

export const pluginHref = (p: Plugin) => `/plugins/${p.id}`;
export const authorHref = (handle: string) => `/authors/${handle}`;
export const categoryHref = (c: string) => `/categories/${slug(c)}`;

export function pluginIcon(p: Plugin, v: Version, px: number) {
  return v.icon
    ? html`<img class="picon" src="${local(v.icon)}" width="${px}" height="${px}" alt="">`
    : html`<span class="picon blank" data-size="${px}">${ic("plug")}</span>`;
}

function page(title: string, on: string, body: Raw, description = "Plugins for HikariSub, checked and signed before HikariSub installs them.") {
  return html`<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="icon" href="/logo.png">
<link rel="stylesheet" href="/site.css">
<script src="/theme.js"></script>
<script src="/site.js" defer></script>
</head>
<body>
<header class="nav">
  <a class="brand" href="/"><img src="/logo.png" alt="">HikariSub <span class="sub">Marketplace</span></a>
  <nav class="links" aria-label="Site"><a class="${on === "home" ? "on" : ""}" href="/">Browse</a><a class="${on === "publish" ? "on" : ""}" href="/publish">Publish a plugin</a>
    <a href="${HIKARISUB}/docs">Guides ${ic("ext", "i ext")}</a><a href="${HIKARISUB}">Download HikariSub ${ic("ext", "i ext")}</a></nav>
  <span class="grow"></span>
  ${on === "home" ? "" : html`<form class="search" action="/" role="search"><label>${ic("search")}<span class="sr">Search plugins</span><input name="q" type="search" placeholder="Search plugins" autocomplete="off"></label><kbd>/</kbd></form>`}
  <span class="toggle" role="group" aria-label="Theme"><button type="button" data-theme="light" aria-label="Light">${ic("sun")}</button><button type="button" data-theme="dark" aria-label="Dark">${ic("moon")}</button></span>
  <a class="iconbtn gh" href="${LISTINGS_REPO}" aria-label="Listings on GitHub">${GITHUB}</a>
  <a class="iconbtn phone-only" href="/?focus=1" aria-label="Search plugins">${ic("search")}</a>
</header>
<main>${body}</main>
<footer><span>Plugins are made by their authors. We check and sign each release before it reaches HikariSub.</span><span class="grow"></span>
  <a href="/publish">Publish a plugin</a><a href="${LISTINGS_REPO}/issues/new">Report a problem</a><a href="${LISTINGS_REPO}/blob/main/SECURITY.md">Security</a><a href="${LISTINGS_REPO}">Listings on GitHub</a><a href="${SITE_SOURCE}">Site source</a></footer>
</body>
</html>
`.value;
}

const tierBadge = (v: Version) => (v.tier === "unrestricted" ? html`<span class="badge warn">${ic("alert")}Unrestricted</span>` : "");
const downloads = (site: Site, p: Plugin) => {
  const n = site.downloads[p.id];
  return n === undefined ? "" : html`<span class="dot" title="Downloads">${ic("download", "i dl")}${n.toLocaleString("en-GB")}</span>`;
};

function card(site: Site, p: Plugin, by = true) {
  const v = latest(p) as Version;
  return html`<a class="card" href="${pluginHref(p)}"><div class="top">${pluginIcon(p, v, 44)}<div><div class="name">${v.name}</div>${by ? html`<div class="by">${p.authorName}</div>` : ""}</div></div>
  <p class="sum">${v.summary}</p>
  <div class="meta"><span>${p.categories[0]}</span>${downloads(site, p)}${v.tier === "unrestricted" ? html`<span class="end">${tierBadge(v)}</span>` : ""}</div></a>`;
}

function row(p: Plugin, side: string) {
  const v = latest(p) as Version;
  return html`<a class="row" href="${pluginHref(p)}">${pluginIcon(p, v, 36)}<div class="txt"><div class="name">${v.name} ${tierBadge(v)}</div><div class="sum">${v.summary}</div></div>
  <div class="side">${side}</div></a>`;
}

const grid = (site: Site, plugins: Plugin[], by = true) =>
  plugins.length ? html`<div class="grid">${plugins.map((p) => card(site, p, by))}</div>` : html`<p class="empty">No plugins here yet.</p>`;

const byNewest = (a: Plugin, b: Plugin) => firstPublished(b).localeCompare(firstPublished(a));
const byUpdated = (a: Plugin, b: Plugin) => (latest(b) as Version).published.localeCompare((latest(a) as Version).published);

function chips(index: Index, on?: string) {
  const plugins = listed(index);
  return html`<nav class="chips" aria-label="Categories">${CATEGORIES.map((c) => {
    const n = plugins.filter((p) => p.categories.includes(c)).length;
    return html`<a class="chip ${c === on ? "on" : ""}" href="${categoryHref(c)}"${c === on ? raw(' aria-current="page"') : ""}>${c}<span class="n">${n}</span></a>`;
  })}</nav>`;
}

export function home(site: Site) {
  const plugins = listed(site.index);
  const featured = site.index.featured.map((id) => plugins.find((p) => p.id === id)).filter((p): p is Plugin => !!p);
  const added = [...plugins].sort(byNewest).slice(0, 6);
  const updated = plugins.filter((p) => p.versions.length > 1).sort(byUpdated).slice(0, 5);
  return page("HikariSub Marketplace", "home", html`
    <section class="hero"><h1>Plugins for HikariSub</h1>
      <p>Free tools for timing, typesetting, karaoke and more. Every release is checked and signed before HikariSub installs it.</p>
      <form class="bigsearch" action="/" role="search"><label>${ic("search")}<span class="sr">Search plugins</span><input id="q" name="q" type="search" placeholder="Search plugins" autocomplete="off"></label><kbd>/</kbd></form>
      ${chips(site.index)}
    </section>
    <section class="section results" id="results" hidden aria-live="polite"><div class="section-head"><h2 id="results-head">Results</h2></div><div class="grid" id="results-grid"></div></section>
    <div id="browse">
    ${featured.length ? html`<section class="section"><div class="section-head"><h2>Featured</h2></div>${grid(site, featured)}</section>` : ""}
    <section class="section"><div class="section-head"><h2>New</h2><a href="/plugins">See all ${plugins.length}</a></div>${grid(site, added)}</section>
    ${updated.length ? html`<section class="section"><div class="section-head"><h2>Recently updated</h2></div>
      <div class="rows">${updated.map((p) => row(p, `${(latest(p) as Version).version} · ${longDate((latest(p) as Version).published)}`))}</div></section>` : ""}
    </div>`);
}

export function all(site: Site) {
  const plugins = listed(site.index).sort((a, b) => (latest(a) as Version).name.localeCompare((latest(b) as Version).name));
  return page("All plugins · HikariSub Marketplace", "home", html`
    <div class="crumbs"><a href="/">Plugins</a></div>
    <section class="section first"><div class="section-head"><h1>All plugins</h1></div>${chips(site.index)}<div class="spaced">${grid(site, plugins)}</div></section>`);
}

export function category(site: Site, c: string) {
  const plugins = listed(site.index).filter((p) => p.categories.includes(c)).sort(byUpdated);
  return page(`${c} · HikariSub Marketplace`, "home", html`
    <div class="crumbs"><a href="/">Plugins</a><span>›</span><span>${c}</span></div>
    <section class="section first"><div class="section-head"><h1>${c}</h1></div>${chips(site.index, c)}<div class="spaced">${grid(site, plugins)}</div></section>`);
}

function permBox(v: Version) {
  const lines = permLines(v);
  const shape = { full: "shieldX", network: "globe", folder: "folder", documents: "files" } as const;
  return html`<div class="box ${v.tier === "unrestricted" ? "danger" : ""}"><h2>What it can do</h2>
    ${lines.length
      ? lines.map((x) => html`<div class="perm ${x.sev}"><span class="ic">${ic(shape[x.kind])}</span><div><b>${x.head}</b><span>${x.text}</span></div></div>`)
      : html`<div class="perm ok"><span class="ic">${ic("shieldOk")}</span><div><b>Nothing beyond the basics</b><span>No network, no folders, no other documents.</span></div></div>`}
    ${v.tier === "unrestricted" ? "" : html`<p class="always">Every plugin can read and edit the document you’re working on, as one undo step, and keep its own settings.</p>`}</div>`;
}

function carousel(v: Version) {
  const shots = v.screenshots ?? [];
  if (!shots.length) return "";
  const n = shots.length;
  return html`<div class="carousel" data-count="${n}">
    <div class="frame">${shots.map((s, i) => html`<img src="${local(s.url)}" width="${s.width}" height="${s.height}" alt="${s.caption}" data-shot="${i}"${i ? raw(" hidden") : ""}${i ? raw(' loading="lazy"') : ""}>`)}</div>
    ${n > 1 ? html`<button type="button" class="arrow l" aria-label="Previous screenshot" hidden>${ic("left")}</button><button type="button" class="arrow r" aria-label="Next screenshot" hidden>${ic("right")}</button>
    <div class="thumbs">${shots.map((s, i) => html`<a href="${local(s.url)}" data-shot="${i}" class="${i ? "" : "on"}" aria-label="Screenshot ${i + 1}"><img src="${local(s.url)}" alt="" loading="lazy"></a>`)}</div>` : ""}
    <div class="caption"><span class="pos">1 of ${n}</span> · <span class="cap">${shots[0]?.caption}</span></div></div>`;
}

function history(site: Site, p: Plugin) {
  return html`<h2 id="versions">Version history</h2><div class="versions">${p.versions.map((v) => html`<div class="ver ${v.revoked ? "revoked" : ""}" id="v${v.version}"><div><div class="v">${v.version}</div><div class="d">${longDate(v.published)}</div></div>
    <div>${v.revoked ? html`<div class="why">Revoked: ${v.revoked.reason}</div>` : ""}${raw(site.changelogs.get(`${p.id}@${v.version}`) ?? "")}</div></div>`)}</div>`;
}

export function plugin(site: Site, p: Plugin) {
  const good = latest(p);
  const v = good ?? (p.versions[0] as Version);
  const app = appVersion(site.index, v.api);
  const pulled = p.revoked ?? (good ? undefined : { reason: "Every version has been revoked." });
  const install = pulled
    ? html`<div class="install"><div class="box danger revoked-box"><b>Removed from the marketplace</b><span>${pulled.reason}</span>${pulled.date ? html`<span class="d">${longDate(pulled.date)}</span>` : ""}</div></div>`
    : html`<div class="install"><a class="btn primary" href="${installUrl(p)}">${ic("plug")}Install in HikariSub</a><a class="btn secondary" href="${local(v.url)}" download>${ic("download")}Download .hikariplugin</a>
      <div class="note">${app ? `Needs HikariSub ${app} or later.` : `Needs Hikari API ${v.api}.`} <a href="${HIKARISUB}">Get HikariSub</a></div></div>`;
  const facts = html`<div class="box"><h2>Details</h2><dl class="facts">
    <dt>Version</dt><dd>${v.version}</dd><dt>Updated</dt><dd>${longDate(v.published)}</dd>${app ? html`<dt>Needs</dt><dd>HikariSub ${app} or later</dd>` : ""}
    <dt>Hikari API</dt><dd>${v.api}</dd>${site.downloads[p.id] !== undefined ? html`<dt>Downloads</dt><dd>${(site.downloads[p.id] as number).toLocaleString("en-GB")}</dd>` : ""}<dt>Size</dt><dd>${size(v.size)}</dd>
    <dt>Licence</dt><dd>${v.license}</dd><dt>Categories</dt><dd>${p.categories.map((c, i) => html`${i ? ", " : ""}<a href="${categoryHref(c)}">${c}</a>`)}</dd></dl></div>
    <div class="box links"><a href="${p.repo}">${ic("code")}Source code</a>${v.homepage ? html`<a href="${v.homepage}">${ic("globe")}Homepage</a>` : ""}<span class="keyline" title="${p.publicKey}">${ic("key")}Signing key <span class="mono">${keyId(p.publicKey)}</span></span><a href="${reportUrl(p, good)}">${ic("flag")}Report a problem</a></div>`;
  const perms = pulled ? "" : permBox(v);
  return page(`${v.name} · HikariSub Marketplace`, "plugin", html`
    <div class="crumbs"><a href="/">Plugins</a><span>›</span><a href="${categoryHref(p.categories[0] as string)}">${p.categories[0]}</a></div>
    <section class="phead">${pluginIcon(p, v, 72)}<div><h1>${v.name} ${pulled ? html`<span class="badge danger">Revoked</span>` : v.tier === "unrestricted" ? tierBadge(v) : html`<span class="badge plain">Restricted</span>`}</h1>
      <div class="by">by <a href="${authorHref(p.author)}">${p.authorName}</a></div><p class="sum">${v.summary}</p></div>
      ${install}</section>
    ${perms ? html`<div class="phone-perms">${perms}</div>` : ""}
    <section class="pbody"><div>
      ${pulled ? "" : carousel(v)}
      ${pulled ? "" : html`<div class="readme-label">Read me</div><div class="prose readme">${raw(site.readmes.get(p.id) ?? "")}</div>`}
      <div class="prose">${history(site, p)}</div>
    </div><aside class="side">${perms ? html`<div class="desk-perms">${perms}</div>` : ""}${facts}</aside></section>`, v.summary);
}

export function author(site: Site, handle: string) {
  const mine = site.index.plugins.filter((p) => p.author === handle);
  const shown = mine.filter((p) => listed(site.index).includes(p));
  const first = mine[0] as Plugin;
  const since = mine.map(firstPublished).sort()[0] ?? "";
  const keys = [...new Set(mine.map((p) => keyId(p.publicKey)))];
  return page(`${first.authorName} · HikariSub Marketplace`, "author", html`
    <section class="ahead"><div class="avatar" aria-hidden="true">${[...first.authorName][0]?.toUpperCase()}</div><div><h1>${first.authorName}</h1>
      <div class="meta"><span>@${handle}</span><a href="https://github.com/${handle}">github.com/${handle}</a><span>Listing since ${longDate(since)}</span>
      ${keys.map((k) => html`<span class="mono">Key ${k}</span>`)}</div></div></section>
    <section class="section first"><div class="section-head"><h2>${shown.length === 1 ? "1 plugin" : `${shown.length} plugins`}</h2></div>${grid(site, shown, false)}</section>`);
}

export function publish() {
  return page("Publish a plugin · HikariSub Marketplace", "publish", html`<div class="doc"><article>
    <h1>Publish a plugin</h1>
    <p class="lead">Listing is free and runs through GitHub. There’s no account to make: you open one pull request, and after that every GitHub release you sign reaches HikariSub by itself.</p>
    <ol class="steps">
      <li><h2>Write the plugin</h2><p>Follow the <a class="k" href="${HIKARISUB}/docs">plugin authoring guide</a> on hikarisub.org. Its id starts with your GitHub handle: <code>mirai.karaoke-flow</code>.</p></li>
      <li><h2>Make a signing key</h2><p>Keep the secret key to yourself. We pin the public key to your handle, and a new key goes through us.</p>
        <pre>minisign -G -p mirai.pub -s ~/.minisign/mirai.key</pre></li>
      <li><h2>Open a listing pull request</h2><p>Add one file to <a class="k" href="${LISTINGS_REPO}">altqx/hikari-plugins</a>. We review the first listing by hand, usually within a week.</p>
        <pre>plugins/mirai.karaoke-flow.json
{
  <span class="k">"id"</span>: <span class="s">"mirai.karaoke-flow"</span>,
  <span class="k">"author"</span>: <span class="s">"mirai"</span>,
  <span class="k">"repo"</span>: <span class="s">"github.com/mirai/karaoke-flow"</span>,
  <span class="k">"publicKey"</span>: <span class="s">"RWQf6LRCGA9i53ml…"</span>,
  <span class="k">"categories"</span>: [<span class="s">"Karaoke"</span>]
}</pre></li>
      <li><h2>Publish a GitHub release</h2><p>Attach the package and its signature. Our checks pick it up within half an hour and it appears here once they pass.</p>
        <pre>karaoke-flow/releases/v2.3.1
  mirai.karaoke-flow-2.3.1.hikariplugin
  mirai.karaoke-flow-2.3.1.hikariplugin.minisig</pre></li>
      <li><h2>Updates</h2><p>Every later release goes through the same checks: the manifest, the API number, the size, the file paths and your signature.</p>
        <div class="callout">A release that asks for more than the last one (a new host, a folder, every open document, or the unrestricted tier) waits for our review. Users are asked before it installs.</div></li>
    </ol></article>
    <aside class="toc"><div class="box"><h2>Before you start</h2><ul><li>Free plugins only, under an open-source licence.</li><li>A README.md and an icon in the package.</li><li>Screenshots help people choose.</li></ul></div>
      <div class="box"><h2>If something goes wrong</h2><ul><li>A version or plugin can be revoked. HikariSub turns it off and offers the last good version.</li><li>Report malware to <a class="k" href="mailto:security@hikarisub.org">security@hikarisub.org</a>.</li></ul></div></aside>
  </div>`);
}

export function notFound() {
  return page("Not found · HikariSub Marketplace", "404", html`<section class="hero"><h1>Not found</h1><p>There’s no page here. It may have been a plugin that was removed.</p>
    <p><a class="btn secondary" href="/">Browse plugins</a></p></section>`);
}

export function searchEntries(site: Site) {
  return listed(site.index).map((p) => {
    const v = latest(p) as Version;
    return { id: p.id, name: v.name, summary: v.summary, author: p.authorName, handle: p.author, categories: p.categories,
      icon: v.icon ? local(v.icon) : null, tier: v.tier, href: pluginHref(p), updated: v.published };
  });
}
