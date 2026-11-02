// Fake sample catalogue shared by the web and app mockups.
window.MK = {
  categories: ["Timing", "Typesetting", "Karaoke", "Translation", "Styles and fonts",
    "Video and audio", "Import and export", "Quality checks", "Utilities"],
  authors: {
    mirai: { name: "Mirai Kobayashi", since: "November 2026", key: "RWQf6LRCGA9i53mlYecO4IzT51TGPpvWucNSCh1CBM0QTaLn73Y7GFO3" },
    tsubame: { name: "Tsubame Subs", since: "November 2026", key: "RWTk2qkHn5fW0aR9nQ8m1vXo7sLwzBc4dYp3eGhJiKuMtNrAs6bE0Cx" },
    kaede: { name: "Kaede Arai", since: "November 2026", key: "RWSx9Lm2Qp7Vw4Zr1Tb8Nc3Ky6Hd0Fg5Js2Ua9Ei4Ro7Pl1Wq3Mz6Xn8" },
    lumen: { name: "Lumen Fansubs", since: "December 2026", key: "RWRb3Nk8Pq1Xs6Tv9Wy2Za5Cd8Fg1Hj4Km7Lp0Qs3Rt6Uv9Wx2Yz5Ab8" },
    nanami: { name: "Nanami Ts", since: "December 2026", key: "RWTq4Mp7Ls0Kr3Jq6Hp9Go2Fn5Em8Dl1Ck4Bj7Ai0Zh3Yg6Xf9We2Vd5" },
    oyster: { name: "Oyster", since: "December 2026", key: "RWSz1Ya4Xb7Wc0Vd3Ue6Tf9Sg2Rh5Qi8Pj1Ok4Nl7Mm0Ln3Ko6Jp9Iq2" },
    haru: { name: "Haru", since: "January 2027", key: "RWQa7Bc0De3Fg6Hi9Jk2Lm5No8Pq1Rs4Tu7Vw0Xy3Za6Bc9De2Fg5Hi8" },
  },
  plugins: [
    {
      id: "mirai.karaoke-flow", name: "Karaoke Flow", author: "mirai", hue: 158,
      glyph: "kf", cats: ["Karaoke"], version: "2.3.1", api: 1, app: "0.2.0", licence: "MIT",
      updated: "2 days ago", added: "3 weeks ago", downloads: "4.8k", size: "184 KB",
      summary: "Syllable effects from presets, previewed on the video as you tweak them.",
      perms: [],
      versions: [
        { v: "2.3.1", date: "16 January 2027", notes: ["Fixed the preview lagging one frame behind on 23.976 fps video.", "Grow and Wipe presets keep \\an from the line’s style."] },
        { v: "2.3.0", date: "4 January 2027", notes: ["New Ripple preset.", "Presets can be saved to a Style catalogue."] },
        { v: "2.2.0", date: "12 December 2026", notes: ["Panel remembers the last preset per style."] },
        { v: "2.1.0", date: "28 November 2026", notes: ["First marketplace release."] },
      ],
    },
    {
      id: "tsubame.scene-snap", name: "Scene Snap", author: "tsubame", hue: 210,
      glyph: "ss", cats: ["Timing"], version: "1.6.0", api: 1, app: "0.2.0", licence: "GPL-3.0-or-later",
      updated: "5 days ago", added: "2 months ago", downloads: "3.1k", size: "96 KB",
      summary: "Snaps starts and ends to scene changes, with lead-in rules per style.",
      perms: [],
      versions: [{ v: "1.6.0", date: "13 January 2027", notes: ["Per-style rules."] }],
    },
    {
      id: "nanami.sign-tracker", name: "Sign Tracker", author: "nanami", hue: 32,
      glyph: "st", cats: ["Typesetting", "Video and audio"], version: "0.9.4", api: 2, app: "0.3.0", licence: "MIT",
      updated: "1 day ago", added: "6 weeks ago", downloads: "2.6k", size: "212 KB",
      summary: "Tracks a sign through a shot and writes \\pos and \\frz for every frame.",
      perms: [{ kind: "files", title: "Tracking data folder", writable: true, reason: "Saves tracking data next to your project so a shot can be retracked later." }],
      versions: [{ v: "0.9.4", date: "17 January 2027", notes: ["Faster tracking on 4K video."] }],
    },
    {
      id: "oyster.perspective-kit", name: "Perspective Kit", author: "oyster", hue: 280,
      glyph: "pk", cats: ["Typesetting"], version: "1.2.0", api: 1, app: "0.2.0", licence: "BSD-3-Clause",
      updated: "3 weeks ago", added: "2 months ago", downloads: "1.9k", size: "3.4 MB",
      summary: "Fits typeset signs to any plane, using OpenCV for the maths.",
      tier: "unrestricted", perms: [],
      versions: [{ v: "1.2.0", date: "28 December 2026", notes: ["Fits curved signs in four strips."] }],
    },
    {
      id: "lumen.draft-translate", name: "Draft Translate", author: "lumen", hue: 190,
      glyph: "dt", cats: ["Translation"], version: "1.4.0", api: 1, app: "0.2.0", licence: "MIT",
      updated: "Yesterday", added: "1 month ago", downloads: "1.2k", size: "72 KB",
      summary: "Drafts a translation of the selected lines for you to edit.",
      perms: [{ kind: "network", hosts: ["libretranslate.com"], reason: "Sends the selected lines’ text to LibreTranslate and gets the draft back." }],
      versions: [{ v: "1.4.0", date: "18 January 2027", notes: ["Can use DeepL with your own key."] }],
    },
    {
      id: "kaede.font-doctor", name: "Font Doctor", author: "kaede", hue: 350,
      glyph: "fd", cats: ["Styles and fonts", "Quality checks"], version: "1.1.2", api: 1, app: "0.2.0", licence: "MIT",
      updated: "1 week ago", added: "2 months ago", downloads: "2.2k", size: "58 KB",
      summary: "Finds glyphs a style’s font lacks and suggests fallbacks.",
      perms: [{ kind: "files", title: "Fonts folder", writable: false, reason: "Reads the fonts you keep for this release to check their glyphs." }],
      versions: [{ v: "1.1.2", date: "10 January 2027", notes: ["Thai and Vietnamese marks are checked."] }],
    },
    {
      id: "tsubame.reading-speed", name: "Reading Speed Guard", author: "tsubame", hue: 120,
      glyph: "rs", cats: ["Quality checks"], version: "2.0.1", api: 1, app: "0.2.0", licence: "MIT",
      updated: "4 days ago", added: "2 months ago", downloads: "3.6k", size: "41 KB",
      summary: "Flags lines over your CPS limit and suggests where to split them.",
      perms: [],
      versions: [{ v: "2.0.1", date: "14 January 2027", notes: ["Ignores \\N in the count."] }],
    },
    {
      id: "haru.batch-qc", name: "Batch QC", author: "haru", hue: 45,
      glyph: "qc", cats: ["Quality checks"], version: "0.4.0", api: 1, app: "0.2.0", licence: "MIT",
      updated: "Today", added: "Today", downloads: "84", size: "66 KB",
      summary: "Runs your checks over every open document and lists what fails.",
      perms: [{ kind: "documents.all", reason: "Checks every open document, not just the one you’re editing." }],
      versions: [{ v: "0.4.0", date: "19 January 2027", notes: ["First marketplace release."] }],
    },
    {
      id: "mirai.romaji-split", name: "Romaji Splitter", author: "mirai", hue: 165,
      glyph: "rj", cats: ["Karaoke"], version: "1.0.3", api: 1, app: "0.2.0", licence: "MIT",
      updated: "2 weeks ago", added: "2 months ago", downloads: "2.9k", size: "37 KB",
      summary: "Splits romaji into syllables and times them from the audio.",
      perms: [],
      versions: [{ v: "1.0.3", date: "5 January 2027", notes: ["Handles long vowels written ou and ō."] }],
    },
    {
      id: "nanami.chapter-export", name: "Chapter Export", author: "nanami", hue: 230,
      glyph: "ce", cats: ["Import and export"], version: "1.0.0", api: 1, app: "0.2.0", licence: "MIT",
      updated: "Today", added: "Today", downloads: "21", size: "22 KB",
      summary: "Writes Matroska chapters from comment lines marked as chapters.",
      perms: [{ kind: "files", title: "Export folder", writable: true, reason: "Writes the chapter XML where you choose." }],
      versions: [{ v: "1.0.0", date: "19 January 2027", notes: ["First release."] }],
    },
    {
      id: "haru.line-tools", name: "Line Tools", author: "haru", hue: 15,
      glyph: "lt", cats: ["Utilities"], version: "3.0.2", api: 1, app: "0.2.0", licence: "MIT",
      updated: "3 weeks ago", added: "2 months ago", downloads: "5.3k", size: "48 KB",
      summary: "Merge, split at the cursor, and move text between lines in one step.",
      perms: [],
      versions: [{ v: "3.0.2", date: "29 December 2026", notes: ["Split keeps karaoke tags on both halves."] }],
    },
  ],
};

