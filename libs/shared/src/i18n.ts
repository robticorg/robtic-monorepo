// Everything the bot says, in English and Arabic (formal, short: one line per notice). The server picks the language on
// the dashboard (Settings → Bot language). `{name}` is filled in by t().

export type Locale = 'en' | 'ar';

const en = {
    // opening
    'open.created': '✅ Your ticket is ready: {channel}',
    'open.limit': '⚠️ You already have {count} open ticket(s) of this kind: {channels}',
    'open.disabled': '⏸️ This kind of ticket is closed for now. Please try again later.',
    'open.gone': '⚠️ This option no longer exists. Ask an admin to update the panel.',
    'open.failed': '❌ The ticket channel couldn’t be made. The bot needs Manage Channels and Manage Roles.',
    'open.answers': '📝 **Answers from {user}**',
    'open.formTitle': '{option}',
    // controls
    'deny': '❌ You can’t do that in this ticket.',
    'notTicket': '⚠️ This works only inside a ticket.',
    'closed.already': '⚠️ This ticket is already closed.',
    'open.already': '⚠️ This ticket is already open.',
    'closed.notice': '🔒 Ticket closed by {user}.',
    'closed.reason': '🔒 Ticket closed by {user}. Reason: {reason}',
    'closed.title': '🔒 Ticket closed',
    'closed.saved': 'The transcript is saved.',
    'reopened': '🔓 Ticket reopened by {user}.',
    'deleting': '🗑️ This ticket will be deleted in {seconds} seconds.',
    'deleting.now': '🗑️ Deleting this ticket.',
    'open.blacklisted': '⛔ You can’t open tickets on this server.',
    'confirm.close': 'Close this ticket?',
    'confirm.delete': 'Delete this ticket? This can’t be undone.',
    'autodelete': '🗑️ This ticket will be deleted in {time}. Reopen it to keep it.',
    'sleep.ownerLast': 'The owner sent the last message: there’s nothing to wait for.',
    'sleep.started': '💤 Reminded {user}. The ticket closes in {time} if there’s no reply.',
    'sleep.closed': 'No answer',
    'confirm.yes': 'Yes',
    'cmd.off': '⏸️ This command is turned off on this server.',
    'come.sent': '📣 {user} was asked to come back to the ticket.',
    'come.dmClosed': '⚠️ {user} doesn’t accept direct messages.',
    'come.wait': '⏳ You can call again in {minutes} minute(s).',
    'come.off': '⏸️ The come command is turned off on this server.',
    'pick.title': 'Pick a member',
    'answer.yes': 'Yes',
    'answer.no': 'No',
    'closed.noReason': 'No reason given',
    'claimed': '🙋 {user} has claimed this ticket.',
    'unclaimed': '↩️ {user} has unclaimed this ticket.',
    'claimed.other': '⚠️ This ticket is already claimed by {user}.',
    'renamed': '✏️ Renamed to **{name}**.',
    'rename.title': 'Rename the ticket',
    'rename.label': 'New name',
    'rename.slow': '⏳ Discord allows two renames every 10 minutes. Please try again shortly.',
    'added': '➕ {user} was added to the ticket.',
    'removed': '➖ {user} was removed from the ticket.',
    'pick.add': 'Pick the member to add.',
    'pick.remove': 'Pick the member to remove.',
    'pick.transfer': 'Pick the staff member who takes over.',
    'transferred': '🔁 {from} handed this ticket to {to}.',
    'transfer.notStaff': '⚠️ {user} can’t handle this kind of ticket.',
    'member.notIn': '⚠️ {user} isn’t in this ticket.',
    'member.owner': '⚠️ The owner can’t be removed from their own ticket.',
    'transcript.saving': '📄 Saving the transcript…',
    'transcript.ready': '📄 Transcript of **{channel}**: {link}',
    'transcript.file': '📄 Transcript of **{channel}** attached.',
    'close.reasonTitle': 'Close the ticket',
    'close.reasonLabel': 'Reason',
    'close.reasonHint': 'Why is it closed? (optional)',
    'error': '❌ Something went wrong. Please try again.',
    // logs
    'log.opened': '📩 {user} opened {channel} ({option}).',
    'log.closed': '🔒 {user} closed **{name}**.',
    'log.reopened': '🔓 {user} reopened {channel}.',
    'log.claimed': '🙋 {user} claimed {channel}.',
    'log.deleted': '🗑️ {user} deleted **{name}**.',
    // DMs
    'dm.transcript': '📄 Your ticket **{channel}** on **{server}** was closed. Here is its transcript: {link}',
    // commands
    'cmd.usage': '⚠️ Usage: `{usage}`',
} as const;

