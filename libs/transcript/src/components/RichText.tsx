import type { TicketTranscriptDocument } from '@robo/shared';
import { type ReactNode, useMemo, useState } from 'react';
import { customEmojiUrl, displayName, formatDiscordTimestamp, userOf } from '../lib/format';
import { useLocale } from '../lib/i18n';
import { type MdNode, parse } from '../lib/markdown';
import { useStaticRender } from '../lib/render-mode';

function Spoiler({ children }: { children: ReactNode }) {
  const isStatic = useStaticRender();
  const [shownState, setShown] = useState(false);
  const shown = isStatic || shownState;
  return (
    <button type="button" className={`md-spoiler${shown ? ' is-shown' : ''}`} onClick={() => setShown(true)} aria-pressed={shown}>
      {children}
    </button>
  );
}

function RenderNodes({ nodes, doc }: { nodes: MdNode[]; doc: TicketTranscriptDocument | null }) {
  const { locale, tr } = useLocale();
  return (
    <>
      {nodes.map((node, i) => {
        const key = `${node.type}-${i}`;
        switch (node.type) {
          case 'text':
            return <span key={key}>{node.value}</span>;
          case 'bold':
            return (
              <strong key={key}>
                <RenderNodes nodes={node.children} doc={doc} />
              </strong>
            );
          case 'italic':
            return (
              <em key={key}>
                <RenderNodes nodes={node.children} doc={doc} />
              </em>
            );
          case 'underline':
            return (
              <u key={key}>
                <RenderNodes nodes={node.children} doc={doc} />
              </u>
            );
          case 'strike':
            return (
              <s key={key}>
                <RenderNodes nodes={node.children} doc={doc} />
              </s>
            );
          case 'spoiler':
            return (
              <Spoiler key={key}>
                <RenderNodes nodes={node.children} doc={doc} />
              </Spoiler>
            );
          case 'code':
            return (
              <code key={key} className="md-code" dir="ltr">
                {node.value}
              </code>
            );
          case 'codeblock':
            return (
              <pre key={key} className="md-codeblock" dir="ltr">
                <code>{node.value}</code>
              </pre>
            );
          case 'link':
            return (
              <a key={key} href={node.url} target="_blank" rel="noopener noreferrer nofollow" className="md-link" dir="ltr">
                <RenderNodes nodes={node.children} doc={doc} />
              </a>
            );
          case 'mention': {
            if (node.kind === 'user') {
              const user = doc ? userOf(doc, node.id) : null;
              return (
                <span key={key} className="md-mention">
                  @{displayName(user, tr('web.transcript.unknownUser'))}
                </span>
              );
            }
            return (
              <span key={key} className="md-mention" dir="ltr">
                {node.kind === 'role' ? '@role' : '#channel'}
              </span>
            );
          }
          case 'emoji':
            return (
              <img
                key={key}
                className="md-emoji"
                src={customEmojiUrl(node.id, node.animated)}
                alt={`:${node.name}:`}
                title={`:${node.name}:`}
                loading="lazy"
              />
            );
          case 'timestamp':
            return (
              <time key={key} className="md-time">
                {formatDiscordTimestamp(node.unix, node.style, locale)}
              </time>
            );
          case 'everyone':
            return (
              <span key={key} className="md-mention">
                {node.value}
              </span>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

/** Safe rendering of Discord markdown (no HTML injection, http(s) links only). */
export function RichText({ text, doc }: { text: string; doc: TicketTranscriptDocument | null }) {
  const nodes = useMemo(() => parse(text), [text]);
  return (
    <span className="rich-text" dir="auto">
      <RenderNodes nodes={nodes} doc={doc} />
    </span>
  );
}
