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
export type StorageReadResult<
  Schema extends object,
  Key extends readonly StorageSchemaKey<Schema>[],
> = Partial<Pick<Schema, Key[number]>>;
export type StorageWritePatch<Schema extends object> = Partial<Schema>;
export type CountdownStoragePatch = StorageWritePatch<CountdownStorageSchema>;
export type CountdownStorageReadResult<Key extends readonly CountdownStorageKey[]> = StorageReadResult<
  CountdownStorageSchema,
  Key
>;

export const COUNTDOWN_DEADLINE_KEYS = [DEADLINES_KEY] as const satisfies readonly CountdownStorageKey[];
export const COUNTDOWN_SNAPSHOT_KEYS = [
  DEADLINES_KEY,
  IS_PREMIUM_KEY,
  TRIAL_START_KEY,
] as const satisfies readonly CountdownStorageKey[];
export const COUNTDOWN_TRIAL_KEYS = [TRIAL_START_KEY] as const satisfies readonly CountdownStorageKey[];

/**
 * Minimal local key-value persistence boundary.
 *
 * Platform code owns the concrete implementation. Shared countdown behavior
 * receives data through storage helpers instead of importing Chrome or native
 * SDKs directly.
 */
export interface KeyValueStorageAdapter<Schema extends object> {
  get<const Key extends readonly StorageSchemaKey<Schema>[]>(
    keys: Key,
  ): Promise<StorageReadResult<Schema, Key>>;
  set(values: StorageWritePatch<Schema>): Promise<void>;
}

export type CountdownStorageAdapter = KeyValueStorageAdapter<CountdownStorageSchema>;
