// Theme toggle, search, "/" to focus search, and the screenshot carousel.
const root = document.documentElement;

const syncToggle = () => {
  for (const b of document.querySelectorAll(".toggle button")) {
    b.setAttribute("aria-pressed", String((b.dataset.theme === "dark") === root.classList.contains("dark")));
  }
};
for (const b of document.querySelectorAll(".toggle button")) {
  b.addEventListener("click", () => {
    root.classList.toggle("dark", b.dataset.theme === "dark");
    try { localStorage.setItem("theme", b.dataset.theme); } catch {}
    syncToggle();
  });
}
syncToggle();

const searchBox = () => document.querySelector("#q") || document.querySelector(".nav .search input");
document.addEventListener("keydown", (e) => {
  const t = e.target;
  if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || t.closest?.("input, textarea, [contenteditable]")) return;
  const box = searchBox();
  if (box && box.offsetParent !== null) { e.preventDefault(); box.focus(); }
});

// Search, on the home page only.
const q = document.querySelector("#q");
if (q) {
  const results = document.querySelector("#results");
  const grid = document.querySelector("#results-grid");
  const head = document.querySelector("#results-head");
  const browse = document.querySelector("#browse");
  let entries = null;
  const load = () => (entries ??= fetch("/search.json").then((r) => r.json()));

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const card = (p) => {
    const a = el("a", "card");
    a.href = p.href;
    const top = el("div", "top");
    const icon = p.icon ? el("img", "picon") : el("span", "picon blank");
    if (p.icon) { icon.src = p.icon; icon.width = icon.height = 44; icon.alt = ""; } else icon.dataset.size = "44";
    const names = el("div");
    names.append(el("div", "name", p.name), el("div", "by", p.author));
    top.append(icon, names);
    const meta = el("div", "meta");
    meta.append(el("span", "", p.categories[0]));
    if (p.tier === "unrestricted") { const end = el("span", "end"); end.append(el("span", "badge warn", "Unrestricted")); meta.append(end); }
    a.append(top, el("p", "sum", p.summary), meta);
    return a;
  };
  const score = (p, words) => {
    let s = 0;
    for (const w of words) {
      const name = p.name.toLowerCase();
      if (name.startsWith(w)) s += 8;
      else if (name.includes(w)) s += 5;
      else if (p.id.includes(w) || p.categories.some((c) => c.toLowerCase().includes(w))) s += 3;
      else if (p.author.toLowerCase().includes(w) || p.handle.includes(w)) s += 2;
      else if (p.summary.toLowerCase().includes(w)) s += 1;
      else return 0;
    }
    return s;
  };
  const run = async () => {
    const text = q.value.trim().toLowerCase();
    const url = new URL(location.href);
    if (text) url.searchParams.set("q", q.value.trim()); else url.searchParams.delete("q");
    url.searchParams.delete("focus");
    history.replaceState(null, "", url);
    if (!text) { results.hidden = true; browse.hidden = false; return; }
    const words = text.split(/\s+/);
    const found = (await load()).map((p) => [score(p, words), p]).filter(([s]) => s > 0).sort((a, b) => b[0] - a[0]).map(([, p]) => p);
    if (q.value.trim().toLowerCase() !== text) return;
    head.textContent = found.length ? `${found.length} ${found.length === 1 ? "plugin" : "plugins"} for “${q.value.trim()}”` : `No plugins match “${q.value.trim()}”`;
    grid.replaceChildren(...found.map(card));
    results.hidden = false;
    browse.hidden = true;
  };
  q.addEventListener("input", run);
  q.form.addEventListener("submit", (e) => { e.preventDefault(); run(); });
  const params = new URLSearchParams(location.search);
  if (params.get("q")) { q.value = params.get("q"); run(); }
  if (params.has("focus") || params.get("q")) q.focus();
}

// Screenshots: arrows, thumbnails and the arrow keys.
for (const c of document.querySelectorAll(".carousel")) {
  const shots = [...c.querySelectorAll(".frame img")];
  const thumbs = [...c.querySelectorAll(".thumbs a")];
  if (shots.length < 2) continue;
  let at = 0;
  const show = (n) => {
    at = (n + shots.length) % shots.length;
    shots.forEach((s, i) => { s.hidden = i !== at; });
    thumbs.forEach((t, i) => { t.classList.toggle("on", i === at); t.setAttribute("aria-current", String(i === at)); });
    c.querySelector(".pos").textContent = `${at + 1} of ${shots.length}`;
    c.querySelector(".cap").textContent = shots[at].alt;
  };
  for (const a of c.querySelectorAll(".arrow")) a.hidden = false;
  c.querySelector(".arrow.l").addEventListener("click", () => show(at - 1));
  c.querySelector(".arrow.r").addEventListener("click", () => show(at + 1));
  thumbs.forEach((t, i) => t.addEventListener("click", (e) => { e.preventDefault(); show(i); }));
  c.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(at - 1);
    if (e.key === "ArrowRight") show(at + 1);
  });
}
