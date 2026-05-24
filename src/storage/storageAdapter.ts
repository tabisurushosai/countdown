import type { Deadline } from '../core/types';

export const DEADLINES_KEY = 'deadlines';
export const IS_PREMIUM_KEY = 'isPremium';
export const TRIAL_START_KEY = 'trial_start_ts';

export interface CountdownStorageSchema {
  [DEADLINES_KEY]: Deadline[];
  [IS_PREMIUM_KEY]: boolean;
  [TRIAL_START_KEY]: number;
}

export type CountdownStorageKey = keyof CountdownStorageSchema;
export type StorageSchemaKey<Schema extends object> = Extract<keyof Schema, string>;
export type StorageSelection<
  Schema extends object,
  Key extends readonly StorageSchemaKey<Schema>[],
> = Partial<Pick<Schema, Key[number]>>;
export type StoragePatch<Schema extends object> = Partial<Schema>;
export type CountdownStorageValues = StoragePatch<CountdownStorageSchema>;
export type CountdownStorageSelection<Key extends readonly CountdownStorageKey[]> = StorageSelection<
  CountdownStorageSchema,
  Key
>;

/**
 * Minimal local key-value storage boundary.
 *
 * Platform code (Chrome, iOS, Android) owns the concrete implementation. Core
 * countdown behavior should receive data through storage helpers instead of
 * importing platform SDKs directly.
 */
export interface StorageAdapter<Schema extends object> {
  get<const Key extends readonly StorageSchemaKey<Schema>[]>(
    keys: Key,
  ): Promise<StorageSelection<Schema, Key>>;
  set(values: StoragePatch<Schema>): Promise<void>;
}

export type CountdownStorageAdapter = StorageAdapter<CountdownStorageSchema>;
