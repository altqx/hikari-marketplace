// Checks what a deployed marketplace serves: the index, its minisign signature, and the site's headers.
import { createHash, createPublicKey, verify } from "node:crypto";

export interface PublicKey {
  id: string;
  key: Uint8Array;
}

const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

const line = (text: string, n: number) => (text.split(/\r?\n/)[n] ?? "").trim();
const keyId = (bytes: Uint8Array) => Buffer.from(bytes).reverse().toString("hex").toUpperCase();

const ed25519 = (key: Uint8Array, message: Uint8Array, signature: Uint8Array) =>
  verify(null, message, createPublicKey({ key: Buffer.concat([ED25519_SPKI_PREFIX, key]), format: "der", type: "spki" }), signature);

export function readPublicKey(file: string): PublicKey {
  const raw = Buffer.from(line(file, 1), "base64");
  if (raw.length !== 42 || raw.subarray(0, 2).toString() !== "Ed") throw new Error("not a minisign public key");
  return { id: keyId(raw.subarray(2, 10)), key: raw.subarray(10) };
}

/** The signature's trusted comment. Throws unless `key` signed exactly `data` and the comment. */
export function verifySignature(data: Uint8Array, signature: string, key: PublicKey): string {
  const raw = Buffer.from(line(signature, 1), "base64");
  if (raw.length !== 74) throw new Error("not a minisign signature");
  const algorithm = raw.subarray(0, 2).toString();
  if (algorithm !== "Ed" && algorithm !== "ED") throw new Error(`unknown signature algorithm ${algorithm}`);
  const id = keyId(raw.subarray(2, 10));
  if (id !== key.id) throw new Error(`signed by key ${id}, not ${key.id}`);
  const sig = raw.subarray(10);
  const message = algorithm === "ED" ? createHash("blake2b512").update(data).digest() : data;
  if (!ed25519(key.key, message, sig)) throw new Error("the signature doesn't match the index");
  const trusted = line(signature, 2);
  if (!trusted.startsWith("trusted comment: ")) throw new Error("the signature has no trusted comment");
  const comment = trusted.slice("trusted comment: ".length);
  if (!ed25519(key.key, Buffer.concat([sig, Buffer.from(comment)]), Buffer.from(line(signature, 3), "base64"))) {
    throw new Error("the trusted comment's signature doesn't match");
  }
  return comment;
}

type Fetch = (url: string) => Promise<Response>;

/** Everything wrong with what `base` serves; empty when the live site is right. */
export async function verifyLive(base: string, key: PublicKey, expected?: Uint8Array, get: Fetch = fetch): Promise<string[]> {
  const problems: string[] = [];
  const index = await get(`${base}/index.json`);
  const signature = await get(`${base}/index.json.minisig`);
  if (!index.ok || !signature.ok) {
    problems.push(`index.json answered ${index.status} and index.json.minisig ${signature.status}`);
  } else {
    if (!index.headers.get("content-type")?.startsWith("application/json")) {
      problems.push(`index.json is served as ${index.headers.get("content-type")}`);
    }
    const data = new Uint8Array(await index.arrayBuffer());
    try {
      verifySignature(data, await signature.text(), key);
    } catch (e) {
      problems.push(`index.json: ${(e as Error).message}`);
    }
    if (expected && !Buffer.from(data).equals(Buffer.from(expected))) problems.push("index.json isn't the index the site was built from");
  }
  const home = await get(`${base}/`);
  if (!home.ok) problems.push(`the home page answered ${home.status}`);
  if (home.headers.get("x-robots-tag")) problems.push(`the home page still sends X-Robots-Tag: ${home.headers.get("x-robots-tag")}`);
  if (!home.headers.get("content-security-policy")?.includes("default-src 'self'")) problems.push("the home page has no content security policy");
  return problems;
}
