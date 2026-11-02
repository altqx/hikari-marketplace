// Serves /p/* and /index.json(.minisig) from the PACKAGES bucket when it's bound; everything else is static assets.
export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  PACKAGES?: R2Like;
}

interface R2Like {
  get(key: string): Promise<{ body: ReadableStream; httpEtag: string; size: number } | null>;
}

// Author-supplied media must never run as a page on this origin.
const MEDIA_HEADERS = {
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  "X-Content-Type-Options": "nosniff",
};

const TYPES: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", svg: "image/svg+xml", md: "text/markdown; charset=utf-8",
  hikariplugin: "application/zip", json: "application/json", minisig: "text/plain; charset=utf-8",
};

export const contentType = (key: string) => TYPES[key.slice(key.lastIndexOf(".") + 1).toLowerCase()] ?? "application/octet-stream";

// Published files never change; the index does, and must be fetched fresh.
const cacheControl = (key: string) => (key.startsWith("p/") ? "public, max-age=31536000, immutable" : "public, max-age=60");

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const key = decodeURIComponent(url.pathname.slice(1));
    const isData = key.startsWith("p/") || key === "index.json" || key === "index.json.minisig";
    if (!isData || key.includes("..")) return env.ASSETS.fetch(request);
    if (request.method !== "GET" && request.method !== "HEAD") return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });

    if (!env.PACKAGES) {
      const res = await env.ASSETS.fetch(request);
      const out = new Response(res.body, res);
      for (const [k, v] of Object.entries(MEDIA_HEADERS)) out.headers.set(k, v);
      return out;
    }
    const object = await env.PACKAGES.get(key);
    if (!object) return env.ASSETS.fetch(request);
    const headers = new Headers({ ...MEDIA_HEADERS, "Content-Type": contentType(key), "Cache-Control": cacheControl(key),
      ETag: object.httpEtag, "Content-Length": String(object.size), "Access-Control-Allow-Origin": "*" });
    if (key.startsWith("p/") && key.endsWith(".hikariplugin")) {
      headers.set("Content-Disposition", `attachment; filename="${key.split("/")[1]}-${key.split("/")[2]}"`);
    }
    return new Response(request.method === "HEAD" ? null : object.body, { headers });
  },
};