export type MessageKey = keyof typeof en;

const ar: Record<MessageKey, string> = {
    'open.created': '✅ تم إنشاء تذكرتك: {channel}',
    'open.limit': '⚠️ لديك {count} تذكرة مفتوحة من هذا النوع: {channels}',
    'open.disabled': '⏸️ هذا النوع من التذاكر مغلق حالياً، يرجى المحاولة لاحقاً.',
    'open.gone': '⚠️ هذا الخيار لم يعد موجوداً، يرجى إبلاغ الإدارة لتحديث اللوحة.',
    'open.failed': '❌ تعذّر إنشاء روم التذكرة، يحتاج البوت إلى صلاحيتي إدارة الرومات وإدارة الرتب.',
    'open.answers': '📝 **إجابات {user}**',
    'open.formTitle': '{option}',
    'deny': '❌ لا تملك صلاحية تنفيذ هذا الإجراء في هذه التذكرة.',
    'notTicket': '⚠️ يعمل هذا الأمر داخل التذاكر فقط.',
    'closed.already': '⚠️ هذه التذكرة مغلقة مسبقاً.',
    'open.already': '⚠️ هذه التذكرة مفتوحة مسبقاً.',
    'closed.notice': '🔒 تم إغلاق التذكرة بواسطة {user}.',
    'closed.reason': '🔒 تم إغلاق التذكرة بواسطة {user}، السبب: {reason}',
    'closed.title': '🔒 تم إغلاق التذكرة',
    'closed.saved': 'تم حفظ نسخة المحادثة.',
    'reopened': '🔓 تمت إعادة فتح التذكرة بواسطة {user}.',
    'deleting': '🗑️ سيتم حذف هذه التذكرة خلال {seconds} ثانية.',
    'deleting.now': '🗑️ جارٍ حذف هذه التذكرة.',
    'open.blacklisted': '⛔ لا يمكنك فتح تذاكر في هذا الخادم.',
    'confirm.close': 'هل تريد إغلاق هذه التذكرة؟',
    'confirm.delete': 'هل تريد حذف هذه التذكرة؟ لا يمكن التراجع عن ذلك.',
    'autodelete': '🗑️ سيتم حذف هذه التذكرة خلال {time}، ويمكن إعادة فتحها للاحتفاظ بها.',
    'sleep.ownerLast': 'آخر رسالة من صاحب التذكرة، فلا يوجد ما يُنتظر.',
    'sleep.started': '💤 تم تذكير {user}، وستُغلق التذكرة خلال {time} إن لم يصل رد.',
    'sleep.closed': 'لا يوجد رد',
    'confirm.yes': 'نعم',
    'cmd.off': '⏸️ هذا الأمر معطّل في هذا الخادم.',
    'come.sent': '📣 تم إرسال طلب إلى {user} للعودة إلى التذكرة.',
    'come.dmClosed': '⚠️ لا يستقبل {user} الرسائل الخاصة.',
    'come.wait': '⏳ يمكنك الاستدعاء مرة أخرى بعد {minutes} دقيقة.',
    'come.off': '⏸️ أمر الاستدعاء معطّل في هذا الخادم.',
    'pick.title': 'اختيار عضو',
    'answer.yes': 'نعم',
    'answer.no': 'لا',
    'closed.noReason': 'لم يُذكر سبب',
    'claimed': '🙋 تولّى {user} هذه التذكرة.',
    'unclaimed': '↩️ تخلّى {user} عن هذه التذكرة.',
    'claimed.other': '⚠️ هذه التذكرة يتولاها {user} حالياً.',
    'renamed': '✏️ تم تغيير الاسم إلى **{name}**.',
    'rename.title': 'تغيير اسم التذكرة',
    'rename.label': 'الاسم الجديد',
    'rename.slow': '⏳ يسمح ديسكورد بتغييرين للاسم كل 10 دقائق، يرجى المحاولة بعد قليل.',
    'added': '➕ تمت إضافة {user} إلى التذكرة.',
    'removed': '➖ تمت إزالة {user} من التذكرة.',
    'pick.add': 'اختر العضو المراد إضافته.',
    'pick.remove': 'اختر العضو المراد إزالته.',
    'pick.transfer': 'اختر الإداري الذي سيتولى التذكرة.',
    'transferred': '🔁 حوّل {from} هذه التذكرة إلى {to}.',
    'transfer.notStaff': '⚠️ لا يملك {user} صلاحية التعامل مع هذا النوع من التذاكر.',
    'member.notIn': '⚠️ {user} ليس ضمن هذه التذكرة.',
    'member.owner': '⚠️ لا يمكن إزالة صاحب التذكرة منها.',
    'transcript.saving': '📄 جارٍ حفظ نسخة المحادثة…',
    'transcript.ready': '📄 نسخة محادثة **{channel}**: {link}',
    'transcript.file': '📄 نسخة محادثة **{channel}** مرفقة.',
    'close.reasonTitle': 'إغلاق التذكرة',
    'close.reasonLabel': 'السبب',
    'close.reasonHint': 'سبب الإغلاق (اختياري)',
    'error': '❌ حدث خطأ، يرجى المحاولة مرة أخرى.',
    'log.opened': '📩 فتح {user} التذكرة {channel} ({option}).',
    'log.closed': '🔒 أغلق {user} التذكرة **{name}**.',
    'log.reopened': '🔓 أعاد {user} فتح التذكرة {channel}.',
    'log.claimed': '🙋 تولّى {user} التذكرة {channel}.',
    'log.deleted': '🗑️ حذف {user} التذكرة **{name}**.',
    'dm.transcript': '📄 تم إغلاق تذكرتك **{channel}** في **{server}**، وهذه نسخة المحادثة: {link}',
    'cmd.usage': '⚠️ الاستخدام: `{usage}`',
};

