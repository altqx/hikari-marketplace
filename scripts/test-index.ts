// Writes fixtures/test-index: an index.json in the registry's format, with media and READMEs,
// for the preview and the tests. Every plugin, author and number in it is invented.
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { OFFICIAL_KEY } from "../src/model.ts";

const OUT = "fixtures/test-index";
const BASE = "https://marketplace.hikarisub.org";

type Perms = Record<string, unknown>;
interface Sample {
  id: string;
  name: string;
  authorName: string;
  hue: number;
  cats: string[];
  summary: string;
  licence: string;
  api?: number;
  tier?: "unrestricted";
  perms?: Perms;
  shots?: number[];
  revoked?: string;
  versions: { v: string; date: string; notes: string; revoked?: string; perms?: Perms }[];
  readme?: string;
  glyph?: string;
}

const net = (hosts: string[], reason: string) => ({ network: { hosts, reason } });
const folder = (id: string, title: string, reason: string, writable = false) => ({
  files: [{ id, title, reason, ...(writable ? { writable } : {}) }],
});

const samples: Sample[] = [
  {
    id: "mirai.karaoke-flow", name: "Karaoke Flow", authorName: "Mirai Kobayashi", hue: 158, cats: ["Karaoke"],
    summary: "Syllable effects from presets, previewed on the video as you tweak them.", licence: "MIT", shots: [0, 2],
    versions: [
      { v: "2.3.1", date: "2027-01-16", notes: "- Fixed the preview lagging one frame behind on 23.976 fps video.\n- Grow and Wipe presets keep \\an from the line’s style." },
      { v: "2.3.0", date: "2027-01-04", notes: "- New Ripple preset.\n- Presets can be saved to a Style catalogue." },
      { v: "2.2.0", date: "2026-12-12", notes: "- The panel remembers the last preset per style." },
      { v: "2.1.0", date: "2026-11-28", notes: "- First marketplace release." },
    ],
  },
  {
    id: "mirai.romaji-split", name: "Romaji Splitter", authorName: "Mirai Kobayashi", hue: 165, cats: ["Karaoke"],
    summary: "Splits romaji into syllables and times them from the audio.", licence: "MIT",
    versions: [{ v: "1.0.3", date: "2027-01-05", notes: "- Handles long vowels written ou and ō." }],
  },
  {
    id: "tsubame.scene-snap", name: "Scene Snap", authorName: "Tsubame Subs", hue: 210, cats: ["Timing"],
    summary: "Snaps starts and ends to scene changes, with lead-in rules per style.", licence: "GPL-3.0-or-later",
    versions: [{ v: "1.6.0", date: "2027-01-13", notes: "- Per-style rules." }, { v: "1.5.0", date: "2026-11-20", notes: "- First release." }],
  },
  {
    id: "tsubame.reading-speed", name: "Reading Speed Guard", authorName: "Tsubame Subs", hue: 120, cats: ["Quality checks"],
    summary: "Flags lines over your CPS limit and suggests where to split them.", licence: "MIT",
    versions: [{ v: "2.0.1", date: "2027-01-14", notes: "- Ignores \\N in the count." }],
  },
  {
    id: "nanami.sign-tracker", name: "Sign Tracker", authorName: "Nanami Ts", hue: 32, cats: ["Typesetting", "Video and audio"],
    summary: "Tracks a sign through a shot and writes \\pos and \\frz for every frame.", licence: "MIT", api: 1, shots: [1, 0, 2],
    perms: folder("tracking", "Tracking data folder", "Saves tracking data next to your project so a shot can be retracked later.", true),
    versions: [
      { v: "0.9.4", date: "2027-01-17", notes: "- Faster tracking on 4K video.\n- Corners snap to the sign’s edges when Shift is held." },
      { v: "0.9.3", date: "2027-01-09", notes: "- Restores 0.9.1’s tracker after the 0.9.2 crash." },
      { v: "0.9.2", date: "2027-01-08", notes: "- New smoothing setting.", revoked: "Crashed the plugin helper on variable-frame-rate video." },
      { v: "0.9.1", date: "2026-12-20", notes: "- Splits the track at scene cuts." },
    ],
    readme: `# Sign Tracker

Track a sign through a shot and turn the motion into tags. Pick the sign’s corners on the first frame, run the tracker, and Sign Tracker writes a line per frame with \`\\pos\`, \`\\frz\` and \`\\fscx\`/\`\\fscy\`.

## Use it

1. Select the typeset line and open **Sign Tracker** from the Video panel’s tools.
2. Drag the four corners onto the sign.
3. Press **Track**. Lines appear in the Grid as one undo step.

## Settings

| Setting | Default |
|---|---|
| Search radius | 24 px |
| Smoothing | 0.35 |
| Split on cut | yes |

- [x] Works on 4K
- [ ] Works on interlaced video

![Tracking a sign](https://example.com/shot.png) and [the source](https://github.com/nanami/sign-tracker).

<script>alert("readme")</script><img src=x onerror="alert('img')">

[a script link](javascript:alert(1)) and [a relative link](docs/more.md).
`,
  },
  {
    id: "oyster.perspective-kit", name: "Perspective Kit", authorName: "Oyster", hue: 280, cats: ["Typesetting"],
    summary: "Fits typeset signs to any plane, using OpenCV for the maths.", licence: "BSD-3-Clause", tier: "unrestricted", shots: [1],
    versions: [{ v: "1.2.0", date: "2026-12-28", notes: "- Fits curved signs in four strips." }],
  },
  {
    id: "lumen.draft-translate", name: "Draft Translate", authorName: "Lumen Fansubs", hue: 190, cats: ["Translation"],
    summary: "Drafts a translation of the selected lines for you to edit.", licence: "MIT",
    perms: net(["libretranslate.com"], "Sends the selected lines’ text to LibreTranslate and gets the draft back."),
    versions: [{ v: "1.4.0", date: "2027-01-18", notes: "- Can use DeepL with your own key." }],
  },
  {
    id: "kaede.font-doctor", name: "Font Doctor", authorName: "Kaede Arai", hue: 350, cats: ["Styles and fonts", "Quality checks"],
    summary: "Finds glyphs a style’s font lacks and suggests fallbacks.", licence: "MIT",
    perms: folder("fonts", "Fonts folder", "Reads the fonts you keep for this release to check their glyphs."),
    versions: [{ v: "1.1.2", date: "2027-01-10", notes: "- Thai and Vietnamese marks are checked." }],
  },
  {
    id: "haru.batch-qc", name: "Batch QC", authorName: "Haru", hue: 45, cats: ["Quality checks"],
    summary: "Runs your checks over every open document and lists what fails.", licence: "MIT",
    perms: { "documents.all": "Checks every open document, not just the one you’re editing." },
    versions: [{ v: "0.4.0", date: "2027-01-19", notes: "- First marketplace release." }],
  },
  {
    id: "haru.line-tools", name: "Line Tools", authorName: "Haru", hue: 15, cats: ["Utilities"],
    summary: "Merge, split at the cursor, and move text between lines in one step.", licence: "MIT",
    versions: [{ v: "3.0.2", date: "2026-12-29", notes: "- Split keeps karaoke tags on both halves." }],
  },
  {
    id: "nanami.chapter-export", name: "Chapter Export", authorName: "Nanami Ts", hue: 230, cats: ["Import and export"],
    summary: "Writes Matroska chapters from comment lines marked as chapters.", licence: "MIT",
    perms: folder("export", "Export folder", "Writes the chapter XML where you choose.", true),
    versions: [{ v: "1.0.0", date: "2027-01-19", notes: "- First release." }],
  },
  {
    id: "hikarisub.macro-chains", name: "Macro Chains", authorName: "altqx", hue: 166, cats: ["Utilities"],
    summary: "Records a run of macros once and replays it as one, with a single merged dialog.", licence: "MIT",
    glyph: '<g fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17h10M12 24h16M12 31h10"/><path d="M30 13l7 7-7 7"/></g>',
    versions: [{ v: "1.0.0", date: "2027-01-15", notes: "- First release." }],
  },
  {
    id: "rogue.subtitle-sync", name: "Subtitle Sync Cloud", authorName: "Rogue", hue: 0, cats: ["Utilities"],
    summary: "Backs up your subtitles to the cloud.", licence: "MIT",
    revoked: "Uploaded subtitle files to a host its manifest doesn’t declare.",
    perms: net(["sync.rogue.example"], "Backs up your files."),
    versions: [{ v: "1.0.0", date: "2027-01-02", notes: "- First release." }],
  },
];

