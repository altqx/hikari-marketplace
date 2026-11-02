// Renders each sheet to png/ with one headless Chromium.
// Usage: node tools/shoot.mjs <port> <playwright-core dir> [name-filter]
import { createRequire } from "node:module";
const [port, pwDir, filter = ""] = process.argv.slice(2);
const { chromium } = createRequire(import.meta.url)(pwDir);

const web = ["light", "dark"].flatMap((t) => [
  [`web-home-${t}`, `sheets/web.html?page=home&theme=${t}`],
  [`web-plugin-${t}`, `sheets/web.html?page=plugin&theme=${t}&phone=id%3Doyster.perspective-kit&pcap=Unrestricted%20plugin`],
  [`web-author-${t}`, `sheets/web.html?page=author&theme=${t}`],
  [`web-submit-${t}`, `sheets/web.html?page=submit&theme=${t}`],
]);
const app = ["light", "dark", "hcb", "hcw"].flatMap((t) =>
  ["browse", "install", "updates", "notices"].map((s) => [`app-${s}-${t}`, `sheets/app.html?sheet=${s}&theme=${t}`]));

const browser = await chromium.launch({ args: ["--disable-gpu", "--font-render-hinting=none"] });
const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });
for (const [name, url] of [...web, ...app].filter(([n]) => n.includes(filter))) {
  await page.goto(`http://127.0.0.1:${port}/${url}`);
  await page.waitForSelector("body[data-ready]", { timeout: 15000 });
  await page.screenshot({ path: `png/${name}.png`, fullPage: true });
  console.log(name);
}
await browser.close();
