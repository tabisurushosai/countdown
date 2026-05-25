import { describe, expect, it } from 'vitest';

import type { Deadline } from '../../src/core/types';
import { createCountdownStorage } from '../../src/storage/deadlineStorage';
import type {
  CountdownStorageAdapter,
  CountdownStorageSchema,
  StorageKeyList,
  StorageReadResult,
} from '../../src/storage/storageAdapter';

function createMemoryStorageAdapter(
  initialValues: Partial<CountdownStorageSchema> = {},
): CountdownStorageAdapter {
  let values: Partial<CountdownStorageSchema> = { ...initialValues };

  return {
    async get<const Key extends StorageKeyList<CountdownStorageSchema>>(
      keys: Key,
    ): Promise<StorageReadResult<CountdownStorageSchema, Key>> {
      const result = keys.reduce<Partial<CountdownStorageSchema>>((selected, key) => {
        if (Object.prototype.hasOwnProperty.call(values, key)) {
          return { ...selected, [key]: values[key] };
        }
        return selected;
      }, {});

      return result as StorageReadResult<CountdownStorageSchema, Key>;
    },
    async set(patch): Promise<void> {
      values = { ...values, ...patch };
    },
  };
}

describe('createCountdownStorage', () => {
  it('returns portable defaults when storage keys are missing', async () => {
    const storage = createCountdownStorage(createMemoryStorageAdapter());

    await expect(storage.getDeadlines()).resolves.toEqual([]);
    await expect(storage.getCountdownSnapshot()).resolves.toEqual({
      deadlines: [],
      isPremium: false,
      trialStartTs: undefined,
    });
  });

  it('preserves the shared storage keys and value shapes through the adapter', async () => {
    const storage = createCountdownStorage(createMemoryStorageAdapter());
    const deadlines: Deadline[] = [
      { id: 'deadline-1', name: 'Release', date: '2026-05-25', repeat: 'weekly' },
    ];

    await storage.setDeadlines(deadlines);
    await storage.setPremium(true);
    await expect(storage.ensureTrialStart(1_771_891_200_000)).resolves.toBe(1_771_891_200_000);

    await expect(storage.getCountdownSnapshot()).resolves.toEqual({
      deadlines,
      isPremium: true,
      trialStartTs: 1_771_891_200_000,
    });
  });

  it('keeps an existing trial start timestamp unchanged', async () => {
    const storage = createCountdownStorage(
      createMemoryStorageAdapter({ trial_start_ts: 1_771_804_800_000 }),
    );

    await expect(storage.ensureTrialStart(1_771_891_200_000)).resolves.toBe(1_771_804_800_000);
    await expect(storage.getCountdownSnapshot()).resolves.toMatchObject({
      trialStartTs: 1_771_804_800_000,
    });
  });
});
