import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// The transcript page's words in English and Arabic. Credora's strings (Discord Bots/credora packages/i18n, `web.*`),
// reworded for tickets: an owner and a claimer instead of trades and mediators.

export type SupportedLocale = 'en' | 'ar';
export type TranslationKey = string;
export type TranslationVars = Record<string, string | number>;
type PluralForms = { zero?: string; one?: string; two?: string; few?: string; many?: string; other: string };
type Tree = { [k: string]: string | PluralForms | Tree };

export const LOCALE_DIRECTION: Record<SupportedLocale, 'ltr' | 'rtl'> = { en: 'ltr', ar: 'rtl' };
export const isSupportedLocale = (v: unknown): v is SupportedLocale => v === 'en' || v === 'ar';

const en: Tree = {
    web: {
        meta: { transcriptTitle: 'Transcript · {channel}' },
        nav: { language: 'العربية' },
        transcript: {
            loading: 'Loading transcript…',
            notFound: 'This transcript does not exist or the link is wrong.',
            error: 'The transcript could not be loaded. Please try again later.',
            server: 'Server', ticket: 'Ticket', type: 'Kind', panel: 'Panel', opened: 'Opened', closed: 'Closed', participants: 'Participants', details: 'Details',
            export: {
                title: 'Export transcript', content: 'What to export', format: 'File type',
                scopes: { all: 'Everything', messages: 'Messages only', images: 'Images & videos only' },
                formats: { html: 'HTML page', txt: 'Text (.txt)', md: 'Markdown (.md)', json: 'JSON' },
                voiceNote: 'Voice messages play on this page only; downloads never include them.',
                download: 'Download',
            },
            play: 'Play', pause: 'Pause', seek: 'Seek',
            deletedTag: '(deleted)',
            deletedBySelf: 'Deleted by the author: {user}',
            deletedByModerator: 'Deleted by {user}',
            deletedByBot: 'Deleted by the bot {user}',
            deletedByUnknown: 'Deleted (could not tell who deleted it)',
            reactions: 'Reactions', reactedWith: '{users} reacted with {emoji}',
            andMore: { one: 'and {count} more', other: 'and {count} more' },
            voiceMessage: 'Voice message',
            timezoneNote: 'Times are shown in your timezone ({tz})',
            openOriginal: 'Open original', closeImage: 'Close image', topic: 'Topic',
            exportedAt: 'Exported {date}',
            ownerBadge: 'Owner', ownerBadgeTitle: 'Ticket owner: opened this ticket',
            claimerBadge: 'Claimer', claimerBadgeTitle: 'Staff member who claimed this ticket',
            copyright: 'Robtic Ticket · © {years}',
            closeDetails: 'Close',
            messages: { zero: 'No messages', one: '{count} message', other: '{count} messages' },
            edited: '(edited)', deleted: 'Deleted message', deletedAt: 'Deleted {date}',
            bot: 'BOT', system: 'SYSTEM', reply: 'Replying to a message', unknownUser: 'Unknown user',
            unavailableContent: 'Content not available (message was not cached by Discord)',
            imageExpired: 'Image no longer available', spoiler: 'Spoiler', download: 'Open', sticker: 'Sticker: {name}',
            editHistory: 'Edit history', before: 'Before', after: 'After',
            empty: 'This ticket has no messages.',
            generatedAt: 'Transcript generated {date}', transcriptId: 'Transcript ID', copy: 'Copy', copied: 'Copied',
            roles: { owner: 'Owner', claimer: 'Claimer', added: 'Added', staff: 'Staff' },
            answers: 'Form answers', claimedBy: 'Claimed by', notClaimed: 'Not claimed',
            detailsPanel: {
                title: 'Ticket details', overview: 'Overview',
                renames: { zero: 'Never renamed', one: 'Renamed {count} time', other: 'Renamed {count} times' },
                renameHistory: 'Rename history',
                topicChanges: { zero: 'No topic changes', one: '{count} topic change', other: '{count} topic changes' },
                edits: { zero: 'No edited messages', one: '{count} edited message', other: '{count} edited messages' },
                deletions: { zero: 'No deleted messages', one: '{count} deleted message', other: '{count} deleted messages' },
                attachments: { zero: 'No attachments', one: '{count} attachment', other: '{count} attachments' },
                images: { zero: 'No images', one: '{count} image', other: '{count} images' },
                participantsCount: { zero: 'No participants', one: '{count} participant', other: '{count} participants' },
                closedBy: 'Closed by', closeReason: 'Close reason',
                renamedFromTo: '{from} → {to}', topicFromTo: 'Topic: {from} → {to}', none: 'none',
            },
        },
    },
};

