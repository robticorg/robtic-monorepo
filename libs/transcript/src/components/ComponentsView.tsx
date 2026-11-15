import type { ComponentSnapshot, TicketTranscriptDocument } from '@robo/shared';
import { colorToHex } from '../lib/format';
import { isSafeHttpUrl } from '../lib/markdown';
import { SafeImage } from './Media';
import { RichText } from './RichText';

/**
 * Discord text-display markdown is line based for headings/subtext:
 * `# `, `## `, `### ` and `-# `. Inline markdown is handled by RichText.
 */
function TextDisplay({ content, doc }: { content: string; doc: TicketTranscriptDocument }) {
  if (content.includes('```')) {
    return (
      <div className="cv2-text">
        <RichText text={content} doc={doc} />
      </div>
    );
  }
  return (
    <div className="cv2-text">
      {content.split('\n').map((line, i) => {
        const key = `${i}-${line.length}`;
        const heading = /^(#{1,3}) (.*)$/.exec(line);
        if (heading) {
          const level = heading[1]?.length ?? 1;
          return (
            <div key={key} className={`cv2-h cv2-h${level}`} dir="auto">
              <RichText text={heading[2] ?? ''} doc={doc} />
            </div>
          );
        }
        if (line.startsWith('-# ')) {
          return (
            <div key={key} className="cv2-subtext" dir="auto">
              <RichText text={line.slice(3)} doc={doc} />
            </div>
          );
        }
        if (line.startsWith('> ')) {
          return (
            <blockquote key={key} className="cv2-quote" dir="auto">
              <RichText text={line.slice(2)} doc={doc} />
            </blockquote>
          );
        }
        return (
          <div key={key} className="cv2-line" dir="auto">
            {line ? <RichText text={line} doc={doc} /> : ' '}
          </div>
        );
      })}
    </div>
  );
}

const BUTTON_STYLE_CLASS: Record<number, string> = { 1: 'primary', 2: 'secondary', 3: 'success', 4: 'danger', 5: 'link' };

function ButtonView({ c }: { c: ComponentSnapshot }) {
  const cls = `cv2-button cv2-button-${BUTTON_STYLE_CLASS[c.style ?? 2] ?? 'secondary'}`;
  const inner = (
    <>
      {c.emoji && <RichText text={c.emoji} doc={null} />}
      {c.label && <span>{c.label}</span>}
    </>
  );
  // Buttons are inert in a transcript; link buttons keep their (http/https) target.
  return c.url && isSafeHttpUrl(c.url) ? (
    <a className={cls} href={c.url} target="_blank" rel="noopener noreferrer nofollow">
      {inner}
    </a>
  ) : (
    <span className={`${cls} is-inert`} aria-disabled="true">
      {inner}
    </span>
  );
}

function Node({ c, doc }: { c: ComponentSnapshot; doc: TicketTranscriptDocument }) {
  switch (c.type) {
    case 'container':
      return (
        <div className="cv2-container" dir="ltr" style={c.accentColor ? { borderInlineStartColor: colorToHex(c.accentColor) } : undefined}>
          <ComponentsView components={c.children ?? []} doc={doc} />
        </div>
      );
    case 'text':
      return <TextDisplay content={c.content ?? ''} doc={doc} />;
    case 'section':
      return (
        <div className="cv2-section">
          <div className="cv2-section-body">
            <ComponentsView components={c.children ?? []} doc={doc} />
          </div>
          {c.accessory && (
            <div className="cv2-accessory">
              <Node c={c.accessory} doc={doc} />
            </div>
          )}
        </div>
      );
    case 'separator':
      return c.divider ? <hr className="cv2-separator" /> : <div className="cv2-spacer" />;
    case 'actionRow':
      return (
        <div className="cv2-row">
          {(c.children ?? []).map((b, i) => (
            <Node key={`${b.type}-${i}`} c={b} doc={doc} />
          ))}
        </div>
      );
    case 'button':
      return <ButtonView c={c} />;
    case 'select':
      return <span className="cv2-select is-inert">{c.label ?? '…'}</span>;
    case 'thumbnail':
      return <SafeImage className="cv2-thumbnail" src={c.mediaUrls?.[0]} alt="" />;
    case 'gallery':
      return (
        <div className="cv2-gallery">
          {(c.mediaUrls ?? []).map((u) => (
            <SafeImage key={u} src={u} alt="" />
          ))}
        </div>
      );
    case 'file':
      return c.mediaUrls?.[0] && isSafeHttpUrl(c.mediaUrls[0]) ? (
        <a className="attachment-open" href={c.mediaUrls[0]} target="_blank" rel="noopener noreferrer nofollow">
          📎
        </a>
      ) : null;
    default:
      return null;
  }
}

/** Renders Components V2 layouts (and classic action rows) captured in a transcript. */
export function ComponentsView({ components, doc }: { components: readonly ComponentSnapshot[]; doc: TicketTranscriptDocument }) {
  return (
    <>
      {components.map((c, i) => (
        <Node key={`${c.type}-${i}`} c={c} doc={doc} />
      ))}
    </>
  );
}
