import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LocaleProvider } from '@robo/transcript';
import '@robo/transcript/styles.css';
import { TranscriptPage } from './TranscriptPage';

// One page: <base>/:id (base: /transcript locally, /discord/transcripts in production). No router needed.
const id = /\/([A-Za-z0-9_]+)\/?$/.exec(location.pathname.slice((import.meta.env?.BASE_URL ?? "/").length - 1))?.[1] ?? '';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <LocaleProvider>
            <TranscriptPage id={id} />
        </LocaleProvider>
    </StrictMode>,
);
