import { describe, expect, it } from 'vitest';

import { formatDisplayDate, formatInteger } from '../../src/core/formatting';

describe('formatInteger', () => {
  it('formats integers with locale grouping', () => {
    expect(formatInteger(12345, 'ja')).toBe('12,345');
    expect(formatInteger(12345, 'en')).toBe('12,345');
  });
});

describe('formatDisplayDate', () => {
  it('formats stored dates for display by locale', () => {
    expect(formatDisplayDate('2026-05-24', 'ja')).toBe('2026年5月24日（日）');
    expect(formatDisplayDate('2026-05-24', 'en')).toBe('May 24, 2026 (Sun)');
  });

  it('keeps invalid stored dates unchanged', () => {
    expect(formatDisplayDate('2026-02-31', 'ja')).toBe('2026-02-31');
  });
});
