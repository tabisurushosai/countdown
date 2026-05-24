import type {
  CountdownStorageAdapter,
  CountdownStorageKey,
  CountdownStoragePatch,
  CountdownStorageReadResult,
} from './storageAdapter';

export const chromeLocalStorageAdapter: CountdownStorageAdapter = {
  get<const Key extends readonly CountdownStorageKey[]>(
    keys: Key,
  ): Promise<CountdownStorageReadResult<Key>> {
    return new Promise((resolve) => {
      chrome.storage.local.get([...keys], (result) => {
        resolve(result as CountdownStorageReadResult<Key>);
      });
    });
  },
  set(values: CountdownStoragePatch): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set(values, () => {
        resolve();
      });
    });
  },
};
