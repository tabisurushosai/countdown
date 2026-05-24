import type { Deadline } from '../types';

export const DEADLINES_KEY = 'deadlines';
export const IS_PREMIUM_KEY = 'isPremium';
export const TRIAL_START_KEY = 'trial_start_ts';

export type CountdownStorageKey =
  | typeof DEADLINES_KEY
  | typeof IS_PREMIUM_KEY
  | typeof TRIAL_START_KEY;

export interface CountdownStorageValues {
  deadlines?: Deadline[];
  isPremium?: boolean;
  trial_start_ts?: number;
}

export interface CountdownStorageAdapter {
  get(keys: readonly CountdownStorageKey[]): Promise<CountdownStorageValues>;
  set(values: CountdownStorageValues): Promise<void>;
}
