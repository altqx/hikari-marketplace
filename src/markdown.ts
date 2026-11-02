// READMEs and changelogs are written by plugin authors: no HTML, no images, only web and mail links.
import MarkdownIt from "markdown-it";

const SAFE_LINK = /^(https?:|mailto:)/i;

const md = new MarkdownIt({ html: false, linkify: true, typographer: false });
md.validateLink = (url) => SAFE_LINK.test(url.trim());

md.core.ruler.push("demote_headings", (state) => {
  for (const t of state.tokens) {
    if (t.type === "heading_open" || t.type === "heading_close") t.tag = `h${Math.min(Number(t.tag[1]) + 1, 6)}`;
  }
});

md.core.ruler.push("task_lists", (state) => {
  for (const t of state.tokens) {
    const first = t.type === "inline" ? t.children?.[0] : undefined;
    if (first?.type !== "text") continue;
    const m = /^\[([ xX])\] /.exec(first.content);
    if (m) first.content = `${m[1] === " " ? "☐" : "☑"} ${first.content.slice(4)}`;
  }
});

const defaultLinkOpen = md.renderer.rules.link_open ?? ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts));
md.renderer.rules.link_open = (tokens, idx, opts, env, self) => {
  tokens[idx]?.attrSet("rel", "nofollow ugc noopener");
  return defaultLinkOpen(tokens, idx, opts, env, self);
};

// An image becomes a link to it, labelled with its alt text.
md.renderer.rules.image = (tokens, idx) => {
  const t = tokens[idx];
  const src = String(t?.attrGet("src") ?? "");
  const alt = md.utils.escapeHtml(t?.content || "image");
  return SAFE_LINK.test(src) ? `<a href="${md.utils.escapeHtml(src)}" rel="nofollow ugc noopener">${alt}</a>` : alt;
};

export const renderMarkdown = (text: string) => md.render(text);
