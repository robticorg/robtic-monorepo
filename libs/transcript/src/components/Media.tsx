import type { AttachmentSnapshot, EmbedSummary, TicketTranscriptDocument } from '@robo/shared';
import { Pause, Play } from 'lucide-react';
import { type MouseEvent, useRef, useState } from 'react';
import { colorToHex, defaultAvatar, formatBytes, formatDateTime } from '../lib/format';
import { useLocale } from '../lib/i18n';
import { isSafeHttpUrl } from '../lib/markdown';
import { useStaticRender } from '../lib/render-mode';
import { useImageViewer } from './ImageViewer';
import { RichText } from './RichText';

/** Image that degrades gracefully: Discord CDN attachment links expire. */
export function SafeImage({
  src,
  alt,
  className,
  fallback,
  zoomable = false,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: string;
  /** Click opens the full-size viewer (in the HTML export: opens the original). */
  zoomable?: boolean;
}) {
  const { tr } = useLocale();
  const openViewer = useImageViewer();
  const [failed, setFailed] = useState(false);
  if (!src || !isSafeHttpUrl(src) || failed) {
    if (fallback) return <img className={className} src={fallback} alt={alt} />;
    return <div className={`media-missing ${className ?? ''}`}>{tr('web.transcript.imageExpired')}</div>;
  }
  const img = <img className={className} src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />;
  if (!zoomable) return img;
  if (openViewer) {
    return (
      <button type="button" className="zoomable" onClick={() => openViewer(src, alt)} aria-label={alt || tr('web.transcript.openOriginal')}>
        {img}
      </button>
    );
  }
  return (
    <a className="zoomable" href={src} target="_blank" rel="noopener noreferrer nofollow">
      {img}
    </a>
  );
}

const AUDIO_EXT = /\.(ogg|oga|opus|mp3|wav|m4a|aac|flac)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v|mkv)$/i;
const mediaKind = (a: AttachmentSnapshot): 'audio' | 'video' | null => {
  const type = a.contentType?.toLowerCase() ?? '';
  if (a.isVoiceMessage || type.startsWith('audio/') || (!type && AUDIO_EXT.test(a.filename))) return 'audio';
  if (type.startsWith('video/') || (!type && VIDEO_EXT.test(a.filename))) return 'video';
  return null;
};

/** Discord voice-message waveform: base64 bytes (0-255), one per bar. */
function waveformBars(waveform: string | null | undefined, bars = 48): number[] {
  if (!waveform) return [];
  try {
    const bytes = Uint8Array.from(atob(waveform), (c) => c.charCodeAt(0));
    if (bytes.length === 0) return [];
    const step = bytes.length / bars;
    return Array.from({ length: Math.min(bars, bytes.length) }, (_, i) => (bytes[Math.floor(i * step)] ?? 0) / 255);
  } catch {
    return [];
  }
}

const formatDuration = (seconds: number | null) => {
  if (seconds === null || !Number.isFinite(seconds)) return '';
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Flat bars used when Discord sent no waveform (regular audio files). */
const FLAT_BARS = Array.from({ length: 40 }, () => 0.35);

/**
 * Discord-style audio player: play button, waveform progress and time. No
 * title, icon or download menu (custom controls; the HTML export uses a
 * native player with download disabled since it has no scripts).
 */
function AudioAttachment({ attachment }: { attachment: AttachmentSnapshot }) {
  const { tr } = useLocale();
  const isStatic = useStaticRender();
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(attachment.durationSeconds ?? 0);
  const waveform = waveformBars(attachment.waveform);
  const bars = waveform.length > 0 ? waveform : FLAT_BARS;
  const progress = duration > 0 ? Math.min(1, current / duration) : 0;

  if (isStatic) {
    return (
      <div className="audio-player">
        {/* biome-ignore lint/a11y/useMediaCaption: user-uploaded audio has no captions */}
        <audio controls controlsList="nodownload" preload="none" src={attachment.url} />
      </div>
    );
  }

  const toggle = () => {
    const audio = ref.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => setPlaying(false));
    else audio.pause();
  };
  const seek = (e: MouseEvent<HTMLButtonElement>) => {
    const audio = ref.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration;
    setCurrent(audio.currentTime);
  };

  return (
    <div className="audio-player">
      {/* biome-ignore lint/a11y/useMediaCaption: user-uploaded audio has no captions */}
      <audio
        ref={ref}
        preload="none"
        src={attachment.url}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrent(0);
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setDuration(e.currentTarget.duration)}
      />
      <button
        type="button"
        className="audio-play"
        onClick={toggle}
        aria-label={playing ? tr('web.transcript.pause') : tr('web.transcript.play')}
      >
        {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
      </button>
      <button type="button" className="waveform" onClick={seek} aria-label={tr('web.transcript.seek')}>
        {bars.map((v, i) => (
          <span
            key={`b${i}`}
            className={i / bars.length < progress ? 'is-played' : undefined}
            style={{ height: `${Math.max(12, v * 100)}%` }}
          />
        ))}
      </button>
      <span className="audio-time">{formatDuration(playing || current > 0 ? current : duration) || '0:00'}</span>
    </div>
  );
}

function VideoAttachment({ attachment }: { attachment: AttachmentSnapshot }) {
  return (
    <div className="attachment-video">
      {/* biome-ignore lint/a11y/useMediaCaption: user-uploaded video has no captions */}
      <video controls preload="metadata" src={attachment.url} width={attachment.width ?? undefined} />
    </div>
  );
}

