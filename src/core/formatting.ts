export type DisplayLocale = 'ja' | 'en';

const LOCALE_TAGS: Record<DisplayLocale, string> = {
  ja: 'ja-JP',
  en: 'en-US',
};

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
};

const WEEKDAY_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  timeZone: 'UTC',
};

const NUMBER_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  useGrouping: true,
  maximumFractionDigits: 0,
};

const DATE_FORMATTERS: Record<DisplayLocale, Intl.DateTimeFormat> = {
  ja: new Intl.DateTimeFormat(LOCALE_TAGS.ja, DATE_FORMAT_OPTIONS),
  en: new Intl.DateTimeFormat(LOCALE_TAGS.en, DATE_FORMAT_OPTIONS),
};

const WEEKDAY_FORMATTERS: Record<DisplayLocale, Intl.DateTimeFormat> = {
  ja: new Intl.DateTimeFormat(LOCALE_TAGS.ja, WEEKDAY_FORMAT_OPTIONS),
  en: new Intl.DateTimeFormat(LOCALE_TAGS.en, WEEKDAY_FORMAT_OPTIONS),
};

const NUMBER_FORMATTERS: Record<DisplayLocale, Intl.NumberFormat> = {
  ja: new Intl.NumberFormat(LOCALE_TAGS.ja, NUMBER_FORMAT_OPTIONS),
  en: new Intl.NumberFormat(LOCALE_TAGS.en, NUMBER_FORMAT_OPTIONS),
};

function parseDisplayDateParts(dateStr: string): { year: number; month: number; day: number } | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) {
    return undefined;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return undefined;
  }

  return { year, month, day };
}

export function formatInteger(value: number, locale: DisplayLocale): string {
  return NUMBER_FORMATTERS[locale].format(value);
}

export function formatDisplayDate(dateStr: string, locale: DisplayLocale): string {
  const dateParts = parseDisplayDateParts(dateStr);
  if (!dateParts) {
    return dateStr;
  }

  const { year, month, day } = dateParts;
  const date = new Date(Date.UTC(year, month - 1, day));
  const dateText = DATE_FORMATTERS[locale].format(date);
  const weekdayText = WEEKDAY_FORMATTERS[locale].format(date);

  return locale === 'ja' ? `${dateText}（${weekdayText}）` : `${dateText} (${weekdayText})`;
}
