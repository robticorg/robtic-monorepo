import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LocaleProvider } from '@robo/transcript';
import '@robo/transcript/styles.css';
import { TranscriptPage } from './TranscriptPage';

// One page: /transcript/:id (anything else is "not found"). No router needed.
const id = /^\/transcript\/([A-Za-z0-9_]+)\/?$/.exec(location.pathname)?.[1] ?? '';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <LocaleProvider>
            <TranscriptPage id={id} />
        </LocaleProvider>
    </StrictMode>,
);