const downloads: Record<string, number> = {
  "mirai.karaoke-flow": 4812, "mirai.romaji-split": 2930, "tsubame.scene-snap": 3104, "tsubame.reading-speed": 3611,
  "nanami.sign-tracker": 2577, "oyster.perspective-kit": 1904, "lumen.draft-translate": 1213, "kaede.font-doctor": 2208,
  "haru.batch-qc": 84, "hikarisub.macro-chains": 1450, "haru.line-tools": 5321, "nanami.chapter-export": 21, "rogue.subtitle-sync": 340,
};

// Fake but well-formed minisign public keys, one per author.
const keyFor = (author: string) => {
  const raw = new Uint8Array(42);
  raw.set([0x45, 0x64]);
  for (let i = 2; i < 42; i++) raw[i] = (author.charCodeAt(i % author.length) * (i + 7)) & 0xff;
  return Buffer.from(raw).toString("base64");
};

const icon = (s: Sample) => {
  const glyph = s.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toLowerCase();
  const mark = s.glyph ?? `<text x="24" y="31" text-anchor="middle" font-family="IBM Plex Sans, sans-serif" font-weight="600" font-size="19" fill="#fff">${glyph}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${s.hue} 55% 46%)"/><stop offset="1" stop-color="hsl(${(s.hue + 30) % 360} 60% 32%)"/></linearGradient></defs><rect width="48" height="48" rx="10.5" fill="url(#g)"/>${mark}</svg>\n`;
};