MK.byId = (id) => MK.plugins.find((p) => p.id === id);

// A plugin icon: the author's own artwork in the real catalogue; a tinted monogram here.
MK.icon = (p, size = 48) => {
  const r = Math.round(size * 0.22);
  return `<svg class="picon" width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true">
    <defs><linearGradient id="g-${p.glyph}-${size}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${p.hue} 55% 46%)"/><stop offset="1" stop-color="hsl(${(p.hue + 30) % 360} 60% 32%)"/></linearGradient></defs>
    <rect width="48" height="48" rx="${(r * 48) / size}" fill="url(#g-${p.glyph}-${size})"/>
    <text x="24" y="31" text-anchor="middle" font-family="IBM Plex Sans, Noto Sans, sans-serif" font-weight="600" font-size="19" fill="#fff" letter-spacing="-0.5">${p.glyph}</text></svg>`;
};

// Plain-language permission lines, shared by the site and the app.
MK.permLines = (p) => {
  if (p.tier === "unrestricted") {
    return [{ sev: "danger", head: "Full access to your computer",
      text: "Runs native code with your user account’s rights. HikariSub can’t limit what it reads, writes or sends." }];
  }
  const out = p.perms.map((q) => {
    if (q.kind === "network") return { sev: "warn", head: `Connects to ${q.hosts.join(", ")}`, text: q.reason };
    if (q.kind === "files") return { sev: "warn", head: `Asks you to pick a folder: “${q.title}”${q.writable ? ", and writes there" : ", read only"}`, text: q.reason };
    if (q.kind === "documents.all") return { sev: "warn", head: "Reads and edits every open document", text: q.reason };
    return null;
  }).filter(Boolean);
  return out;
};

