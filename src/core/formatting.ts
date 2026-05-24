export type DisplayLocale = 'ja' | 'en';

const LOCALE_TAGS: Record<DisplayLocale, string> = {
  ja: 'ja-JP',
  en: 'en-US',
};

const DATE_FORMATTERS: Record<DisplayLocale, Intl.DateTimeFormat> = {
  ja: new Intl.DateTimeFormat(LOCALE_TAGS.ja, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }),
  en: new Intl.DateTimeFormat(LOCALE_TAGS.en, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }),
};

const NUMBER_FORMATTERS: Record<DisplayLocale, Intl.NumberFormat> = {
  ja: new Intl.NumberFormat(LOCALE_TAGS.ja),
  en: new Intl.NumberFormat(LOCALE_TAGS.en),
};

export function formatInteger(value: number, locale: DisplayLocale): string {
  return NUMBER_FORMATTERS[locale].format(value);
}

export function formatDisplayDate(dateStr: string, locale: DisplayLocale): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) {
    return dateStr;
  }

  return DATE_FORMATTERS[locale].format(new Date(Date.UTC(year, month - 1, day)));
}