const ar: Tree = {
    web: {
        meta: { transcriptTitle: 'نسخة المحادثة · {channel}' },
        nav: { language: 'English' },
        transcript: {
            loading: 'جارٍ تحميل نسخة المحادثة…',
            notFound: 'نسخة المحادثة هذه غير موجودة أو الرابط غير صحيح.',
            error: 'تعذّر تحميل نسخة المحادثة، يرجى المحاولة لاحقاً.',
            server: 'السيرفر', ticket: 'التذكرة', type: 'النوع', panel: 'اللوحة', opened: 'فُتحت', closed: 'أُغلقت', participants: 'المشاركون', details: 'التفاصيل',
            export: {
                title: 'تصدير نسخة المحادثة', content: 'ماذا تريد أن تصدّر', format: 'نوع الملف',
                scopes: { all: 'كل شيء', messages: 'الرسائل فقط', images: 'الصور والفيديو فقط' },
                formats: { html: 'صفحة HTML', txt: 'نص (.txt)', md: 'ماركداون (.md)', json: 'JSON' },
                voiceNote: 'الرسائل الصوتية تُشغَّل في هذه الصفحة فقط ولا تُضمَّن في التنزيلات.',
                download: 'تنزيل',
            },
            play: 'تشغيل', pause: 'إيقاف مؤقت', seek: 'تقديم',
            deletedTag: '(محذوفة)',
            deletedBySelf: 'حذفها صاحبها: {user}',
            deletedByModerator: 'حذفها {user}',
            deletedByBot: 'حذفها البوت {user}',
            deletedByUnknown: 'محذوفة (تعذّر معرفة من حذفها)',
            reactions: 'التفاعلات', reactedWith: 'تفاعل {users} بـ {emoji}',
            andMore: { zero: 'و{count} آخرين', one: 'وشخص آخر', two: 'وشخصان آخران', few: 'و{count} آخرين', many: 'و{count} آخرين', other: 'و{count} آخرين' },
            voiceMessage: 'رسالة صوتية',
            timezoneNote: 'الأوقات معروضة بتوقيتك ({tz})',
            openOriginal: 'فتح الأصل', closeImage: 'إغلاق الصورة', topic: 'الوصف',
            exportedAt: 'تم التصدير {date}',
            ownerBadge: 'صاحب التذكرة', ownerBadgeTitle: 'صاحب التذكرة: هو من فتحها',
            claimerBadge: 'المتولّي', claimerBadgeTitle: 'الإداري الذي تولّى هذه التذكرة',
            copyright: 'Robtic Ticket · © {years}',
            closeDetails: 'إغلاق',
            messages: { zero: 'لا توجد رسائل', one: 'رسالة واحدة', two: 'رسالتان', few: '{count} رسائل', many: '{count} رسالة', other: '{count} رسالة' },
            edited: '(معدّلة)', deleted: 'رسالة محذوفة', deletedAt: 'حُذفت {date}',
            bot: 'بوت', system: 'النظام', reply: 'رداً على رسالة', unknownUser: 'مستخدم غير معروف',
            unavailableContent: 'المحتوى غير متاح (لم تكن الرسالة محفوظة لدى ديسكورد)',
            imageExpired: 'الصورة لم تعد متاحة', spoiler: 'حرق', download: 'فتح', sticker: 'ملصق: {name}',
            editHistory: 'سجل التعديلات', before: 'قبل', after: 'بعد',
            empty: 'لا توجد رسائل في هذه التذكرة.',
            generatedAt: 'أُنشئت النسخة {date}', transcriptId: 'معرّف النسخة', copy: 'نسخ', copied: 'تم النسخ',
            roles: { owner: 'صاحب التذكرة', claimer: 'المتولّي', added: 'مُضاف', staff: 'الإدارة' },
            answers: 'إجابات النموذج', claimedBy: 'تولّاها', notClaimed: 'لم يتولّها أحد',
            detailsPanel: {
                title: 'تفاصيل التذكرة', overview: 'نظرة عامة',
                renames: { zero: 'لم يتغيّر اسمها', one: 'تغيّر اسمها مرة واحدة', two: 'تغيّر اسمها مرتين', few: 'تغيّر اسمها {count} مرات', many: 'تغيّر اسمها {count} مرة', other: 'تغيّر اسمها {count} مرة' },
                renameHistory: 'سجل تغيير الاسم',
                topicChanges: { zero: 'لا تغييرات على الوصف', one: 'تغيير واحد على الوصف', two: 'تغييران على الوصف', few: '{count} تغييرات على الوصف', many: '{count} تغييراً على الوصف', other: '{count} تغيير على الوصف' },
                edits: { zero: 'لا توجد رسائل معدّلة', one: 'رسالة معدّلة واحدة', two: 'رسالتان معدّلتان', few: '{count} رسائل معدّلة', many: '{count} رسالة معدّلة', other: '{count} رسالة معدّلة' },
                deletions: { zero: 'لا توجد رسائل محذوفة', one: 'رسالة محذوفة واحدة', two: 'رسالتان محذوفتان', few: '{count} رسائل محذوفة', many: '{count} رسالة محذوفة', other: '{count} رسالة محذوفة' },
                attachments: { zero: 'لا توجد مرفقات', one: 'مرفق واحد', two: 'مرفقان', few: '{count} مرفقات', many: '{count} مرفقاً', other: '{count} مرفق' },
                images: { zero: 'لا توجد صور', one: 'صورة واحدة', two: 'صورتان', few: '{count} صور', many: '{count} صورة', other: '{count} صورة' },
                participantsCount: { zero: 'لا يوجد مشاركون', one: 'مشارك واحد', two: 'مشاركان', few: '{count} مشاركين', many: '{count} مشاركاً', other: '{count} مشارك' },
                closedBy: 'أغلقها', closeReason: 'سبب الإغلاق',
                renamedFromTo: '{from} ← {to}', topicFromTo: 'الوصف: {from} ← {to}', none: 'لا يوجد',
            },
        },
    },
};

