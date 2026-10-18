/**
 * Utility functions for date and time formatting in chat and message lists.
 * Supports both Indonesian and English locales dynamically.
 */

import { useLanguageStore } from '../../i18n/useLanguageStore';

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
];

const MONTH_SHORT_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function getActiveLanguage(): 'id' | 'en' {
  try {
    return useLanguageStore.getState().currentLanguage || 'id';
  } catch {
    return 'id';
  }
}

/**
 * Safely parse any timestamp input (number epoch, ISO string, 'HH:mm', or Date).
 */
export function parseDate(input: number | string | Date | undefined): Date {
  if (!input) return new Date();
  if (input instanceof Date) return input;
  if (typeof input === 'number') return new Date(input);

  // If input is formatted like 'HH:mm' (e.g. '19:42')
  if (typeof input === 'string' && /^\d{1,2}:\d{2}$/.test(input.trim())) {
    const [hours, minutes] = input.trim().split(':').map(Number);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  const parsed = new Date(input);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Format time to HH:mm (e.g. "13:45")
 */
export function formatTimeOnly(input: number | string | Date | undefined): string {
  const d = parseDate(input);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Check if two dates are on the same calendar day
 */
export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Check if date is today
 */
export function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

/**
 * Check if date is yesterday
 */
export function isYesterday(d: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(d, yesterday);
}

/**
 * Format timestamp for message list row (e.g. '13:45', 'Kemarin' / 'Yesterday', '15 Okt' / '15 Oct')
 */
export function formatMessageListTime(
  input: number | string | Date | undefined,
  lang: 'id' | 'en' = getActiveLanguage()
): string {
  if (!input) return '';

  // If it's already a formatted string like '13:45'
  if (typeof input === 'string' && /^\d{1,2}:\d{2}$/.test(input.trim())) {
    return input.trim();
  }

  const d = parseDate(input);
  const now = new Date();

  if (isToday(d)) {
    return formatTimeOnly(d);
  }
  if (isYesterday(d)) {
    return lang === 'en' ? 'Yesterday' : 'Kemarin';
  }
  if (d.getFullYear() === now.getFullYear()) {
    const monthList = lang === 'en' ? MONTH_SHORT_EN : MONTH_SHORT_ID;
    const month = monthList[d.getMonth()];
    return `${d.getDate()} ${month}`;
  }
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

/**
 * Format date divider in chat room (e.g. 'Hari ini' / 'Today', 'Kemarin' / 'Yesterday', '15 Oktober 2026' / 'October 15, 2026')
 */
export function formatDateDivider(
  input: number | string | Date | undefined,
  lang: 'id' | 'en' = getActiveLanguage()
): string {
  const d = parseDate(input);
  if (isToday(d)) {
    return lang === 'en' ? 'Today' : 'Hari ini';
  }
  if (isYesterday(d)) {
    return lang === 'en' ? 'Yesterday' : 'Kemarin';
  }

  if (lang === 'en') {
    const month = MONTH_NAMES_EN[d.getMonth()];
    return `${month} ${d.getDate()}, ${d.getFullYear()}`;
  }

  const month = MONTH_NAMES_ID[d.getMonth()];
  return `${d.getDate()} ${month} ${d.getFullYear()}`;
}

/**
 * Check if calendar day differs between previous message and current message
 */
export function isDifferentDay(
  prevInput: number | string | Date | undefined,
  currInput: number | string | Date | undefined
): boolean {
  if (!prevInput || !currInput) return false;
  const d1 = parseDate(prevInput);
  const d2 = parseDate(currInput);
  return !isSameDay(d1, d2);
}

/**
 * Check if there is a significant time gap between messages on the same day (default: 15 mins)
 */
export function hasSignificantGap(
  prevInput: number | string | Date | undefined,
  currInput: number | string | Date | undefined,
  gapMinutes = 15
): boolean {
  if (!prevInput || !currInput) return false;
  const d1 = parseDate(prevInput);
  const d2 = parseDate(currInput);

  // If different day, date divider takes precedence
  if (!isSameDay(d1, d2)) return false;

  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return diffMs >= gapMinutes * 60 * 1000;
}