const LOCALES: Record<Locale, Record<MessageKey, string>> = { en, ar };

/** One message in the server's language, with `{name}` filled in. Falls back to English, never throws. */
export function t(locale: Locale, key: MessageKey, vars: Record<string, string | number> = {}): string {
    const template = LOCALES[locale]?.[key] ?? en[key] ?? key;
    return template.replace(/\{(\w+)\}/g, (m, name: string) => (vars[name] === undefined ? m : String(vars[name])));
}

/** Keys missing in Arabic (the test keeps both complete). */
export const missingArabic = (): string[] => (Object.keys(en) as MessageKey[]).filter((k) => !ar[k]);

/**
 * The commands in both languages: the name members type after the prefix, and the slash command's name. The Arabic
 * words are the ones the dashboard lists.
 */
export const COMMAND_WORDS: Record<string, { en: string; ar: string[] }> = {
    close: { en: 'close', ar: ['اغلاق', 'إغلاق', 'قفل'] },
    claim: { en: 'claim', ar: ['استلام'] },
    rename: { en: 'rename', ar: ['تسمية'] },
    add: { en: 'add', ar: ['اضافة', 'إضافة'] },
    remove: { en: 'remove', ar: ['ازالة', 'إزالة'] },
    transfer: { en: 'transfer', ar: ['تحويل'] },
    transcript: { en: 'transcript', ar: ['نسخة'] },
    reopen: { en: 'reopen', ar: ['فتح'] },
    delete: { en: 'delete', ar: ['حذف'] },
    come: { en: 'come', ar: ['تعال', 'استدعاء'] },
    sleep: { en: 'sleep', ar: ['خمول'] },
};
