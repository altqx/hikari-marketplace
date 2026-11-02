// Every string from the index goes through `html`, which escapes anything that isn't already Raw.
export class Raw {
  constructor(readonly value: string) {}
  toString() {
    return this.value;
  }
}

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPES[c] as string);

type Value = Raw | string | number | boolean | null | undefined | Value[];

const render = (v: Value): string => {
  if (v instanceof Raw) return v.value;
  if (Array.isArray(v)) return v.map(render).join("");
  if (v === null || v === undefined || v === false || v === true) return "";
  return escape(String(v));
};

export const html = (strings: TemplateStringsArray, ...values: Value[]) =>
  new Raw(strings.reduce((out, s, i) => out + s + (i < values.length ? render(values[i] as Value) : ""), ""));

export const raw = (s: string) => new Raw(s);
