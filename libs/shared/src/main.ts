// @robo/shared: what every part of Robtic Ticket agrees on. The settings (written by the dashboard, read by the bot),
// the transcript shapes, the bot's words in English and Arabic, and the logger's types.

export * from './settings';
export * from './transcript';
export * from './i18n';
export type { LogLevel, LoggerConfig, DatabaseLogType } from './types/logger';
