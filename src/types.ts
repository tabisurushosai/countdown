export const DEADLINE_REPEATS = ['none', 'weekly', 'monthly', 'yearly'] as const;

export type DeadlineRepeat = (typeof DEADLINE_REPEATS)[number];

export interface Deadline {
  id: string;
  name: string;
  date: string;
  repeat?: DeadlineRepeat;
}

export function isDeadlineRepeat(value: string): value is DeadlineRepeat {
  return DEADLINE_REPEATS.includes(value as DeadlineRepeat);
}
