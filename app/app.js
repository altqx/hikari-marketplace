// Draws the plugin manager's Marketplace mockups from ?sheet=&theme=.
const q = new URLSearchParams(location.search);
const theme = q.get("theme") || "light";
const sheet = q.get("sheet") || "browse";
document.documentElement.dataset.theme = theme;

const I = (name, cls = "") => `<i class="ico ${cls}" data-i="${name}"></i>`;
const tbar = (t) => `<div class="tbar"><span class="t">${t}</span><span class="b">${I("window-close")}</span></div>`;
const check = (on, label, sub = "") => `<div class="check"><span class="box ${on ? "on" : ""}"></span><div>${label}${sub ? `<small>${sub}</small>` : ""}</div></div>`;
const P = MK.byId;
const unres = `<span class="badge warn">${I("notice-warning")}Unrestricted</span>`;
const unver = `<span class="badge warn">${I("plugin-unverified")}Unverified</span>`;

const permIcon = (x) => x.sev === "danger" ? I("notice-warning", "danger")
  : x.head.startsWith("Connects") ? I("open-link") : x.head.startsWith("Reads and edits") ? I("find-in-files") : I("folder-open");
const perms = (p, lines = MK.permLines(p)) => {
  if (!lines.length) return `<div class="perm">${I("about")}<div><b>Nothing beyond the basics</b><span class="r">No network, no folders, no other documents.</span></div></div>`;
  return lines.map((x) => `<div class="perm">${permIcon(x)}<div><b>${x.head}${x.isNew ? '<span class="new">New</span>' : ""}${x.old ? ' <span class="muted" style="font-weight:normal">· allowed now</span>' : ""}</b><span class="r">${x.text}</span></div></div>`).join("");
};
const basics = `<div class="muted">Every plugin can read and edit the document you’re working on, as one undo step.</div>`;

const toolstrip = (hoverIdx = -1, tipText = "", showTip = true) => {
  const tools = [["plugin-install", "Install from file…"], ["check-updates", "Check for updates"], ["settings", "Plugin updates"]];
  return tools.map(([ic, name], i) => `<span class="tool ${i === hoverIdx ? "hover" : ""}" title="${name}">${I(ic)}${i === hoverIdx && showTip ? `<span class="tip">${tipText || name}</span>` : ""}</span>`).join("");
};
const managerBar = (tab, updates, hover = -1, tip = true) => `<div class="mbar">
  <span class="seg"><span class="${tab === "installed" ? "on" : ""}">Installed${updates ? ` <span class="count">${updates}</span>` : ""}</span><span class="${tab === "market" ? "on" : ""}">Marketplace</span></span>
  <span class="grow"></span>${toolstrip(hover, "", tip)}</div>`;

const lrow = (p, { sel = false, right = "", off = false, badge = "" } = {}) => `<div class="lrow ${sel ? "sel" : ""} ${off ? "off" : ""}">${MK.icon(p, 32)}
  <div class="txt"><div class="n">${p.name}${badge || (p.tier ? unres : "")}</div><div class="s">${p.summary}</div></div>${right ? `<div class="r">${right}</div>` : ""}</div>`;

const facts = (p, rows) => `<dl class="facts">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`;

function marketDetails(p, installed = false) {
  return `<div class="details">
    <div class="dhead">${MK.icon(p, 48)}<div class="t"><div class="name">${p.name}${p.tier ? unres : ""}</div><div class="by">${MK.authors[p.author].name} · ${p.version}</div></div>
      <div class="acts">${installed ? `<span class="muted">Installed</span>` : `<span class="btn primary">Install</span>`}</div></div>
    <div>${p.summary} It keeps your styles and line breaks, and leaves the original in Translation mode’s reference column.</div>
    <div class="shots"><div>${MK.shot(2, "")}</div><div>${MK.shot(0, "")}</div><div>${MK.shot(1, "")}</div></div>
    <div class="sect"><h4>Permissions</h4>${perms(p)}<div style="margin-top:6px">${basics}</div></div>
    <div class="sect">${facts(p, [["Needs", `HikariSub ${p.app} or later`], ["Licence", p.licence], ["Updated", p.updated],
      ["Source", `<span class="link">github.com/${p.author}/${p.id.split(".")[1]} ${I("open-link")}</span>`]])}</div>
  </div>`;
}

