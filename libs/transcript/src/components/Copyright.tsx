import { copyrightYears } from '../lib/format';
import { useLocale } from '../lib/i18n';
import { COPYRIGHT_START_YEAR } from '../lib/logo';

/** "Robtic Ticket · © 2026" (or "2026 – <this year>"). `fixed` pins it to the bottom center. */
export function Copyright({ fixed = false }: { fixed?: boolean }) {
  const { tr } = useLocale();
  return (
    <footer className={fixed ? 'copyright is-fixed' : 'copyright'}>
      {tr('web.transcript.copyright', { years: copyrightYears(COPYRIGHT_START_YEAR) })}
    </footer>
  );
}