const LOCALES: Record<SupportedLocale, Tree> = { en, ar };
const FSI = '⁨';
const PDI = '⁩';
const DISCORD_MARKUP = /^<(?:@[!&]?|#|a?:\w+:|t:|\/)[^>]*>$/;

function lookup(tree: Tree, key: string): string | PluralForms | undefined {
    let node: unknown = tree;
    for (const part of key.split('.')) {
        if (!node || typeof node !== 'object') return undefined;
        node = (node as Record<string, unknown>)[part];
    }
    if (typeof node === 'string') return node;
    if (node && typeof node === 'object' && typeof (node as PluralForms).other === 'string') return node as PluralForms;
    return undefined;
}

/** One string, with plurals ({count}) and placeholders; Arabic isolates Latin names so they don't flip the sentence. */
export function t(locale: SupportedLocale, key: TranslationKey, vars?: TranslationVars): string {
    const entry = lookup(LOCALES[locale] ?? en, key) ?? lookup(en, key);
    if (entry === undefined) return key;
    let template: string;
    if (typeof entry === 'string') template = entry;
    else {
        const count = typeof vars?.count === 'number' ? vars.count : undefined;
        const cat = count === undefined ? 'other' : count === 0 && entry.zero ? 'zero' : (new Intl.PluralRules(locale).select(count) as keyof PluralForms);
        template = entry[cat] ?? entry.other;
    }
    if (!vars) return template;
    const rtl = LOCALE_DIRECTION[locale] === 'rtl';
    return template.replace(/\{(\w+)\}/g, (m, name: string) => {
        if (vars[name] === undefined) return m;
        const value = String(vars[name]);
        return rtl && !DISCORD_MARKUP.test(value) ? `${FSI}${value}${PDI}` : value;
    });
}

export const translator = (locale: SupportedLocale) => (key: TranslationKey, vars?: TranslationVars) => t(locale, key, vars);
export type Translator = ReturnType<typeof translator>;

interface LocaleContextValue {
    locale: SupportedLocale;
    dir: 'ltr' | 'rtl';
    tr: Translator;
    setLocale(locale: SupportedLocale): void;
    toggle(): void;
    explicit: boolean;
    applyDefault(locale: SupportedLocale): void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);
const STORAGE_KEY = 'robtic-ticket.locale';

function readStored(): SupportedLocale | null {
    try {
        const v = globalThis.localStorage?.getItem(STORAGE_KEY);
        return isSupportedLocale(v) ? v : null;
    } catch {
        return null;
    }
}

function queryLocale(): SupportedLocale | null {
    try {
        const v = new URLSearchParams(globalThis.location?.search ?? '').get('lang');
        return isSupportedLocale(v) ? v : null;
    } catch {
        return null;
    }
}

/** The page's language: ?lang=, then the visitor's choice, then the server's language (applyDefault). */
export function LocaleProvider({ children, locale: forced }: { children: ReactNode; locale?: SupportedLocale }) {
    const [locale, setLocaleState] = useState<SupportedLocale>(() => forced ?? queryLocale() ?? readStored() ?? (globalThis.navigator?.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en'));
    const [explicit, setExplicit] = useState(() => forced !== undefined || queryLocale() !== null || readStored() !== null);
    const setLocale = useCallback((next: SupportedLocale) => {
        setLocaleState(next);
        setExplicit(true);
        try { globalThis.localStorage?.setItem(STORAGE_KEY, next); } catch { /* private mode */ }
    }, []);
    useEffect(() => {
        if (typeof document === 'undefined') return;
        document.documentElement.lang = locale;
        document.documentElement.dir = LOCALE_DIRECTION[locale];
    }, [locale]);
    const value = useMemo<LocaleContextValue>(() => ({
        locale, dir: LOCALE_DIRECTION[locale], tr: translator(locale), setLocale,
        toggle: () => setLocale(locale === 'ar' ? 'en' : 'ar'), explicit, applyDefault: setLocaleState,
    }), [locale, setLocale, explicit]);
    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
    const ctx = useContext(LocaleContext);
    if (!ctx) throw new Error('useLocale must be used inside LocaleProvider');
    return ctx;
}

/** Uses the server's language unless the visitor picked one. */
export function useDefaultLocale(preferred: string | undefined): void {
    const { explicit, applyDefault } = useLocale();
    useEffect(() => {
        if (!explicit && isSupportedLocale(preferred)) applyDefault(preferred);
    }, [preferred, explicit, applyDefault]);
}