function browse() {
  const sel = P("lumen.draft-translate");
  const list = ["mirai.karaoke-flow", "tsubame.scene-snap", "nanami.sign-tracker", "oyster.perspective-kit", "lumen.draft-translate",
    "kaede.font-doctor", "tsubame.reading-speed", "haru.batch-qc", "mirai.romaji-split", "nanami.chapter-export", "haru.line-tools"].map(P);
  return `<div class="row"><div class="win" style="width:1020px;height:660px">${tbar("Plugins")}<div class="wbody">
    ${managerBar("market", 0, 0)}
    <div class="split"><div class="listpane"><div class="filters"><span class="field">${I("search")}Search plugins</span><span class="combo">All categories ${I("chevron-down")}</span></div>
      <div class="list">${list.map((p) => lrow(p, { sel: p === sel, right: p.id === "mirai.karaoke-flow" || p.id === "tsubame.scene-snap" ? "Installed" : "" })).join("")}</div></div>
      ${marketDetails(sel)}</div></div></div>
    <div class="win" style="width:420px;height:400px;align-self:flex-start">${tbar("Plugins")}<div class="wbody">${managerBar("market")}
      <div class="listpane" style="width:auto;border:0;flex:1"><div class="filters"><span class="field focus">${I("search")}kara<span style="border-left:1px solid var(--text);height:14px;margin-left:-5px"></span></span><span class="combo">Karaoke ${I("chevron-down")}</span></div>
      <div class="list">${["mirai.karaoke-flow", "mirai.romaji-split"].map((id) => lrow(P(id), { right: id === "mirai.karaoke-flow" ? "Installed" : "" })).join("")}</div></div></div></div>
  </div>`;
}

function install() {
  const dt = P("lumen.draft-translate"), pk = P("oyster.perspective-kit");
  const head = (p) => `<div class="dhead">${MK.icon(p, 40)}<div class="t"><div class="name" style="font-size:14px">${p.name}${p.tier ? unres : ""}</div><div class="by">${MK.authors[p.author].name} · ${p.version}</div></div></div>`;
  return `<div class="row">
    <div class="win" style="width:440px">${tbar("Install plugin")}<div class="dlg">${head(dt)}
      <div class="permcard">${perms(dt)}</div>${basics}
      <div class="signed">${I("about")}Signed by Lumen Fansubs and checked against the marketplace.</div></div>
      <div class="wfoot"><span class="btn">Cancel</span><span class="btn primary">Install</span></div></div>
    <div class="win" style="width:440px">${tbar("Install plugin")}<div class="dlg">${head(pk)}
      <div class="permcard danger">${perms(pk)}</div>
      <div>Install it only if you trust Oyster. It needs full access to run OpenCV, a native library.</div>
      <div class="signed">${I("about")}Signed by Oyster and checked against the marketplace.</div></div>
      <div class="wfoot"><span class="btn">Cancel</span><span class="btn danger">Install with full access</span></div></div>
    <div class="win" style="width:400px;align-self:flex-start">${tbar("Install plugin")}<div class="dlg">
      <div class="q">“Batch QC” can’t be installed while offline mode is on.</div>
      <div class="muted">The link came from the marketplace website. HikariSub looks the plugin up in its own signed list, so it needs to go online first.</div></div>
      <div class="wfoot"><span class="btn">Close</span><span class="btn primary">Turn off offline mode</span></div></div>
  </div>`;
}