const captions = ["The preset panel next to the video.", "The tracked corners on a station sign.", "A karaoke line over the audio."];

rmSync(OUT, { recursive: true, force: true });
const plugins = samples.map((s) => {
  const author = s.id.split(".")[0] as string;
  const versions = s.versions.map((ver, n) => {
    const dir = `p/${s.id}/${ver.v}`;
    mkdirSync(join(OUT, dir), { recursive: true });
    writeFileSync(join(OUT, dir, "README.md"), s.readme ?? `# ${s.name}\n\n${s.summary}\n\nOpen **${s.name}** from the Plugins menu.\n`);
    const out: Record<string, unknown> = {
      version: ver.v, api: s.api ?? 1, tier: s.tier ?? "restricted", name: s.name, summary: s.summary,
      description: s.summary, license: s.licence, authors: [s.authorName], permissions: ver.perms ?? s.perms ?? {},
      url: `${BASE}/${dir}.hikariplugin`, sha256: "0".repeat(56) + n.toString(16).padStart(8, "0"),
      size: 40000 + n * 1000, published: `${ver.date}T09:00:00Z`, changelog: ver.notes, readme: `${BASE}/${dir}/README.md`,
    };
    {
      writeFileSync(join(OUT, dir, "icon.svg"), icon(s));
      out.icon = `${BASE}/${dir}/icon.svg`;
    }
    if (s.shots) {
      out.screenshots = s.shots.map((shot, i) => {
        copyFileSync(`fixtures/screens/shot-${shot}.png`, join(OUT, dir, `screenshot-${i + 1}.png`));
        return { url: `${BASE}/${dir}/screenshot-${i + 1}.png`, caption: captions[shot], width: 1280, height: 720 };
      });
    }
    if (ver.revoked) out.revoked = { reason: ver.revoked, date: ver.date };
    return out;
  });
  return {
    id: s.id, author, authorName: s.authorName, repo: `https://github.com/${author}/${s.id.split(".")[1]}`,
    publicKey: author === "hikarisub" ? OFFICIAL_KEY : keyFor(author), categories: s.cats, ...(s.revoked ? { revoked: { reason: s.revoked, date: "2027-01-20" } } : {}),
    versions,
  };
});

const index = {
  format: 1, serial: 1, generated: "2027-01-20T10:00:00Z", apiVersions: { "1": "0.2.0", "2": "0.3.0" }, featured: [],
  plugins: plugins.sort((a, b) => a.id.localeCompare(b.id)),
};
writeFileSync(join(OUT, "index.json"), `${JSON.stringify(index, null, 1)}\n`);
writeFileSync(join(OUT, "downloads.json"), `${JSON.stringify(downloads, null, 1)}\n`);
console.log(`${plugins.length} plugins in ${OUT}`);