// Fake screenshots: a frame of video with a subtitle, drawn in SVG.
MK.shot = (n, label) => {
  const skies = [["#1d2b4a", "#c2577a"], ["#0f2a2a", "#2f7f6f"], ["#2b1d3a", "#e0a35a"]];
  const [a, b] = skies[n % 3];
  return `<svg viewBox="0 0 640 360" class="shot" role="img" aria-label="${label}">
    <defs><linearGradient id="sky${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="640" height="360" fill="url(#sky${n})"/>
    <circle cx="${470 - n * 120}" cy="110" r="44" fill="#ffe9c4" opacity=".85"/>
    <path d="M0 270 L120 200 L220 250 L330 180 L460 245 L560 205 L640 240 L640 360 L0 360Z" fill="#0b0f18" opacity=".75"/>
    ${n === 1 ? `<g transform="translate(330 150) rotate(-8)"><rect x="-70" y="-22" width="140" height="44" fill="#f4ecd8" stroke="#e6407a" stroke-width="2"/><text x="0" y="7" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="20" fill="#203040">駅前通り</text></g>
      <g fill="#e6407a"><rect x="257" y="140" width="6" height="6"/><rect x="396" y="122" width="6" height="6"/></g>` : ""}
    <text x="320" y="322" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="26" font-weight="600" stroke="#000" stroke-width="5" paint-order="stroke" fill="#fff">
      ${n === 0 ? `<tspan fill="#ffd54a">Sono toki</tspan> dake no merodi wo` : n === 1 ? "The next train leaves at nine" : `<tspan fill="#9cdbc9">Kimi</tspan> no koe ga kikoeta`}</text>
  </svg>`;
};
