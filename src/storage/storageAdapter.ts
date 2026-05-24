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

/**
 * Minimal local key-value storage boundary.
 *
 * Platform code (Chrome, iOS, Android) owns the concrete implementation. Core
 * countdown behavior should receive data through storage helpers instead of
 * importing platform SDKs directly.
 */
export interface LocalStorageAdapter<Schema extends object> {
  get<const Key extends readonly StorageSchemaKey<Schema>[]>(
    keys: Key,
  ): Promise<StorageReadResult<Schema, Key>>;
  set(values: StorageWritePatch<Schema>): Promise<void>;
}

export type CountdownStorageAdapter = LocalStorageAdapter<CountdownStorageSchema>;
