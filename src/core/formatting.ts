export type DisplayLocale = 'ja' | 'en';

const DATE_FORMATTERS: Record<DisplayLocale, Intl.DateTimeFormat> = {
  ja: new Intl.DateTimeFormat('ja', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  en: new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }),
};

const NUMBER_FORMATTERS: Record<DisplayLocale, Intl.NumberFormat> = {
  ja: new Intl.NumberFormat('ja'),
  en: new Intl.NumberFormat('en'),
};

export function formatInteger(value: number, locale: DisplayLocale): string {
  return NUMBER_FORMATTERS[locale].format(value);
}

export function formatDisplayDate(dateStr: string, locale: DisplayLocale): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) {
    return dateStr;
  }

  return DATE_FORMATTERS[locale].format(new Date(year, month - 1, day));
}
