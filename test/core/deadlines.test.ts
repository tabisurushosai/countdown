import { describe, expect, it } from 'vitest';

import { getDeadlineStatus } from '../../src/core/deadlines';

describe('getDeadlineStatus', () => {
  it('includes elapsed days for overdue deadlines', () => {
    expect(getDeadlineStatus(-3)).toEqual({ kind: 'overdue', days: 3 });
  });
});
