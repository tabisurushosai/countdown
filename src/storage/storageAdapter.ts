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
export type StorageSchemaKey<Schema extends object> = Extract<keyof Schema, string>;
export type StorageSelection<
  Schema extends object,
  Key extends readonly StorageSchemaKey<Schema>[],
> = Partial<Pick<Schema, Key[number]>>;
export type CountdownStorageSelection<Key extends readonly CountdownStorageKey[]> = StorageSelection<
  CountdownStorageSchema,
  Key
>;

export interface StorageAdapter<Schema extends object> {
  get<const Key extends readonly StorageSchemaKey<Schema>[]>(
    keys: Key,
  ): Promise<StorageSelection<Schema, Key>>;
  set(values: Partial<Schema>): Promise<void>;
}

export type CountdownStorageAdapter = StorageAdapter<CountdownStorageSchema>;
