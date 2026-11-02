// Renders one marketplace page from ?page=&theme=&id= for the mockup sheets.
const q = new URLSearchParams(location.search);
if (q.get("theme") === "dark") document.documentElement.classList.add("dark");
const page = q.get("page") || "home";

// Lucide shapes, as hikari-site uses.
const L = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2m-7.07-14.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>',
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
const ic = (n, cls = "i") => `<svg class="${cls}" viewBox="0 0 24 24">${L[n]}</svg>`;
const gh = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.6.2 2.9.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1 .9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3"/></svg>';

const nav = (on) => `<header class="nav">
  <a class="brand" href="#"><img src="logo.png" alt="">HikariSub <span class="sub">Marketplace</span></a>
  <nav class="links"><a class="${on === "home" ? "on" : ""}">Browse</a><a class="${on === "submit" ? "on" : ""}">Publish a plugin</a>
    <a>Guides ${ic("ext", "i ext")}</a><a>Download HikariSub ${ic("ext", "i ext")}</a></nav>
  <span class="grow"></span>
  ${on === "home" ? "" : `<span class="search">${ic("search")}Search plugins<kbd>/</kbd></span>`}
  <span class="toggle"><span class="${q.get("theme") === "dark" ? "" : "on"}">${ic("sun")}</span><span class="${q.get("theme") === "dark" ? "on" : ""}">${ic("moon")}</span></span>
  <a class="iconbtn gh" title="Listings on GitHub">${gh}</a>
  <a class="iconbtn phone-only">${ic("search")}</a><a class="iconbtn phone-only">${ic("menu")}</a>
</header>`;

const foot = `<footer><span>Plugins are made by their authors. We check and sign each release before it reaches HikariSub.</span><span class="grow"></span>
  <a>Report a problem</a><a>Security</a><a>Listings on GitHub</a><a>Site source</a></footer>`;

const author = (p) => MK.authors[p.author];
const tierBadge = (p) => p.tier === "unrestricted" ? `<span class="badge warn">${ic("alert")}Unrestricted</span>` : "";
const card = (p, by = true) => `<a class="card"><div class="top">${MK.icon(p, 44)}<div><div class="name">${p.name}</div>${by ? `<div class="by">${author(p).name}</div>` : ""}</div></div>
  <p class="sum">${p.summary}</p>
  <div class="meta"><span>${p.cats[0]}</span><span class="dot">${ic("download","i dl")}${p.downloads}</span>${p.tier ? `<span style="margin-left:auto">${tierBadge(p)}</span>` : ""}</div></a>`;
const row = (p, side) => `<a class="row">${MK.icon(p, 36)}<div class="txt"><div class="name">${p.name} ${tierBadge(p)}</div><div class="sum">${p.summary}</div></div>
  <div class="side">${side}</div></a>`;

function home() {
  const counts = Object.fromEntries(MK.categories.map((c) => [c, MK.plugins.filter((p) => p.cats.includes(c)).length]));
  const added = ["haru.batch-qc", "nanami.chapter-export", "lumen.draft-translate", "nanami.sign-tracker", "mirai.karaoke-flow", "kaede.font-doctor"].map(MK.byId);
  const upd = ["haru.batch-qc", "lumen.draft-translate", "nanami.sign-tracker", "mirai.karaoke-flow", "tsubame.reading-speed"].map(MK.byId);
  return `${nav("home")}<main>
    <section class="hero"><h1>Plugins for HikariSub</h1>
      <p>Free tools for timing, typesetting, karaoke and more. Every release is checked and signed before HikariSub installs it.</p>
      <div class="bigsearch">${ic("search")}<span class="grow">Search plugins</span><kbd>/</kbd></div>
      <div class="chips">${MK.categories.map((c) => `<span class="chip">${c}<span class="n">${counts[c]}</span></span>`).join("")}</div>
    </section>
    <section class="section"><div class="section-head"><h2>New</h2><a>See all</a></div><div class="grid">${added.map(card).join("")}</div></section>
    <section class="section"><div class="section-head"><h2>Recently updated</h2><a>See all</a></div>
      <div class="rows">${upd.map((p) => row(p, `${p.version} · ${p.updated}`)).join("")}</div></section>
  </main>${foot}`;
}

