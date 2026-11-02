import { expect, test } from "bun:test";
import { escape, html } from "./html.ts";
import { renderMarkdown } from "./markdown.ts";

test("raw HTML in a README is shown as text", () => {
  const out = renderMarkdown('<script>alert(1)</script><img src=x onerror="alert(2)">');
  expect(out).not.toContain("<script");
  expect(out).not.toContain("<img");
  expect(out).toContain("&lt;script&gt;");
});

test("only web and mail links survive", () => {
  const out = renderMarkdown("[a](javascript:alert(1)) [b](data:text/html,x) [c](docs/x.md) [d](https://example.com) [e](mailto:a@b.c)");
  expect(out).not.toContain('href="javascript:');
  expect(out).toContain("[a](javascript:alert(1))");
  expect(out).not.toContain('href="data:');
  expect(out).not.toContain('href="docs/');
  expect(out).toContain('<a href="https://example.com" rel="nofollow ugc noopener">d</a>');
  expect(out).toContain('href="mailto:a@b.c"');
});

test("images become links, and headings drop a level", () => {
  expect(renderMarkdown("![shot](https://example.com/a.png)")).toContain('<a href="https://example.com/a.png" rel="nofollow ugc noopener">shot</a>');
  expect(renderMarkdown("![x](javascript:alert(1))")).not.toContain("<a");
  expect(renderMarkdown("# One\n\n###### Six")).toBe("<h2>One</h2>\n<h6>Six</h6>\n");
});

test("task lists", () => {
  expect(renderMarkdown("- [x] done\n- [ ] not yet")).toContain("<li>☑ done</li>\n<li>☐ not yet</li>");
});

test("html escapes everything that isn't Raw", () => {
  const evil = `"><script>x</script>'`;
  expect(html`<a title="${evil}">${evil}</a>`.value).toBe(`<a title="${escape(evil)}">${escape(evil)}</a>`);
  expect(html`${[html`<b>${"<i>"}</b>`, "&"]}`.value).toBe("<b>&lt;i&gt;</b>&amp;");
  expect(html`${undefined}${null}${false}${0}`.value).toBe("0");
});
