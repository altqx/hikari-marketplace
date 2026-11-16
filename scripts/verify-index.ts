// bun scripts/verify-index.ts <folder with index.json and index.json.minisig>
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readPublicKey, verifySignature } from "../src/verify.ts";

const dir = process.argv[2];
if (!dir) {
  console.error("usage: bun scripts/verify-index.ts <folder with index.json and index.json.minisig>");
  process.exit(2);
}
const key = readPublicKey(readFileSync("keys/marketplace.pub", "utf8"));
const comment = verifySignature(readFileSync(join(dir, "index.json")), readFileSync(join(dir, "index.json.minisig"), "utf8"), key);
console.log(`${dir}/index.json verifies against ${key.id} (${comment})`);
