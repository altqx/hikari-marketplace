# hikari-marketplace

The website for HikariSub's plugin marketplace: a static site built from the registry's signed `index.json`
([altqx/hikari-plugins](https://github.com/altqx/hikari-plugins)) and served by a Cloudflare Worker.

The preview, <https://hikari-marketplace-preview.altq.workers.dev>, is built from an invented test index and kept
out of search engines. marketplace.hikarisub.org is built from the registry's signed index and goes live only when the
owner says so.

```sh
bun install
bun run test-index   # writes fixtures/test-index from scripts/test-index.ts
bun run build        # dist/ from $INDEX_DIR (default fixtures/test-index)
bun run test         # unit tests
bun run test:e2e     # Playwright against wrangler dev
bunx wrangler dev    # http://127.0.0.1:8787
```

- `src/build.ts` writes every page, `search.json`, and copies the index's `p/` media.
- `src/pages.ts` holds the templates. Every string from the index goes through the escaping `html` tag.
- `src/markdown.ts` renders READMEs and changelogs with raw HTML turned off. Images become links, and only https,
  http and mailto links are kept.
- `src/worker.ts` serves `/p/*` and `/index.json` from the `PACKAGES` R2 bucket when one is bound. Author media is
  always sent with a sandboxing CSP. The preview has no bucket bound.
- CI deploys the preview from `main` with the `CLOUDFLARE_API_TOKEN` secret and the `CLOUDFLARE_ACCOUNT_ID`
  variable, building with `NOINDEX=1`.
- `deploy-production.yml` deploys `env.production` from `main`, in the `production` environment. It runs by hand,
  or on the `index-published` dispatch that hikari-plugins' Publish sends when it uploads a new index:
  1. It fetches `index.json` and its `.minisig` from the `hikari-marketplace` R2 bucket.
  2. It checks them against `keys/marketplace.pub` (EF622DD4D472E463), then builds from them.
  3. After the deploy, `scripts/verify-live.ts` checks that the live index verifies, that it's the one the site was
     built from, and that the site has its CSP and no `X-Robots-Tag`.

The look follows the approved mockups on the `mockups` branch. Fonts: IBM Plex (OFL, `public/fonts/OFL.txt`).