const signReadme = `<h2>Sign Tracker</h2>
  <p>Track a sign through a shot and turn the motion into tags. Pick the sign’s corners on the first frame, run the tracker, and Sign Tracker writes a line per frame with <code>\\pos</code>, <code>\\frz</code> and <code>\\fscx</code>/<code>\\fscy</code>.</p>
  <h3>Use it</h3><ol><li>Select the typeset line and open <b>Sign Tracker</b> from the Video panel’s tools.</li><li>Drag the four corners onto the sign.</li><li>Press <b>Track</b>. Lines appear in the Grid as one undo step.</li></ol>
  <h3>Settings</h3><pre><code>search radius   24 px
smoothing       0.35
split on cut    yes</code></pre>
  <p>Tracking data goes into a folder you choose, so a shot can be retracked later without starting over.</p>`;

const readmeFor = (p) => p.id === "nanami.sign-tracker" ? signReadme : `<h2>${p.name}</h2>
  <p>${p.summary} Select the sign’s line, open <b>${p.name}</b> from the Video panel’s tools, and drag the four corners onto the plane in the picture.</p>
  <h3>Why it’s unrestricted</h3><p>The fitting runs in OpenCV, a native library, so the plugin needs full access. The Lua side is in <code>src/</code> and the native module’s build script is in <code>native/</code>, so you can build it yourself.</p>`;

function plugin() {
  const p = MK.byId(q.get("id") || "nanami.sign-tracker");
  const readme = readmeFor(p);
  const a = author(p);
  const perms = MK.permLines(p);
  const versions = p.id === "nanami.sign-tracker" ? [
    { v: "0.9.4", date: "17 January 2027", notes: ["Faster tracking on 4K video.", "Corners snap to the sign’s edges when Shift is held."] },
    { v: "0.9.3", date: "9 January 2027", notes: ["Restores 0.9.1’s tracker after the 0.9.2 crash."] },
    { v: "0.9.2", date: "8 January 2027", revoked: "Crashed the plugin helper on variable-frame-rate video.", notes: ["New smoothing setting."] },
    { v: "0.9.1", date: "20 December 2026", notes: ["Splits the track at scene cuts."] },
  ] : p.versions;
  const permBox = `<div class="box ${p.tier ? "danger" : ""}"><h3>What it can do</h3>
    ${perms.length ? perms.map((x) => `<div class="perm ${x.sev}"><span class="ic">${ic(x.sev === "danger" ? "shieldX" : x.head.startsWith("Connects") ? "globe" : x.head.startsWith("Reads and edits") ? "files" : "folder")}</span><div><b>${x.head}</b><span>${x.text}</span></div></div>`).join("")
      : `<div class="perm ok"><span class="ic">${ic("shieldOk")}</span><div><b>Nothing beyond the basics</b><span>No network, no folders, no other documents.</span></div></div>`}
    ${p.tier ? "" : `<p class="always">Every plugin can read and edit the document you’re working on, as one undo step, and keep its own settings.</p>`}</div>`;
  const facts = `<div class="box"><h3>Details</h3><dl class="facts">
    <dt>Version</dt><dd>${p.version}</dd><dt>Updated</dt><dd>${p.updated}</dd><dt>Needs</dt><dd>HikariSub ${p.app} or later</dd>
    <dt>Hikari API</dt><dd>${p.api}</dd><dt>Downloads</dt><dd>${p.downloads}</dd><dt>Size</dt><dd>${p.size}</dd>
    <dt>Licence</dt><dd>${p.licence}</dd><dt>Categories</dt><dd>${p.cats.map((c) => `<a>${c}</a>`).join(", ")}</dd></dl></div>
    <div class="box links"><a>${ic("code")}Source code</a><a>${ic("key")}Signing key <span class="mono" style="color:var(--muted-fg);margin-left:auto">${a.key.slice(0, 8)}…</span></a><a>${ic("flag")}Report a problem</a></div>`;
  return `${nav("plugin")}<main>
    <div class="crumbs"><a>Plugins</a><span>›</span><a>${p.cats[0]}</a></div>
    <section class="phead">${MK.icon(p, 72)}<div><h1>${p.name} ${p.tier ? tierBadge(p) : `<span class="badge plain">Restricted</span>`}</h1>
      <div class="by">by <a>${a.name}</a></div><p class="sum">${p.summary}</p></div>
      <div class="install"><a class="btn primary">${ic("plug")}Install in HikariSub</a><a class="btn secondary">${ic("download")}Download .hikariplugin</a>
      <div class="note">Needs HikariSub ${p.app} or later. <a>Get HikariSub</a></div></div></section>
    <div class="phone-perms">${permBox}</div>
    <section class="pbody"><div>
      <div class="carousel"><div class="frame">${MK.shot(1, "Sign Tracker following a station sign")}</div>
        <span class="arrow l">${ic("left")}</span><span class="arrow r">${ic("right")}</span>
        <div class="thumbs"><div>${MK.shot(0, "")}</div><div class="on">${MK.shot(1, "")}</div><div>${MK.shot(2, "")}</div></div>
        <div class="caption">2 of 3 · ${p.id === "nanami.sign-tracker" ? "The tracked corners on a station sign." : "A sign fitted to a slanted wall."}</div></div>
      <div class="readme-label">Read me</div>
      <div class="prose" style="margin-top:0">${readme}
        <h2>Version history</h2><div class="versions">${versions.map((v) => `<div class="ver ${v.revoked ? "revoked" : ""}"><div><div class="v">${v.v}</div><div class="d">${v.date}</div></div>
          <div>${v.revoked ? `<div class="why">Revoked: ${v.revoked}</div>` : ""}<ul>${v.notes.map((n) => `<li>${n}</li>`).join("")}</ul></div></div>`).join("")}</div></div>
    </div><aside class="side"><div class="desk-perms">${permBox}</div>${facts}</aside></section>
  </main>${foot}`;
}

