import { ExternalLink, X } from 'lucide-react';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocale } from '../lib/i18n';
import { isSafeHttpUrl } from '../lib/markdown';

interface ViewerState {
  src: string;
  alt: string;
}

const ImageViewerContext = createContext<((src: string, alt: string) => void) | null>(null);

/** Returns a function that opens an image full size, or null when no viewer is mounted (HTML export). */
export const useImageViewer = () => useContext(ImageViewerContext);

/** Full-size image popup: native <dialog>, Escape / X / click outside to close. */
export function ImageViewerProvider({ children }: { children: ReactNode }) {
  const { tr } = useLocale();
  const [image, setImage] = useState<ViewerState | null>(null);
  const ref = useRef<HTMLDialogElement>(null);
  const open = useCallback((src: string, alt: string) => {
    if (isSafeHttpUrl(src)) setImage({ src, alt });
  }, []);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (image && !dialog.open) dialog.showModal?.();
    if (!image && dialog.open) dialog.close?.();
  }, [image]);

  return (
    <ImageViewerContext.Provider value={open}>
      {children}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Escape is handled natively by <dialog>; the click detects the backdrop. */}
      <dialog
        ref={ref}
        className="image-viewer"
        onClose={() => setImage(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setImage(null);
        }}
        aria-label={image?.alt || tr('web.transcript.openOriginal')}
      >
        {image && (
          <>
            <img src={image.src} alt={image.alt} referrerPolicy="no-referrer" />
            <div className="image-viewer-actions">
              <a
                className="icon-button"
                href={image.src}
                target="_blank"
                rel="noopener noreferrer nofollow"
                title={tr('web.transcript.openOriginal')}
                aria-label={tr('web.transcript.openOriginal')}
              >
                <ExternalLink size={18} />
              </a>
              <button
                type="button"
                className="icon-button"
                onClick={() => setImage(null)}
                title={tr('web.transcript.closeImage')}
                aria-label={tr('web.transcript.closeImage')}
              >
                <X size={20} />
              </button>
            </div>
          </>
        )}
      </dialog>
    </ImageViewerContext.Provider>
  );
}
