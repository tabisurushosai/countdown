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
    weekday: 'short',
    timeZone: 'UTC',
  }),
  en: new Intl.DateTimeFormat(LOCALE_TAGS.en, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'UTC',
  }),
};

const NUMBER_FORMATTERS: Record<DisplayLocale, Intl.NumberFormat> = {
  ja: new Intl.NumberFormat(LOCALE_TAGS.ja, {
    useGrouping: true,
    maximumFractionDigits: 0,
  }),
  en: new Intl.NumberFormat(LOCALE_TAGS.en, {
    useGrouping: true,
    maximumFractionDigits: 0,
  }),
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
  return DATE_FORMATTERS[locale].format(new Date(Date.UTC(year, month - 1, day)));
}
