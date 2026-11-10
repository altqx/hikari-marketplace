// bun scripts/verify-live.ts <base url> [the index.json the site was built from]
import { readFileSync } from "node:fs";
import { readPublicKey, verifyLive } from "../src/verify.ts";

const [base, built] = process.argv.slice(2);
if (!base) {
  console.error("usage: bun scripts/verify-live.ts <base url> [index.json the site was built from]");
  process.exit(2);
}
const key = readPublicKey(readFileSync("keys/marketplace.pub", "utf8"));
const problems = await verifyLive(base.replace(/\/$/, ""), key, built ? readFileSync(built) : undefined);
for (const p of problems) console.error(`${base}: ${p}`);
if (problems.length) process.exit(1);
console.log(`${base}: index.json verifies against ${key.id}${built ? ", matches the build," : ""} and the site is indexable`);