function phonePlugin() {
  // The phone frame shows an unrestricted plugin's top half.
  return plugin();
}

function authorPage() {
  const h = q.get("author") || "mirai";
  const a = MK.authors[h];
  const mine = MK.plugins.filter((p) => p.author === h);
  return `${nav("author")}<main>
    <section class="ahead"><div class="avatar">M</div><div><h1>${a.name}</h1>
      <div class="meta"><span>@${h}</span><a>${gh.replace('width="20" height="20"', 'width="14" height="14" style="vertical-align:-2px"')} github.com/${h}</a><span>Listing since ${a.since}</span>
      <span class="mono">Key ${a.key.slice(0, 10)}…</span></div></div></section>
    <section class="section" style="margin-top:28px"><div class="section-head"><h2>${mine.length} plugins</h2></div><div class="grid">${mine.map((p) => card(p, false)).join("")}</div></section>
  </main>${foot}`;
}

function submit() {
  return `${nav("submit")}<main><div class="doc"><article>
    <h1>Publish a plugin</h1>
    <p class="lead">Listing is free and runs through GitHub. There’s no account to make: you open one pull request, and after that every GitHub release you sign reaches HikariSub by itself.</p>
    <ol class="steps">
      <li><h3>Write the plugin</h3><p>Follow the <a class="k">plugin authoring guide</a> on hikarisub.org. Its id starts with your GitHub handle: <code>mirai.karaoke-flow</code>.</p></li>
      <li><h3>Make a signing key</h3><p>Keep the secret key to yourself. We pin the public key to your handle, and a new key goes through us.</p>
        <pre>minisign -G -p mirai.pub -s ~/.minisign/mirai.key</pre></li>
      <li><h3>Open a listing pull request</h3><p>Add one file to <a class="k">altqx/hikari-plugins</a>. We review the first listing by hand, usually within a week.</p>
        <pre>plugins/mirai.karaoke-flow.json
{
  <span class="k">"repo"</span>: <span class="s">"github.com/mirai/karaoke-flow"</span>,
  <span class="k">"author"</span>: <span class="s">"mirai"</span>,
  <span class="k">"publicKey"</span>: <span class="s">"RWQf6LRCGA9i53ml…"</span>,
  <span class="k">"categories"</span>: [<span class="s">"Karaoke"</span>]
}</pre></li>
      <li><h3>Publish a GitHub release</h3><p>Attach the package and its signature. Our checks pick it up within minutes and it appears here once they pass.</p>
        <pre>karaoke-flow/releases/v2.3.1
  mirai.karaoke-flow-2.3.1.hikariplugin
  mirai.karaoke-flow-2.3.1.hikariplugin.minisig</pre></li>
      <li><h3>Updates</h3><p>Every later release goes through the same checks: the manifest, the API number, the size, the file paths and your signature.</p>
        <div class="callout">A release that asks for more than the last one (a new host, a folder, every open document, or the unrestricted tier) waits for our review. Users are asked before it installs.</div></li>
    </ol></article>
    <aside class="toc"><div class="box"><h3>Before you start</h3><ul><li>Free plugins only, under an open-source licence.</li><li>A README.md and an icon in the package.</li><li>Screenshots help people choose.</li></ul></div>
      <div class="box"><h3>If something goes wrong</h3><ul><li>A version or plugin can be revoked. HikariSub turns it off and offers the last good version.</li><li>Report malware to <a class="k">security@hikarisub.org</a>.</li></ul></div></aside>
  </div></main>${foot}`;
}

document.body.innerHTML = { home, plugin, author: authorPage, submit }[page]();
