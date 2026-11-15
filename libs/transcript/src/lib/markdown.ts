/**
 * Minimal Discord-flavored markdown parser producing a node tree that React
 * renders as elements. Never produces HTML strings, so message content can't
 * inject markup. Links are limited to http(s).
 */
export type MdNode =
  | { type: 'text'; value: string }
  | { type: 'bold' | 'italic' | 'underline' | 'strike' | 'spoiler'; children: MdNode[] }
  | { type: 'code'; value: string }
  | { type: 'codeblock'; lang: string | null; value: string }
  | { type: 'link'; url: string; children: MdNode[] }
  | { type: 'mention'; kind: 'user' | 'role' | 'channel'; id: string }
  | { type: 'emoji'; id: string; name: string; animated: boolean }
  | { type: 'timestamp'; unix: number; style: string }
  | { type: 'everyone'; value: '@everyone' | '@here' };

type Rule = { re: RegExp; build: (m: RegExpExecArray, depth: number) => MdNode | null };

const MAX_DEPTH = 6;
const MAX_INPUT = 8000;

export const isSafeHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

const inline = (type: 'bold' | 'italic' | 'underline' | 'strike' | 'spoiler') => (m: RegExpExecArray, depth: number) => ({
  type,
  children: parse(m[1] ?? '', depth + 1),
});

const RULES: Rule[] = [
  {
    re: /^```(?:([\w+-]{1,20})\n)?([\s\S]*?)```/,
    build: (m) => ({ type: 'codeblock', lang: m[1] ?? null, value: (m[2] ?? '').replace(/^\n/, '') }),
  },
  { re: /^`([^`\n]+)`/, build: (m) => ({ type: 'code', value: m[1] ?? '' }) },
  { re: /^\|\|([\s\S]+?)\|\|/, build: inline('spoiler') },
  { re: /^\*\*([\s\S]+?)\*\*(?!\*)/, build: inline('bold') },
  { re: /^__([\s\S]+?)__(?!_)/, build: inline('underline') },
  { re: /^\*(?=\S)([\s\S]*?\S)\*(?!\*)/, build: inline('italic') },
  { re: /^_(?=\S)([\s\S]*?\S)_(?!_)/, build: inline('italic') },
  { re: /^~~([\s\S]+?)~~/, build: inline('strike') },
  { re: /^<@!?(\d{17,20})>/, build: (m) => ({ type: 'mention', kind: 'user', id: m[1] as string }) },
  { re: /^<@&(\d{17,20})>/, build: (m) => ({ type: 'mention', kind: 'role', id: m[1] as string }) },
  { re: /^<#(\d{17,20})>/, build: (m) => ({ type: 'mention', kind: 'channel', id: m[1] as string }) },
  {
    re: /^<(a?):(\w{2,32}):(\d{17,20})>/,
    build: (m) => ({ type: 'emoji', animated: m[1] === 'a', name: m[2] as string, id: m[3] as string }),
  },
  { re: /^<t:(-?\d{1,13})(?::([tTdDfFR]))?>/, build: (m) => ({ type: 'timestamp', unix: Number(m[1]), style: m[2] ?? 'f' }) },
  { re: /^@(everyone|here)\b/, build: (m) => ({ type: 'everyone', value: `@${m[1]}` as '@everyone' | '@here' }) },
  {
    re: /^\[([^\]\n]{1,200})\]\((https?:\/\/[^\s)]{1,2000})\)/,
    build: (m, depth) =>
      isSafeHttpUrl(m[2] as string) ? { type: 'link', url: m[2] as string, children: parse(m[1] ?? '', depth + 1) } : null,
  },
  {
    re: /^<?(https?:\/\/[^\s<>]{1,2000}[^\s<>.,:;"')\]])>?/,
    build: (m) =>
      isSafeHttpUrl(m[1] as string) ? { type: 'link', url: m[1] as string, children: [{ type: 'text', value: m[1] as string }] } : null,
  },
];

/** Characters that can start a rule; everything else is fast-pathed as text. */
const TRIGGERS = new Set(['`', '|', '*', '_', '~', '<', '@', '[', 'h']);

export function parse(input: string, depth = 0): MdNode[] {
  const text = input.length > MAX_INPUT ? `${input.slice(0, MAX_INPUT)}…` : input;
  if (depth > MAX_DEPTH) return [{ type: 'text', value: text }];
  const out: MdNode[] = [];
  let buffer = '';
  const flush = () => {
    if (buffer) out.push({ type: 'text', value: buffer });
    buffer = '';
  };
  let i = 0;
  while (i < text.length) {
    const ch = text[i] as string;
    if (ch === '\\' && i + 1 < text.length && /[\\*_~`|<>[\]@#]/.test(text[i + 1] as string)) {
      buffer += text[i + 1];
      i += 2;
      continue;
    }
    let matched = false;
    if (TRIGGERS.has(ch)) {
      const rest = text.slice(i);
      for (const rule of RULES) {
        const m = rule.re.exec(rest);
        if (!m) continue;
        const node = rule.build(m, depth);
        if (!node) continue;
        flush();
        out.push(node);
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      buffer += ch;
      i++;
    }
  }
  flush();
  return out;
}
