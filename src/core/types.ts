export const DEADLINE_REPEATS = ['none', 'weekly', 'monthly', 'yearly'] as const;

export type DeadlineRepeat = (typeof DEADLINE_REPEATS)[number];

const DEADLINE_REPEAT_VALUES: ReadonlySet<string> = new Set(DEADLINE_REPEATS);

export interface Deadline {
  id: string;
  name: string;
  date: string;
  repeat?: DeadlineRepeat;
}

export function isDeadlineRepeat(value: string): value is DeadlineRepeat {
  return DEADLINE_REPEAT_VALUES.has(value);
}
