import type { Deadline } from '../types';

export const DEADLINES_KEY = 'deadlines';
export const IS_PREMIUM_KEY = 'isPremium';
export const TRIAL_START_KEY = 'trial_start_ts';

export interface CountdownStorageSchema {
  [DEADLINES_KEY]: Deadline[];
  [IS_PREMIUM_KEY]: boolean;
  [TRIAL_START_KEY]: number;
}

export type CountdownStorageKey = keyof CountdownStorageSchema;
export type CountdownStorageValues = Partial<CountdownStorageSchema>;
export type CountdownStorageSelection<Key extends readonly CountdownStorageKey[]> = Partial<
  Pick<CountdownStorageSchema, Key[number]>
>;

export interface CountdownStorageAdapter {
  get<const Key extends readonly CountdownStorageKey[]>(keys: Key): Promise<CountdownStorageSelection<Key>>;
  set(values: CountdownStorageValues): Promise<void>;
}