function updates() {
  const dt = P("lumen.draft-translate"), kf = P("mirai.karaoke-flow");
  const deepl = { sev: "warn", head: "Connects to api.deepl.com, api-free.deepl.com", text: "Sends the selected lines’ text to DeepL when you choose it as the engine.", isNew: true };
  const old = MK.permLines(dt).map((x) => ({ ...x, old: true }));
  const installed = [
    [dt, { sel: true, right: `${I("notice-info")}1.5.0 waits for you` }],
    [kf, { right: "Updated to 2.3.1 today" }],
    [P("tsubame.scene-snap"), { right: "1.6.0" }],
    [P("tsubame.reading-speed"), { right: "2.0.1" }],
    [P("haru.line-tools"), { right: "3.0.2" }],
  ];
  return `<div class="row"><div class="win" style="width:1020px;height:560px;position:relative">${tbar("Plugins")}<div class="wbody">
    ${managerBar("installed", 1, 2, false)}
    <div class="popover" style="top:72px;right:10px;width:330px"><h5>Plugin updates</h5>
      ${check(true, "Check for plugin updates", "Follows offline mode. HikariSub downloads the whole list and never sends which plugins you have.")}
      ${check(true, "Install updates automatically", "An update that asks for more waits for you.")}</div>
    <div class="split"><div class="listpane"><div class="filters"><span class="field">${I("search")}Filter installed plugins</span></div>
      <div class="list">${installed.map(([p, o]) => lrow(p, o)).join("")}</div></div>
      <div class="details" style="padding-top:0;padding-left:0;padding-right:0;gap:0">
        <div class="inline">${I("notice-info")}<span class="msg"><b>1.5.0 asks for more than 1.4.0.</b> It stays on 1.4.0 until you agree.</span><span class="btn small">Review…</span></div>
        <div style="padding:14px 16px;display:flex;flex-direction:column;gap:12px">
        <div class="dhead">${MK.icon(dt, 48)}<div class="t"><div class="name">${dt.name}</div><div class="by">${MK.authors[dt.author].name} · ${dt.version}</div></div>
          <div class="acts"><span class="btn">Turn off</span><span class="tool" title="More options">${I("menu-more")}</span></div></div>
        ${check(true, "Install updates automatically")}
        <div class="sect"><h4>Permissions</h4>${perms(dt)}</div>
        <div class="sect">${facts(dt, [["Version", `<span class="verrow">1.4.0 <span class="link">${I("history")}Roll back to 1.3.2</span></span>`], ["Installed", "18 January 2027"], ["Licence", dt.licence]])}</div>
        </div></div></div></div></div>
    <div class="col">
    <div class="win" style="width:460px">${tbar("Update plugin")}<div class="dlg">
      <div class="dhead">${MK.icon(dt, 40)}<div class="t"><div class="name" style="font-size:14px">Update “Draft Translate” to 1.5.0?</div><div class="by">This version asks for more than 1.4.0.</div></div></div>
      <div class="permcard">${perms(dt, [deepl, ...old])}</div>
      <div class="muted">Changes in 1.5.0: Can use DeepL with your own key.</div></div>
      <div class="wfoot"><span class="btn">Keep 1.4.0</span><span class="btn primary">Update</span></div></div>
    <div class="toast">${I("history")}<div><div class="t">Karaoke Flow rolled back to 2.3.0</div><div class="m">Automatic updates skip 2.3.1 and take the next version.</div>
      <div class="acts"><span class="link">Undo</span></div></div></div></div>
  </div>`;
}

