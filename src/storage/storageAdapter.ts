import type { Deadline } from '../core/types';

export const DEADLINES_KEY = 'deadlines';
export const IS_PREMIUM_KEY = 'isPremium';
export const TRIAL_START_KEY = 'trial_start_ts';

export interface CountdownStorageSchema {
  [DEADLINES_KEY]: Deadline[];
  [IS_PREMIUM_KEY]: boolean;
  [TRIAL_START_KEY]: number;
}

export type StorageKey<Schema extends object> = Extract<keyof Schema, string>;
export type StorageKeyList<Schema extends object> = readonly StorageKey<Schema>[];
export type StorageReadResult<
  Schema extends object,
  Key extends StorageKeyList<Schema>,
> = Partial<Pick<Schema, Key[number]>>;
export type StorageWritePatch<Schema extends object> = Partial<Schema>;
export type CountdownStorageKey = StorageKey<CountdownStorageSchema>;
export type CountdownStoragePatch = StorageWritePatch<CountdownStorageSchema>;
export type CountdownStorageReadResult<Key extends StorageKeyList<CountdownStorageSchema>> = StorageReadResult<
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
 * SDKs directly. Adapters must preserve the storage key names and value shapes
 * in CountdownStorageSchema so Chrome and mobile shells can share persisted
 * data without migrations.
 */
export interface LocalKeyValueStorageAdapter<Schema extends object> {
  get<const Key extends StorageKeyList<Schema>>(
    keys: Key,
  ): Promise<StorageReadResult<Schema, Key>>;
  set(values: StorageWritePatch<Schema>): Promise<void>;
}

export type CountdownStorageAdapter = LocalKeyValueStorageAdapter<CountdownStorageSchema>;