export function Avatar({ url, userId, size = 40 }: { url: string | null | undefined; userId: string | null; size?: number }) {
  return <SafeImage className="avatar" src={url ?? defaultAvatar(userId)} alt="" fallback={defaultAvatar(userId)} key={`${url}-${size}`} />;
}

export function EmbedView({ embed, doc }: { embed: EmbedSummary; doc: TicketTranscriptDocument }) {
  const { locale } = useLocale();
  const fields = embed.fields ?? [];
  return (
    // Always LTR (like Discord): Arabic text keeps its own direction per line, the layout never flips.
    <div className="embed" dir="ltr" style={{ borderInlineStartColor: colorToHex(embed.color) }}>
      <div className="embed-body">
        {embed.author && (
          <div className="embed-author">
            {embed.author.iconUrl && <SafeImage className="embed-author-icon" src={embed.author.iconUrl} alt="" />}
            <span>{embed.author.name}</span>
          </div>
        )}
        {embed.title &&
          (embed.url && isSafeHttpUrl(embed.url) ? (
            <a className="embed-title" href={embed.url} target="_blank" rel="noopener noreferrer nofollow">
              {embed.title}
            </a>
          ) : (
            <div className="embed-title">{embed.title}</div>
          ))}
        {embed.description && (
          <div className="embed-description">
            <RichText text={embed.description} doc={doc} />
          </div>
        )}
        {fields.length > 0 && (
          <div className="embed-fields">
            {fields.map((f, i) => (
              <div key={`${f.name}-${i}`} className={`embed-field${f.inline ? ' is-inline' : ''}`}>
                <div className="embed-field-name">
                  <RichText text={f.name} doc={doc} />
                </div>
                <div className="embed-field-value">
                  <RichText text={f.value} doc={doc} />
                </div>
              </div>
            ))}
          </div>
        )}
        {embed.imageUrl && <SafeImage className="embed-image" src={embed.imageUrl} alt={embed.title ?? ''} zoomable />}
        {(embed.footer || embed.timestamp) && (
          <div className="embed-footer">
            {embed.footer?.iconUrl && <SafeImage className="embed-footer-icon" src={embed.footer.iconUrl} alt="" />}
            <span>
              {embed.footer?.text && <bdi>{embed.footer.text}</bdi>}
              {embed.footer && embed.timestamp ? ' • ' : ''}
              {embed.timestamp && <bdi>{formatDateTime(embed.timestamp, locale)}</bdi>}
            </span>
          </div>
        )}
        {/* Embeds captured before full snapshots only have summary flags. */}
        {embed.description === undefined && embed.hasImage && !embed.imageUrl && <div className="media-missing">🖼</div>}
      </div>
      {embed.thumbnailUrl && <SafeImage className="embed-thumbnail" src={embed.thumbnailUrl} alt="" zoomable />}
    </div>
  );
}

export function AttachmentView({ attachment }: { attachment: AttachmentSnapshot }) {
  const { tr, locale } = useLocale();
  const isStatic = useStaticRender();
  const [revealedState, setRevealed] = useState(!attachment.spoiler);
  const revealed = isStatic || revealedState;
  const url = attachment.url;
  if (attachment.isImage) {
    return (
      <figure className={`attachment-image${revealed ? '' : ' is-spoiler'}`}>
        <SafeImage src={url} alt={attachment.description ?? attachment.filename} zoomable={revealed} />
        {!revealed && (
          <button type="button" className="spoiler-cover" onClick={() => setRevealed(true)}>
            {tr('web.transcript.spoiler')}
          </button>
        )}
        {attachment.description && <figcaption>{attachment.description}</figcaption>}
      </figure>
    );
  }
  if (isSafeHttpUrl(url)) {
    const kind = mediaKind(attachment);
    if (kind === 'audio') return <AudioAttachment attachment={attachment} />;
    if (kind === 'video') return <VideoAttachment attachment={attachment} />;
  }
  return (
    <div className="attachment-file">
      <span className="attachment-icon" aria-hidden>
        📎
      </span>
      <div className="attachment-meta">
        <span className="attachment-name" dir="ltr">
          {attachment.filename}
        </span>
        <span className="attachment-size">
          {formatBytes(attachment.size, locale)}
          {attachment.contentType ? ` · ${attachment.contentType}` : ''}
        </span>
      </div>
      {isSafeHttpUrl(url) && (
        <a className="attachment-open" href={url} target="_blank" rel="noopener noreferrer nofollow">
          {tr('web.transcript.download')}
        </a>
      )}
    </div>
  );
}

/** Sticker image (PNG/APNG/GIF). Lottie stickers cannot render as an image: name only. */
export function StickerView({ sticker }: { sticker: { id: string; name: string; formatType?: number | null } }) {
  const { tr } = useLocale();
  if (sticker.formatType === 3) return <div className="sticker">{tr('web.transcript.sticker', { name: sticker.name })}</div>;
  const ext = sticker.formatType === 4 ? 'gif' : 'png';
  return (
    <div className="sticker" title={sticker.name}>
      <SafeImage className="sticker-image" src={`https://media.discordapp.net/stickers/${sticker.id}.${ext}?size=160`} alt={sticker.name} />
    </div>
  );
}