function notices() {
  const st = P("nanami.sign-tracker"), fd = P("kaede.font-doctor");
  const list = (sel) => [
    lrow(st, { sel: sel === "st", off: true, right: `<span style="color:var(--danger)">Revoked</span>` }),
    lrow(fd, { sel: sel === "fd", badge: unver }),
    lrow(P("mirai.karaoke-flow")), lrow(P("tsubame.scene-snap")), lrow(P("haru.line-tools")),
  ].join("");
  return `<div class="row">
    <div class="win" style="width:900px;height:430px">${tbar("Plugins")}<div class="wbody">${managerBar("installed")}
      <div class="split"><div class="listpane"><div class="filters"><span class="field">${I("search")}Filter installed plugins</span></div><div class="list">${list("st")}</div></div>
      <div class="details" style="padding:0;gap:0">
        <div class="inline">${I("notice-error", "danger")}<span class="msg"><b>The marketplace revoked 0.9.2:</b> it crashed the plugin helper on variable-frame-rate video. It’s turned off.</span></div>
        <div style="padding:14px 16px;display:flex;flex-direction:column;gap:12px">
        <div class="dhead">${MK.icon(st, 48)}<div class="t"><div class="name">${st.name}</div><div class="by">${MK.authors[st.author].name} · 0.9.2</div></div>
          <div class="acts"><span class="btn">Uninstall</span><span class="btn primary">Install 0.9.1</span></div></div>
        <div class="muted">0.9.1 is the last good version. Your tracking data stays where it is.</div>
        <div class="sect"><h4>Permissions</h4>${perms(st)}</div></div></div></div></div></div>
    <div class="toast" style="align-self:flex-start">${I("notice-error", "danger")}<div><div class="t">Sign Tracker turned off</div><div class="m">The marketplace revoked version 0.9.2.</div><div class="acts"><span class="link">Show</span></div></div></div>
  </div>
  <div class="row"><div class="win" style="width:900px;height:430px">${tbar("Plugins")}<div class="wbody">${managerBar("installed")}
      <div class="split"><div class="listpane"><div class="filters"><span class="field">${I("search")}Filter installed plugins</span></div><div class="list">${list("fd")}</div></div>
      <div class="details" style="padding:0;gap:0">
        <div class="inline">${I("plugins")}<span class="msg"><b>Font Doctor is in the marketplace,</b> signed with the same key. Move it there to get updates.</span><span class="btn small">Not now</span><span class="btn small" style="font-weight:bold">Move to the marketplace</span></div>
        <div style="padding:14px 16px;display:flex;flex-direction:column;gap:12px">
        <div class="dhead">${MK.icon(fd, 48)}<div class="t"><div class="name">${fd.name}${unver}</div><div class="by">Kaede Arai · 1.1.0 · from font-doctor-1.1.0.hikariplugin</div></div>
          <div class="acts"><span class="btn">Turn off</span><span class="tool">${I("menu-more")}</span></div></div>
        <div class="muted">Installed from a file. HikariSub can’t tell who made it, and it never updates by itself.</div>
        <div class="sect"><h4>Permissions</h4>${perms(fd)}</div></div></div></div></div></div></div>`;
}

const titles = { browse: "A1 · Marketplace: browse and search", install: "A2 · Install confirmation", updates: "A3 · Updates: switches, consent, roll back", notices: "A4 · Revoked, unverified, move to the marketplace" };
const themeNames = { light: "Light", dark: "Dark", hcb: "High contrast black", hcw: "High contrast white" };
const notes = {
  browse: "The plugin manager gets two views, Installed and Marketplace. The tool strip is icon-only, with names on hover (Install from file… shown). Left: search and one category box, then the list; the right pane shows the chosen plugin. The small window shows a search narrowed to Karaoke.",
  install: "Every install, from the list or from a website link, ends in this dialog. Left: a restricted plugin with one permission. Middle: the unrestricted tier, where the button names what you agree to. Right: a website link while offline mode is on.",
  updates: "Gear: the two global switches. Each plugin has its own switch. An update that asks for more stays on hold, marked in the list and the details, and asks once (the dialog, with new items tagged). Roll back sits next to the version and confirms with a toast you can undo.",
  notices: "Top: at the next check a revoked version is turned off, with the reason and the last good version offered. A toast says so once. Bottom: a sideloaded plugin carries Unverified; when the marketplace lists the same id and key, the bar offers the move.",
};

document.body.innerHTML = `<h1>${titles[sheet]} · ${themeNames[theme]}</h1><div class="hk stage">${{ browse, install, updates, notices }[sheet]()}</div><div class="notes">${notes[sheet]}</div>`;

Promise.all([...new Set([...document.querySelectorAll("[data-i]")].map((e) => e.dataset.i))].map((n) =>
  fetch(`../icons/${n}.svg`).then((r) => r.text()).then((svg) => [n, svg]))).then((all) => {
  const map = Object.fromEntries(all);
  for (const e of document.querySelectorAll("[data-i]")) e.innerHTML = map[e.dataset.i];
  document.body.dataset.ready = "1";
});
